- [Express typescript project setup](#express-typescript-project-setup)
  - [Dependencies](#dependencies)
    - [common core dependencies](#common-core-dependencies)
    - [🔌 Additional Core Dependency](#-additional-core-dependency)
    - [🔒 Security \& DB Utilities](#-security--db-utilities)
    - [🛠️ TypeScript \& Development Tools](#️-typescript--development-tools)
  - [Utils](#utils)
    - [winston logger](#winston-logger)
    - [AppError](#apperror)
    - [Global Error Handler](#global-error-handler)
    - [AsyncHandler](#asynchandler)
    - [Logger handler](#logger-handler)
    - [ConnectDb](#connectdb)
    - [dotEnv](#dotenv)
    - [health route](#health-route)
  - [Server.ts](#serverts)
- [IO Redis](#io-redis)
  - [setting up redis client](#setting-up-redis-client)
  - [Add req.redisClient to Express types](#add-reqredisclient-to-express-types)
  - [Inject Redis Client into Express req](#inject-redis-client-into-express-req)
  - [Final Thoughts](#final-thoughts)
- [Rate Limiter using Redis](#rate-limiter-using-redis)
  - [setting up](#setting-up)
- [RabbitMQ](#rabbitmq)
  - [Why Use RabbitMQ?](#why-use-rabbitmq)
  - [Core Concepts](#core-concepts)
  - [Understand Exchange Types First](#understand-exchange-types-first)
    - [Use 1 Queue](#use-1-queue)
    - [Use Multiple Queues (Same Message Goes to Many Services)](#use-multiple-queues-same-message-goes-to-many-services)
    - [Use Direct Exchange with Routing Keys](#use-direct-exchange-with-routing-keys)
    - [Use Topic Exchange for Flexible Routing](#use-topic-exchange-for-flexible-routing)
  - [Decision Tree](#decision-tree)
  - [installation](#installation)
- [JWT Authentication in Node.js with Express \& TypeScript](#jwt-authentication-in-nodejs-with-express--typescript)
  - [🔐 Authentication Flow Summary](#-authentication-flow-summary)
  - [Tokens You Use](#tokens-you-use)
    - [🔐Access Token](#access-token)
    - [🔐Used for authenticated API requests](#used-for-authenticated-api-requests)
  - [Key Components in Your Code](#key-components-in-your-code)
    - [🔁 Refresh Token Model (DB Schema)](#-refresh-token-model-db-schema)
    - [Jwt utils](#jwt-utils)
    - [Auth code](#auth-code)
    - [userModel](#usermodel)
    - [validation](#validation)


# Express typescript project setup
- init package.json
  - install dependencies 
  - update scripts 
- setup typescript config 
- server.ts
  - create utils
    - configure winston for logging 
    - global error handler
  - create the middleware 
    - loggerHandler  
  - add the following middleware
    - express.json
    - helmet for (XSS attacks)
    - cors    
  - add health check route 
  - add db 
- additional
  - add RabbitMQ for communication btw service
    - connectRabbitMQ
    - make sure to run rabbitMQ server in docker
- folder structure
  - src
    - config.ts 
      - env variables 
      - connectDb
    - server.ts
    - controller
      - health
    - model
    - util
      - logger.ts (winston)
    - middleware
      - appError.ts (AppError type)
      - globalErrorHandler.ts 
      - loggerHandler.ts 
  - types
  - .env

```javascript 
// ts-config 
```js
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "typeRoots": ["./types", "./node_modules/@types"],
    "types": ["node", "express"]
  },
  "include": ["src/**/*.ts"]
}

```
## Dependencies
### common core dependencies 
✅ **Common Core Dependencies**

| Package        | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `express`      | Web server framework                                             |
| `dotenv`       | Load `.env` config variables                                     |
| `cors`         | Enables Cross-Origin Resource Sharing (API access from browsers) |
| `helmet`       | Secures HTTP headers (against XSS, clickjacking etc.)            |
| `winston`      | Advanced logging system                                          |
| `ioredis`      | Redis client for caching, rate-limiting, pub/sub                 |
| `jsonwebtoken` | For generating/verifying JWT tokens                              |
| `joi`          | Schema validation for request bodies/params/headers              |
| `ts-node-dev`  | Auto-reloads TypeScript project on save (for development)        |
| `typescript`   | Enables TypeScript usage                                         |
| `@types/*`     | TypeScript typings for JavaScript libraries                      |
### 🔌 Additional Core Dependency
| Package            | Purpose                              |
| ------------------ | ------------------------------------ |
| express-http-proxy | Proxy HTTP requests to microservices |
### 🔒 Security & DB Utilities

| Package            | Purpose                                                         |
| ------------------ | --------------------------------------------------------------- |
| argon2             | Secure password hashing algorithm                               |
| express-rate-limit | Limits repeated requests from same IP (e.g., login attempts)    |
| rate-limit-redis   | Stores rate limits in Redis (shared across distributed systems) |
| mongoose           | MongoDB ODM (manages schemas, models, queries)                  |


### 🛠️ TypeScript & Development Tools

| Package     | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| @types/*    | TypeScript support for various JavaScript packages          |
| ts-node-dev | Watches and runs TypeScript in development with auto-reload |
| typescript  | TypeScript compiler                                         |
## Utils 

### winston logger 
```javascript 
import winston, { Logger } from "winston";
import config from "../config/config";

/**
 * Create a Winston logger instance.
 * Winston allows multiple transports (console, file, etc.)
 * and different formats for structured logging.
 */
const winstonLogger: Logger = winston.createLogger({
  // Set log level based on environment
  // - In production: only log 'info' and above (info, warn, error)
  // - In development: include 'debug' logs too
  level: config.env === "production" ? "info" : "debug",

  // Combine multiple formats
  format: winston.format.combine(
    winston.format.timestamp(),                // Adds a timestamp to each log
    winston.format.errors({ stack: true }),    // Includes stack trace in error logs
    winston.format.splat(),                    // Enables printf-style string interpolation
    winston.format.json()                      // Output logs in JSON format (great for parsing)
  ),

  // Default metadata for every log entry
  defaultMeta: { service: "api-gateway" },

  // Define where to send the logs
  transports: [
    // Console transport: outputs logs to terminal
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),             // Adds colors to log levels for readability
        winston.format.simple()                // Simplified output (message + level)
      ),
    }),

    // File transport: logs only 'error' level messages into error.log
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),

    // File transport: logs all levels (info, debug, error, etc.) into combined.log
    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
});

export default winstonLogger;
```

### AppError 

```javascript
// ✅ Custom error class for handling operational (expected) errors in your app
// Example usage: throw new AppError("User not found", 404);

class AppError extends Error {
    public readonly statusCode: number;
    // Flag to indicate this is an expected error (not a code bug)
    public readonly isOperational: boolean;

    /**
    * @param message - Error message shown to the user or logged
    * @param statusCode - HTTP status code (defaults to 500 for server errors)
    */
    constructor(message: string, status = 500) {
        // Call the parent Error constructor to set the message
        super(message);
        // 🔧 Fix the prototype chain (important when extending built-in classes like Error)
        // Without this line, "instanceof AppError" may fail in some environments
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = status;
        // Mark the error as "operational" — i.e., it's a known, handled error
        // (not caused by a programming bug)
        this.isOperational = true;
        // 🧩 Captures the stack trace for easier debugging
        // Omits the constructor itself from the trace, so logs are cleaner
        Error.captureStackTrace(this, this.constructor);
    }
}

```
### Global Error Handler 
```javascript 
import { Request, Response, NextFunction } from "express";
import logger from "../utils/winstonLogger"; // Winston instance
import { AppError } from "../utils/AppError";

/**
 * 🌐 Global Error Handling Middleware
 * Handles all application errors consistently and logs them via Winston.
 */
const globalErrorHandler = (
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Determine status and message
  const statusCode = error?.statusCode ?? 500;
  const message = error?.message || "Internal Server Error";

  // ✅ Log detailed error info via Winston
  if (error.isOperational) {
    // Expected / handled errors (e.g., validation, bad input)
    winstonLogger.warn("⚠️ Operational Error", {
      statusCode,
      message,
      stack: error.stack,
    });
  } else {
    // Unexpected / programming or system errors
    winstonLogger.error("💥 Unexpected Error", {
      statusCode,
      message,
      stack: error.stack,
    });
  }

  // ✅ Respond with standardized error payload
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default globalErrorHandler;
```
### AsyncHandler 

```javascript 
import { Request, Response, NextFunction } from "express";

/**
 * Generic type definition for an async Express route handler.
 *
 * P      - type of req.params
 * ResBody - type of response body
 * ReqBody - type of request body
 * ReqQuery - type of query params
 */
type AsyncHandlerI<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>, // Typed request object
  res: Response<ResBody>,                     // Typed response object
  next: NextFunction                           // Next function to pass control
) => Promise<any>;                            // Returns a Promise (async function)

/**
 * asyncHandler wraps an async route handler and automatically forwards any errors
 * to Express's global error handling middleware.
 *
 * This avoids the need to write try/catch blocks in every async route.
 */
const asyncHandler = (fn: AsyncHandlerI) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Wrap the async function in Promise.resolve to catch any rejected promises
  // If the promise rejects, forward the error to next(), which triggers the global error handler
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

// example 
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

app.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
}));
```

### Logger handler 
```javascript 
import { Request, Response, NextFunction } from "express";
import winstonLogger from "../utils/winstonLogger";

/**
 * Request Logger Middleware
 * Logs every incoming request method, URL, and body.
 */
const loggerHandler = (req: Request, _res: Response, next: NextFunction) => {
  // Log the request method and URL
  winstonLogger.info(`📥 Received ${req.method} request to ${req.url}`);

  // Log request body safely (convert to string)
  if (Object.keys(req.body || {}).length > 0) {
    winstonLogger.info(`🧾 Request Body: ${JSON.stringify(req.body)}`);
  }

  next();
};

export default loggerHandler;
```

### ConnectDb 
```javascript 
import mongoose from "mongoose";
import config from "./config";
import logger from "../utils/logger";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const connectDb = async function (
  retries: number = 3,
  delay: number = 3000, 
): Promise<void> {
  try {
    await mongoose.connect(config.MONGO_CONNECTION_URL);
    logger.info("MongoDB connected successfully");
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.error("MongoDB connection error:", e.message);
    } else {
      logger.error("Unknown connection error:", e);
    }
    
    if (retries === 0) {
      logger.error("Exhausted retries. Exiting.");
      process.exit(1);
    } else {
      logger.info(`Retrying in ${delay} ms... Retries left: ${retries}`);
      await wait(delay);
      await connectDb(retries - 1, delay);
    }
  }
};

export default connectDb;
```

### dotEnv 
```javascript 
import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port : number;
    MONGO_CONNECTION_URL : string
    JWT_SECRET : string
    env : string
    REDIS_URL:string
}
const config : Config = {
    port : Number(process.env.PORT) || 5010,
    MONGO_CONNECTION_URL : process.env.MONGO_CONNECTION_URL || '',
    JWT_SECRET : process.env.JWT_SECRET || '',
    env : process.env.NODE_ENV || '',
    REDIS_URL : process.env.REDIS_URL || '',
}

export default config; 
```



### health route 
```javascript 
// src/controllers/health/health.ts
import { Router } from 'express';
const router = Router();

router.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
  });
});

export default router;
```

## Server.ts 
```javascript
import express from 'express';
import helmet from 'helmet';
import cors from "cors";
import { loggerHandler } from './middleware/loggerHandler';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import config from './config/config';
import logger from './utils/logger';
import health from './controllers/health/health';
import connectDb from './config/connectDb';
import { connectRabbitMQ } from './config/connectRabbitMQ';

const app = express();
connectDb();
connectRabbitMQ();
// middlewares
app.use(express.json());
app.use(helmet()); // configure for csp
app.use(cors())
app.use(loggerHandler);

// routes 
app.use(health);


app.use(globalErrorHandler);
app.listen(config.port, ()=>{
    logger.info(`Search service started at ${config.port}`);
})
```
# IO Redis
ioredis is a powerful, performance-focused Redis client for Node.js. It supports:
- Promises out of the box
- Clustering (Redis Cluster)
- Pub/Sub, Streams, and Sentinel
- Efficient handling of high-throughput operations

It is commonly used in Node.js microservices to implement:
- 🔁 Caching (e.g., API responses)
- 🚦 Rate limiting
- 📬 Pub/Sub messaging
- ⚡️ Fast access to frequently used data

In this project, we use ioredis to:
- Cache GET /posts responses for better performance
- Invalidate cache after post creation
- Minimize database load and latency

## setting up redis client
- packages
    - npm install ioredis
    - npm install --save-dev @types/ioredis
- start redis server in wsl terminal  
  `sudo service redis-server start`
- goto server.ts file and start redis client

```javascript
import Redis from "ioredis";
// redis client connects immediately to the Redis server at the given redisUrl.
const redisClient = new Redis(config.redisUrl); // REDIS_URL=redis://localhost:6379
```
## Add req.redisClient to Express types
Create a file like @types/express/index.d.ts:
- This ensures TypeScript knows req.redisClient is safe to access.
```javascript 
// types/express/index.d.ts
import Redis from "ioredis";

declare global {
  namespace Express {
    interface Request {
      redisClient?: Redis;
    }
  }
}
```

##  Inject Redis Client into Express req
- in server.ts file add the redis client to req object so we can implement cache in the controller

```javascript
// injectRedisClient util 

import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";

export const injectRedisClient = (redisClient: Redis) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.redisClient = redisClient;
  next();
};
app.use('/api', injectRedisClient(redisClient), searchRoutes);
```
-  Implementing Cache in Controller  (GET /posts)

```javascript
const cacheKey = {
  posts: "posts",
};

const getAllPosts = asyncHandler(
  async (
    req: Request<{}, {}, {}, { page: string; limit: string }>,
    res: Response
  ) => {
    ...
    const cachePostsKey = `${cacheKey.posts}:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cachePostsKey);
    if (cachedPosts) {
      logger.info(`post loaded from cache`);
      return res.status(200).json(JSON.parse(cachedPosts));
    }
    ... 
    // save the posts in redis cache
    await req.redisClient.setex(cachePostsKey, 300, JSON.stringify(result)); // expires in 300s = 5 mins
    return res.status(200).json(result);
  }
);
// this implements cache for get post request 
// now we invalidate cache when ever we create a post 
```
- lets write a util function to invalidate cache and use it in create post controller 
```javascript 
import { Request } from "express";
import { AppError } from "../middleware/appError";
import Redis from "ioredis";

export const cacheKey = {
  posts  : 'posts'
}


async function invalidateCache  (req:Request, cachePrefix:string, input:string, deleteAll:boolean = false) {
  if(!req.redisClient) {
    throw new AppError("Redis client not found")
  }

  if(!deleteAll) {
    const postIdCache = `${cachePrefix}:${input}`
    await req.redisClient.del(postIdCache);
  } else {
    const keys = await req.redisClient.keys(`${cachePrefix}:*`)
    if(keys.length > 0) {
      await req.redisClient.del(...keys);
    }
  }
}

// Delete one cache entry:
await invalidateCache(req, cacheKey.posts, '1'); // deletes posts:1
// Delete all cache entries with prefix:
await invalidateCache(req, cacheKey.posts, '', true); // deletes all posts:*
```
- whenever user creates a post, we have to delete the post cache 
```javascript 
export const cacheKey = {
  posts  : 'posts'
}

const createPost = asyncHandler(
  async (req: Request<{}, {}, PostBodyI>, res: Response) => {
    ...
    // here 
    await invalidateCache(req, cacheKey.posts, '', true);
    ... 
    return res
      .status(201)
      .json({ message: "Post created", success: true, data: newPost });
  }
);
```

## Final Thoughts
- Redis TTL ensures we don’t serve stale data.
- Invalidate cache on mutations like POST/PUT/DELETE.
- Use structured keys and centralize them in cacheKey.
- Document TTLs, key patterns, and edge cases (pagination, filters).
# Rate Limiter using Redis 
Limit the number of requests per IP to protect against abuse, DoS attacks, or brute-force login attempts.
Rate limiting protects APIs from:
- 🚨 Brute-force attacks
- 🧨 Abuse / DoS
- 🐌 Overload by aggressive client
we need rate-limiter-flexible for Battle-tested, feature-rich rate limiter
## setting up 
- install the dependencies 
    - npm i ioredis rate-limiter-flexible    
- start redis server in wsl terminal  
- Create Redis Client in ```server.ts```
```javascript
  import Redis from 'ioredis';
  const redisClient:Redis = new Redis(config.redisUrl);  // redis://localhost:6379 by default

// optional 
redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("error", (err) => console.error("Redis error", e
```
- now lets first the utils fns for rate limiter 
- rateLimiter.ts 
```javascript
import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import logger from "../utils/logger";

// Create limiter instance
const createRateLimiter = (client: Redis, points = 10, duration = 1) => {
  return new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "auth-middleware", // used for Redis key prefix
    points: points, // # of requests
    duration: duration, // per duration (seconds)
  });
};

// Express middleware wrapper
const rateLimiterMiddleware =
  (limiter: RateLimiterRedis) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await limiter.consume(req.ip ?? "anonymous");
      next();
    } catch (rejRes: unknown) {
      const rateLimiterResponse = rejRes as RateLimiterRes;

      logger.warn(`Rate limit exceeded for IP ${req.ip}`);
      res.set(
        "Retry-After",
        String(Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
      );

      res.status(429).json({ success: false, message: "Too many response" });
    }
  };

export { createRateLimiter, rateLimiterMiddleware };
```
- Apply Middleware in server.ts or Routes
```javascript 
import { createRateLimiter, rateLimiterMiddleware } from "./utils/rateLimiter";
const searchWindowSec = 1 * 60; // 1 minute 
const searchMaxReq = 30; // max req 
const searchRateLimiter = rateLimiterMiddleware(createRateLimiter(redisClient, searchMaxReq, searchWindowSec));

app.use('/api', searchRateLimiter, searchRoutes);
```
# RabbitMQ 
- RabbitMQ is a message broker — it allows services (producers) to send messages that other services (consumers) can receive asynchronously.
- It uses the AMQP protocol (Advanced Message Queuing Protocol).


## Why Use RabbitMQ?
- Decoupling Services
  - Producers and consumers don’t need to know about each other — they communicate via queues.
- Asynchronous Processing
  - Useful for background tasks, like sending emails, processing images, etc.
- Reliability
  - Messages can be persisted, acknowledged, retried, etc.
- Scalability
  - Consumers can be scaled horizontally without modifying producers.

## Core Concepts
Concept	Description
- Producer	Sends messages to a queue
- Consumer	Reads messages from a queue
- Queue	Buffer holding messages until they're consumed
- Exchange	Routes messages to queues based on rules
- Binding	Connects exchanges to queues
- Routing key	Label used for routing decisions in direct/topic exchanges

## Understand Exchange Types First
RabbitMQ uses exchanges to route messages to queues. You don’t usually publish directly to a queue — you publish to an exchange.
Type	    When to Use
- Direct	You want to send a message to a specific queue based on routing key.
- Fanout	You want to broadcast the same message to all bound queues (regardless of routing key).
- Topic	    You want to route messages based on pattern-matching (e.g., post.create, user.login)
- Headers	You want to route messages based on custom headers instead of routing keys (less common).

### Use 1 Queue
- When only one service/process consumes that message.
- No duplication needed.
- Example:
  - Service A sends message to Service B only.
  - Use Direct Exchange with 1 queue.

###  Use Multiple Queues (Same Message Goes to Many Services) 
- When many services need to consume the same message independently.
- You want decoupling.
- Use Fanout Exchange.
### Use Direct Exchange with Routing Keys
- When services want only specific events.
- Queue A gets only user.created
- Queue B gets only post.published
### Use Topic Exchange for Flexible Routing
- Supports wildcards (*, #) for fine-grained matching.
- Example:
    - user.* → all user events
    - post.# → all post-related events, including nested ones like post.created.featured
## Decision Tree 
```javascript
Q1: Do multiple services need to react to the same message?
    → Yes → Use Fanout or Topic → Multiple Queues
    → No  → Use Direct → One Queue

Q2: Do services need filtered messages based on categories?
    → Yes → Use Topic Exchange with pattern keys

Q3: Do you need routing logic based on headers?
    → Yes → Use Headers Exchange (rare)

Q4: Want simplicity and only 1 consumer?
    → Use Direct Exchange + One Queue
```

## installation 
- Install dependencies
```javascript
npm install amqplib
npm install -D @types/amqplib
```
- Setup RabbitMQ Connection 
  - this example is based on Topic exchange, lets write the utils 
```javascript 
import amqp from "amqplib";
import config from "./config";
import logger from "../utils/logger";

const EXCHANGE_NAME = "facebook_events";
let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(config.rabbitMQUrl);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });    

    channel.on("error", (err) => {
      logger.error("RabbitMQ channel error:", err);
    });
    channel.on("close", () => {
      logger.warn("RabbitMQ channel closed");
    });
    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
    });

    logger.info(`Connected to RabbitMQ`);
  } catch (e) {
    logger.error(`Failed to connect to RabbitMQ`, e);
    channel=null;
    process.exit(1);
    
  }
}

export async function publishEvent(routingKey: string, message: any) {
  if (!channel) {
    await connectRabbitMQ();
  }
  if (!channel) {
    throw new Error("RabbitMQ channel not available after connection");
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published: ${routingKey}`);
}

```
- consume event util
```javascript 
export async function consumeEvent(
  routingKey: string,
  cb: (v: any, redisClient:Redis) => void,
  redisClient : Redis,
) {
  if (!channel) {
    await connectRabbitMQ();
  }

  if (!channel) {
    throw new Error("RabbitMQ channel not available after connection");
  }

  const q = await channel.assertQueue("search-service", { exclusive : true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg: ConsumeMessage | null) => {
    if (msg) {
      logger.info('search service msg received');
      const content : CreatePostEventData = JSON.parse(msg.content.toString());
      cb(content, redisClient);
      channel?.ack(msg);
    }
  });
  logger.info(`Subscribed to event ${routingKey}`);
}
```
- write startConsumer util function 
```javascript 
export async function startConsumer(redisClient:Redis) {
  logger.info("startConsumer listening");
  await consumeEvent("post.created", handleCreatePost,redisClient);
  await consumeEvent("post.deleted", handlePostDeleted,redisClient)
}

```
- event handlers of consumer 
```javascript 
export interface CreatePostEventData {
  postId: string;
  userId: string;
  content: string;
}

export const handleCreatePost = async (
  event: CreatePostEventData | undefined,
  redisClient : Redis
) => {
  logger.info("handleCreatePost event received", event);
  try {
    if (event) {
      const newSearchPost = new searchModel(event);
      const savedSearchPost = await searchModel.create(newSearchPost);
      logger.info(
        `Created post for search, post id ${event.postId} savedSearchPost ${savedSearchPost._id}`
      );
      invalidateCacheByRedis(redisClient,'',true);
    }
  } catch (e) {
    console.log(e);
  }
};

```
# JWT Authentication in Node.js with Express & TypeScript 
JWT (JSON Web Token) is a compact, URL-safe way to represent claims between two parties.
- Used for stateless authentication.
- Composed of 3 parts:
- header.payload.signature

## 🔐 Authentication Flow Summary
| Step     | What Happens                                                              |
| -------- | ------------------------------------------------------------------------- |
| Register | User signs up → tokens (access + refresh) are generated and returned      |
| Login    | User logs in with credentials → new tokens are generated                  |
| Refresh  | Client sends refresh token → new tokens issued, old refresh token deleted |
| Logout   | Refresh token is deleted → access token becomes irrelevant on client      |

## Tokens You Use
| **Token Type**    | **Lifetime** | **Stored In**          | **Purpose**                            |
| ----------------- | ------------ | ---------------------- | -------------------------------------- |
| **Access Token**  | Short        | Memory / Cookie        | Sent in `Authorization` header for API |
| **Refresh Token** | Long         | Server-side (Database) | Used to issue new access tokens        |

### 🔐Access Token
- ⏳ Expires quickly (e.g., 15–30 minutes)
- 📦 Typically stored in memory or HTTP-only cookie
- 📤 Sent in the Authorization header

### 🔐Used for authenticated API requests
- 🔄 Refresh Token
- 🕰️ Longer expiry (e.g., 7 days or more)
- 🛡️ Stored securely server-side (e.g., in a database)
- 🔁 Used to generate a new access token when the old one expires

## Key Components in Your Code
✅ 1. Register Endpoint
- Validates request body
- Checks for existing email/username
- Creates user
- Hashes password with argon2
- Issues tokens via generateTokens()
✅ 2. Login Endpoint
- Validates credentials.
- Checks if email exists.
- Verifies password with user.comparePassword().
- Issues fresh tokens
🔁 3. Refresh Token Endpoint
- Takes refreshToken from body.
- Verifies it exists and is not expired.
- Looks up the associated user.
- Issues new access + refresh tokens.
- Deletes the old refresh token.
- 🧼 Important: Always invalidate the old refresh token.
🚪 4. Logout Endpoint
- Deletes the refresh token from the DB.
- Client should discard any access tokens.

### 🔁 Refresh Token Model (DB Schema)
```javascript 
import mongoose, { Schema } from "mongoose";

interface RefreshTokenSchemaI {
    token : string,
    user : mongoose.Types.ObjectId,
    expiresAt : Date, 
}

const refreshTokenSchema = new Schema<RefreshTokenSchemaI>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({expiresAt : 1}, {expireAfterSeconds : 0});

export default mongoose.model('RefreshToken', refreshTokenSchema);
```

### Jwt utils 
```javascript 
import jwt from 'jsonwebtoken';
import { IUser } from '../models/userModel';
import config from '../config/config';
import crypto from 'crypto';
import refreshTokenModel from '../models/refreshTokenModel';

interface JwtPayload {
  id: string;
  email: string;
  userName: string;
}

const generateTokens = async (user:IUser) => {
    const payload : JwtPayload = {
        id:user._id.toString(),
        email:user.email,
        userName:user.userName,
    }
    const accessToken = jwt.sign(payload, config.JWT_SECRET, {expiresIn : "24h"});
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(); 
    expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days

    await refreshTokenModel.create({
        token : refreshToken,
        user: user._id,
        expiresAt,
      });

    return {accessToken, refreshToken};
}

export {
    generateTokens
}
```
### Auth code
```javascript 
import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import logger from "../utils/logger";
import userModel from "../models/userModel";
import refreshTokenModel from "../models/refreshTokenModel";
import { validateLogin, validateRegistration } from "../utils/validation";
import { generateTokens } from "../utils/jwtHelper";
import {
  LoginUserInput,
  RefreshTokenI,
  RegisterUserInput,
} from "../types/identityControllerTypes";

// user registration

const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterUserInput>, res: Response) => {
    logger.info("registerUser called");
    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("Request body is empty or undefined");
      return res
        .status(400)
        .json({ success: false, message: "Request body is required" });
    }
    const { error } = validateRegistration(req.body);

    if (error) {
      const messages = error.details.map((err) => err.message);
      logger.warn("Validation Error", { messages });
      return res.status(400).json({ success: false, message: messages });
    }

    const { email, userName } = req.body;
    // Check if email or userName already exists

    let existingUser = await userModel.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      const errorMessageUserAlreadyExists = "User already exists";
      logger.warn("User already exists", {
        message: errorMessageUserAlreadyExists,
      });
      return res
        .status(400)
        .json({ success: false, message: errorMessageUserAlreadyExists });
    } else {
      // create new user
      const user = new userModel(req.body);
      await user.save();
      logger.info("User created successfully", { email });

      // generate access token
      const { accessToken, refreshToken } = await generateTokens(user);

      logger.info("Refresh token created successfully for the user");
      logger.info({
        message: "Request body",
        body: accessToken,
      });
      return res.status(201).json({
        success: true,
        message: "User created",
        accessToken,
        refreshToken,
      });
    }
  }
);

// user login
const loginUser = asyncHandler(
  async (req: Request<{}, {}, LoginUserInput>, res: Response) => {
    logger.info("LoginUser endpoint hit");
    // validate req body
    const { error } = validateLogin(req.body);
    if (error) {
      const messages = error.details.map((err) => err.message);
      logger.warn("Validation Error", { messages });
      return res.status(400).json({ success: false, message: messages });
    }

    // validate user email in the db
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      logger.warn("Invalid user");
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // validate user password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  }
);

// refresh token

const refreshToken = asyncHandler(
  async (req: Request<{}, {}, RefreshTokenI>, res: Response) => {
    logger.info("RefreshToken endpoint hit");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("RefreshToken missing");
      return res
        .status(400)
        .json({ success: false, message: "Refresh token missing" });
    }
    const storedToken = await refreshTokenModel.findOne({
      token: refreshToken,
    });
    if (!storedToken || storedToken?.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await userModel.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);
    // delete the old refresh token
    await refreshTokenModel.deleteOne({ _id: storedToken._id });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }
);

// logout

const logoutUser = asyncHandler(
  async (req: Request<{}, {}, RefreshTokenI>, res: Response) => {
    logger.info("logout user endpoint hit");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("RefreshToken missing");
      return res
        .status(400)
        .json({ success: false, message: "Refresh token missing" });
    }
    const result = await refreshTokenModel.deleteOne({ token: refreshToken });

    if (result.deletedCount === 0) {
      logger.warn("No matching token found to delete");
      res.status(200).json({ success: false, message: "Invalid token" });
    } else {
      logger.info("Refresh token delete on logout");
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    }
  }
);

export { registerUser, loginUser, refreshToken, logoutUser };

```
### userModel
```javascript 
import mongoose, { HydratedDocument,  Schema, Model} from "mongoose";
import argon2 from "argon2";

export interface IUser {
  userName: string;
  email: string;
  password: string;
  _id:string;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;


const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    userName: {
      type: String,
      required: [true, "User name is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (this:HydratedDocument<IUser>, next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    next(err as Error);
  }
});


userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (e) {
    throw e;
  }
};

userSchema.index({ userName: "text" });

export default mongoose.model<IUser,UserModel>("User", userSchema);

```

### validation
```javascript 
import Joi from 'joi';
import { LoginUserInput, RegisterUserInput } from '../types/identityControllerTypes';

const validateRegistration = (data:RegisterUserInput) => {
    const schema = Joi.object({
        userName : Joi.string().min(3).max(50).required(),
        email : Joi.string().email().required(),
        password : Joi.string().min(6).required(),
    })

    return schema.validate(data, {abortEarly : false});
}

const validateLogin = (data:LoginUserInput) => {
    const schema = Joi.object({
        email : Joi.string().email().required(),
        password : Joi.string().min(6).required(),
    })
    return schema.validate(data, {abortEarly : false});
}

export {
    validateRegistration,
    validateLogin
}
```

🧠 Best Practices
- 🔐 Never store access tokens in localStorage (use memory or HTTP-only cookies).
- 🔁 Store refresh tokens in DB, and rotate them on refresh.
- 🧼 Expire old tokens and delete them.
- 📜 Log all sensitive flows (with caution to avoid logging tokens).
