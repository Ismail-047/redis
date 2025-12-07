import express from "express";
import {
    updateProductName,
    getAllProductsWithRedis,
    getAllProductsWithOutRedis,
} from "../controllers/product.controllers.js";

const router = express.Router();

router.get("/get-all-products-with-redis", getAllProductsWithRedis);
router.get("/get-all-products-without-redis", getAllProductsWithOutRedis);

router.patch("/update-product-name/:id", updateProductName);

export default router;
