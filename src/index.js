import dotenv from "dotenv";
dotenv.config({
    path: ".env"
});

import express from "express";
import connectDB from "./db/db.js";
import redis from "./lib/redis.js";

// APP
const app = express();

// MIDDLEWARE
app.use(express.json());

// ROUTES
import productRoutes from "./routes/product.routes.js";
app.use("/api/v1/products", productRoutes);

// CONNECT REDIS
await redis.connect();

// CONNECT MONGODB
connectDB().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    })
})