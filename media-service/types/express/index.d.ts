import { Request } from "express";
import Redis from "ioredis";

declare global {
  namespace Express {
    interface Request {
      redisClient: Redis.Redis;
      userId?: string;
    }
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}
