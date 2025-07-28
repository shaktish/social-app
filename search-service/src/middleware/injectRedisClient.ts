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