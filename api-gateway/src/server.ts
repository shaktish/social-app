import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import Redis from "ioredis";
import logger from "./utils/logger";
import config from "./config/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { RedisStore, RedisReply } from "rate-limit-redis";
import loggerHandler from "./middleware/loggerHandler";
import globalErrorHandler from "./middleware/globalErrorHandler";
import proxy from "express-http-proxy";
import { RequestOptions } from "https";
import isServiceRunning from "./utils/serviceLiveChecker";
import redisHealthChecker from "./utils/redisHealthChecker";
import { authenticateJWT } from "./middleware/accessTokenValidator";
import proxyOptions from "./config/proxyConfig";

const app = express();
const redisClient = new Redis(config.redisUrl);
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint are limit exceeded for IP : ${req.ip}`);
    res.status(429).json({ success: "false", message: "Too many request" });
  },
  store: new RedisStore({
    sendCommand: (
      ...args: [string, ...(string | number | Buffer)[]]
    ): Promise<RedisReply> => redisClient.call(...args) as Promise<RedisReply>,
  }),
});

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use(loggerHandler);


// setting up proxy for auth
app.use(
  "/v1/auth",
  proxy(config.identityServiceUrl, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOptions: RequestOptions, _srcReq) => {
      proxyReqOptions.headers = {
        ...proxyReqOptions.headers,
        "Content-Type": "application/json",
      };
       return proxyReqOptions; 
    },
    userResDecorator: (proxyRes, proxyResData) => {
      logger.info(
        `Response received from Identity Service ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up proxy for posts
app.use("/v1/post", authenticateJWT, proxy(config.postServiceUrl, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOptions: RequestOptions, srcReq) => {
      proxyReqOptions.headers = {
        ...proxyReqOptions.headers,
        "Content-Type": "application/json",
        "x-user-id" : srcReq.user?.id
      };
       return proxyReqOptions; 
    },
     userResDecorator: (proxyRes, proxyResData) => {
      logger.info(
        `Response received from Post Service ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
}))

// setting up proxy for media
app.use("/v1/media", authenticateJWT, proxy(config.mediaServiceUrl, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOptions: RequestOptions, srcReq) => {
    if(!srcReq.headers['content-type']?.startsWith('multipart/form-data')) {
      proxyReqOptions.headers = {
        ...proxyReqOptions.headers,
        "Content-Type": "application/json",
      };
    }
      proxyReqOptions.headers = {
        ...proxyReqOptions.headers,
        "x-user-id" : srcReq.user?.id
      };
       return proxyReqOptions; 
    },
     userResDecorator: (proxyRes, proxyResData) => {
      logger.info(
        `Response received from Media Service ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
    parseReqBody : false
}))

// setting up proxy for search service
app.use("/v1/search", authenticateJWT, proxy(config.searchServiceUrl, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOptions: RequestOptions, srcReq) => {
      proxyReqOptions.headers = {
        ...proxyReqOptions.headers,
        "Content-Type": "application/json",
        "x-user-id" : srcReq.user?.id
      };
       return proxyReqOptions; 
    },
     userResDecorator: (proxyRes, proxyResData) => {
      logger.info(
        `Response received from Search Service ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
}))

app.use(globalErrorHandler);
app.listen(config.port, () => {
  logger.info(`API Gateway started at ${config.port}`);  
  isServiceRunning(config.identityServiceUrl, 'Identity Service');
  isServiceRunning(config.postServiceUrl, 'Post Service');
  isServiceRunning(config.mediaServiceUrl, 'Media Service');
  isServiceRunning(config.searchServiceUrl, 'Search Service');
  redisHealthChecker(redisClient);  
});
