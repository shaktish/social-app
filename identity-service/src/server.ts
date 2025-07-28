import express, { Express, NextFunction, Request, Response } from "express";
import config from "./config/config";
import logger from "./utils/logger";
import helmet from "helmet";
import cors from "cors";
import connectDb from "./config/connectDb";
import loggerHandler from "./middleware/loggerHandler";
import Redis from "ioredis";
import { createRateLimiter, rateLimiterMiddleware } from "./middleware/rateLimitHandler";
import identityRoutes  from "./routes/identityRoute";
import globalErrorHandler from "./middleware/globalErrorHandler";
import healthChecker from "./routes/health";

const app: Express = express();
const redisClient = new Redis(config.REDIS_URL);

connectDb();
// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(loggerHandler);
//DDOS protection and rate limiting
const authLimiter = rateLimiterMiddleware(createRateLimiter(redisClient, 50, 15 * 60));
const globalLimiter = rateLimiterMiddleware(createRateLimiter(redisClient, 10, 1));

app.use('/api/auth/', authLimiter, identityRoutes);
app.get('/health', healthChecker)

app.use((req:Request, res:Response, next:NextFunction) => {
  // skip global limiter for auth routes
  if (req.originalUrl.startsWith('/api/auth')) {
    return next();
  }
  return globalLimiter(req, res,next);
});
app.use(globalErrorHandler)

app.listen(config.port, () => {
  logger.info(`Identity Service running on PORT ${config.port} started`);
});

process.on("unhandledRejection", (reason, promise)=> {
    logger.error(`Unhandled rejection at promise : ${promise} reason : ${reason}`)
})