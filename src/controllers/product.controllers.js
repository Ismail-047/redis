import redis from "../lib/redis.js";
import Product from "../models/products.model.js";
import { generateRedisCacheKey } from "../utlis/generate-cache-key.js";
import { sendRes } from "../utlis/response-helper.js";

// GET PRODUCTS FROM MONGODB ON EVERY REQUEST
export const getAllProductsWithOutRedis = async (req, res) => {

     try {
          const products = await Product.find();

          if (!products) return sendRes(res, 404, "No products found");

          return sendRes(res, 200, "All products fetched successfully", products);

     } catch (error) {
          console.log(error);
          return sendRes(res, 500, "Internal server error");
     }
}

// GET PRODUCTS FROM MONGODB ONCE AND THEN FROM REDIS ON EVERY REQUEST (UNTIL CACHE EXPIRES OR INVALIDATES)
export const getAllProductsWithRedis = async (req, res) => {
     const redisCacheKey = generateRedisCacheKey(req, "api:v1:products");
     const cachedData = await redis.get(redisCacheKey);

     if (cachedData) {
          console.log("Cache hit");
          return sendRes(res, 200, "All products fetched successfully", JSON.parse(cachedData));
     }
     console.log("Cache miss");

     try {
          const products = await Product.find();
          if (!products) return sendRes(res, 404, "No products found");

          await redis.set(redisCacheKey, JSON.stringify(products));

          return sendRes(res, 200, "All products fetched successfully", products);

     } catch (error) {
          console.log(error);
          return sendRes(res, 500, "Internal server error");
     }
}

// UPDATE PRODUCT NAME AND INVALIDATE CACHE PROGRAMATICALLY
export const updateProductName = async (req, res) => {
     try {
          const { id } = req.params;
          const { name } = req.body;

          const product = await Product.findByIdAndUpdate(id, { name }, { new: true });

          if (!product) return sendRes(res, 404, "Product not found");

          // GET ALL REDIS KEYS THAT ARE RELATED TO PRODUCTS
          const keys = await redis.keys("api:v1:products*");
          if (keys.length > 0) {
               await redis.del(keys);
               console.log("PRODUCT CACHE INVALIDATED");
               console.log("KEY PATTERN: api:v1:products*");
          }

          return sendRes(res, 200, "Product name updated successfully", product);
     } catch (error) {
          console.log(error);
          return sendRes(res, 500, "Internal server error");
     }
}