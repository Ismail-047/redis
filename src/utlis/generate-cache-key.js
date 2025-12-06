import crypto from "crypto";
/**
 *  GENERATES A DETERMINISTIC REDIS CACHE KEY FROM REQUEST PATH AND QUERY PARAMETERS
 *  ENSURES IDENTICAL REQUESTS PRODUCE IDENTICAL KEYS FOR CACHE HITS.
 * 
 *  - NORMALIZES PATH: /api/v1/products → cache:api:v1:products
 *  - SORTS AND ENCODES QUERY PARAMS FOR CONSISTENCY
 *  - HASHES KEYS EXCEEDING 256 CHARS TO PREVENT REDIS PERFORMANCE DEGRADATION
 * 
 *  EXAMPLE 1:
 *        URL: /api/v1/products
 *        KEY: cache:api:v1:products
 * 
 *  EXAMPLE 2:
 *        URL: /api/v1/products?category=electronics&limit=10
 *        KEY: cache:api:v1:products:category=electronics&limit=10
 * 
 *   EXAMPLE 3: (IMAGINE A LONG KEY 300+ CHARS)
 *        URL: /api/v1/products?filter=electronics&category=phones&brand=apple&sort=price&order=desc&page=1&limit=50&fields=id,name,price,description,images,ratings...
 *        
 *        BECOMES:
 *        KEY: cache:api:v1:products:h:a3f2b8c91d4e7f06
 * 
 *  @param {Request} req - EXPRESS REQUEST OBJECT
 *  @param {string} prefix - CACHE NAMESPACE (DEFAULT: 'cache')
 *  @returns {string} REDIS-COMPATIBLE CACHE KEY
 */
export function generateRedisCacheKey(req, prefix = "cache") {

  const path = req.path
    .replace(/^\/+|\/+$/g, "") // REPLACE LEADING AND TRAILING SLASHES
    .replace(/\//g, ":"); // REPLACE INBETWEEN SLASHES WITH COLONS

  const queryString = Object.keys(req.query) // GETS ALL QUERY PARAMETER NAMES AS AN ARRAY.
    .sort() // ALPHABETICALLY SORTS THE KEYS.
    .map((key) => {
      const value = req.query[key]; // TRANSFORMS EACH KEY INTO A KEY=VALUE STRING.
      // GRABS THE VALUE. COULD BE A STRING OR AN ARRAY (IF SAME PARAM APPEARS MULTIPLE TIMES).
      const normalized = Array.isArray(value)
        ? value.map(String) // ENSURES ALL ELEMENTS ARE STRINGS: ['3', '1', '2']
          .sort() // SORTS THEM: ['1', '2', '3']
          .join(",") // JOINS: '1,2,3'
        : String(value);

      // ESCAPES SPECIAL CHARACTERS. ?filter=a:b → filter=a%3Ab (breaks : delimiter)
      return `${encodeURIComponent(key)}=${encodeURIComponent(normalized)}`;
    }
    )
    .join("&");

  const key = queryString
    ? `${prefix}:${path}:${queryString}`
    : `${prefix}:${path}`;

  // REDIS MAX KEY LENGTH IS 512MB BUT YOU WANT KEYS SCANNABLE AND DEBUGGABLE
  if (key.length > 256) {

    const hash = crypto
      .createHash("sha256") // CREATES A SHA-256 HASHER
      .update(key) // FEEDS THE FULL KEY STRING INTO IT
      .digest("hex") // CONVERTS THE HASH TO A HEX STRING (64 CHARACTERS)
      .slice(0, 16); // TAKES JUST THE FIRST 16 CHARACTERS (ENOUGH FOR UNIQUENESS)

    return `${prefix}:${path}:h:${hash}`;
  }

  return key;
}

// export function generateRedisCacheKey(req, prefix = 'cache') {
//
//     const path = req.path.replace(/^\/+|\/+$/g, '').replace(/\//g, ':');
//
//     const queryString = Object.keys(req.query).sort()
//         .map(key => {
//             const value = req.query[key];
//             const normalized = Array.isArray(value)
//                 ? value.map(String).sort().join(',')
//                 : String(value);
//             return `${encodeURIComponent(key)}=${encodeURIComponent(normalized)}`;
//         }).join('&');
//
//     const key = queryString ? `${prefix}:${path}:${queryString}` : `${prefix}:${path}`;
//
//     if (key.length > 256) {
//         const hash = crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
//         return `${prefix}:${path}:h:${hash}`;
//     }
//
//     return key;
// }