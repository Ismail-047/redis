# Redis vs MongoDB Caching Benchmark

This project demonstrates and benchmarks the performance difference between fetching data directly from MongoDB versus using Redis as a caching layer. It includes a Node.js/Express application and scripts to run load tests using `autocannon`.

## Prerequisites

Ensure you have the following installed and running on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Default port: 27017)
- [Redis](https://redis.io/) (Default port: 6379)

If you don't have MongoDB or Redis installed locally, run them via Docker:
```bash
docker run -d --name mongo -p 27017:27017 mongo
docker run -d --name redis -p 6379:6379 redis
```

## Setup

1. **Clone the repository:**
```bash
    git clone https://github.com/Ismail-047/redis.git
    cd redis
```

2. **Install dependencies:**
```bash
    npm install
```

3. **Configure Environment Variables:**
    Create a `.env` file in the root directory by copying the sample file:
```bash
    cp .env.sample .env
```
4. **Seed the Database:**
    Import the sample product data into MongoDB before starting the application:
```bash
    mongoimport --uri "mongodb://localhost:27017/redis-cache" --collection products --file products.json --jsonArray
```
    
If using Docker, copy the file into the container first:
```bash
    docker cp products.json mongo:/products.json
    docker exec mongo mongoimport --uri "mongodb://localhost:27017/redis-cache" --collection products --file /products.json --jsonArray
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`.

## Benchmarking

This project includes two benchmark scripts to compare performance. Make sure the server is running in a separate terminal before executing these scripts.

### 1. Benchmark with Redis Caching
Run the benchmark that requests the endpoint using Redis for caching:
```bash
node src/benchmark-with-redis.js
```

### 2. Benchmark without Redis
Run the benchmark that requests the endpoint fetching directly from MongoDB every time:
```bash
node src/benchmark-without-redis.js
```

## Benchmark Results

For a detailed performance comparison including latency metrics, and throughput analysis see:

📊 **[Redis Comparison Results.pdf](./1.%20Redis%20Comparison%20Results.pdf)**

## Project Structure

- `src/index.js`: Main application entry point, sets up Express, connects to DBs.
- `src/benchmark-with-redis.js`: Autocannon script testing the Redis-cached route.
- `src/benchmark-without-redis.js`: Autocannon script testing the direct MongoDB route.
- `src/lib/redis.js`: Redis client configuration.
- `src/db/db.js`: MongoDB connection setup.
- `products.json`: Sample product data for seeding the database.
- `1. Redis Comparison Results.pdf`: Detailed benchmark comparison report.