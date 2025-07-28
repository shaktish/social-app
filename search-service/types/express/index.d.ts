import { Request } from 'express';
import Redis from 'ioredis';

declare global {
  namespace Express {  
    interface Request {
      redisClient:Redis.Redis
      userId?: string;
    }
  }
}