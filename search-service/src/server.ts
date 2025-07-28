import express from 'express';
import helmet from 'helmet';
import cors from "cors";
import { loggerHandler } from './middleware/loggerHandler';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import config from './config/config';
import logger from './utils/logger';
import health from './controllers/health/health';
import connectDb from './config/connectDb';
import { connectRabbitMQ, startConsumer } from './config/connectRabbitMQ';
import searchRoutes from './routes/search';
import authenticateRequest from './middleware/authenticateRequest';
import Redis from 'ioredis';
import { createRateLimiter, rateLimiterMiddleware } from './utils/rateLimiter';
import { injectRedisClient } from './middleware/injectRedisClient';


const redisClient:Redis = new Redis(config.redisUrl);
const app = express();
connectDb();
connectRabbitMQ();
startConsumer(redisClient);
// middlewares
app.use(express.json());
app.use(helmet()); // configure for csp
app.use(cors())
app.use(loggerHandler);
const searchWindowSec = 1 * 60; // 1 minute 
const searchMaxReq = 30; // max req 
const searchRateLimiter = rateLimiterMiddleware(createRateLimiter(redisClient, searchMaxReq, searchWindowSec));

// routes 
app.use(health);
app.use('/api', injectRedisClient(redisClient), searchRateLimiter, authenticateRequest, searchRoutes);


app.use(globalErrorHandler);
app.listen(config.port, ()=>{
    logger.info(`Search service started at ${config.port}`);
})