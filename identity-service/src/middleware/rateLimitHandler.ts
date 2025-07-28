import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import logger from "../utils/logger";

const createRateLimiter = (client: Redis, points = 10, duration = 1) => {
  return new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "auth-middleware",
    points: points, // allow 10 request
    duration: duration, // per 1 second
  });
};

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
