import express from 'express';
import config from './config/config';
import logger from './utils/logger';
import cors from "cors";
import helmet from 'helmet';
import loggerHandler from './middleware/loggerHandler';
import postRoutes from './routes/PostRoutes';
import globalErrorHandler from './middleware/globalErrorHandler';
import connectDb from './config/connectDb';
import Redis from 'ioredis';
import authenticateRequest from './middleware/authenticateRequest';
import healthChecker from './routes/health';
import { connectRabbitMQ } from './config/connectRabbitMQ';

const redisClient = new Redis(config.redisUrl);
const app = express();
connectDb();
connectRabbitMQ();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(loggerHandler);

app.get('/health', healthChecker)
app.use('/api/post',(req, _res, next)=> {
    req.redisClient = redisClient;
    next();
}, authenticateRequest, postRoutes)

app.use(globalErrorHandler);

app.listen(config.port, () => {
    logger.info(`Post service started at ${config.port}`);
})