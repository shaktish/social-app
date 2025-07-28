import { Request } from "express";
import { AppError } from "../middleware/appError";
import Redis from "ioredis";
export const cacheKey = {
  searchPosts  : 'searchPosts'
}


async function invalidateCache  (req:Request, input:string, deleteAll:boolean = false) {
  if(!req.redisClient) {
    throw new AppError("Redis client not found")
  }

  if(!deleteAll) {
    const postIdCache = `${cacheKey.searchPosts}:${input}`
    await req.redisClient.del(postIdCache);
  } else {
    const keys = await req.redisClient.keys(`${cacheKey.searchPosts}:*`)
    if(keys.length > 0) {
      await req.redisClient.del(keys);
    }
  }
}

async function invalidateCacheByRedis  (redisClient:Redis, input:string, deleteAll:boolean = false) {
  if(!redisClient) {
    throw new AppError("Redis client not found")
  }

  if(!deleteAll) {
    const postIdCache = `${cacheKey.searchPosts}:${input}`
    await redisClient.del(postIdCache);
  } else {
    const keys = await redisClient.keys(`${cacheKey.searchPosts}:*`)
    if(keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}

export {
    invalidateCache,
    invalidateCacheByRedis
}