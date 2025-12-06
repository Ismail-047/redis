import { createClient } from "redis";

const redis = createClient({
     url: process.env.REDIS_URL || "redis://localhost:6379",
     socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500)
     }
});

redis.on("error", (err) => console.error("Redis error:", err));
redis.on("connect", () => console.log("Redis connected"));

export default redis;