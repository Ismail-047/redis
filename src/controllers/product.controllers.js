import redis from "../lib/redis.js";
import Product from "../models/products.model.js";
import { generateRedisCacheKey } from "../utlis/generate-cache-key.js";
import { sendRes } from "../utlis/response-helper.js";

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

export const getAllProductsWithRedis = async (req, res) => {
     const redisCacheKey = generateRedisCacheKey(req);
     const cachedData = await redis.get(redisCacheKey);

     if (cachedData) {
          console.log("Cache hit");
          return sendRes(res, 200, "All products fetched successfully", JSON.parse(cachedData));
     }

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