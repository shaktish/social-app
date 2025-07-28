import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import logger from "../utils/logger";
import searchModel from "../models/searchModel";
import { AppError } from "../middleware/appError";
import { cacheKey } from "../utils/redisCache";

interface SearchQuery {
  search?: string;
}

const search = asyncHandler(
  async (req: Request<{}, {}, {}, SearchQuery>, res: Response) => {
    const { search } = req.query;
    const userId = req.userId;
    let query: {
      userId: string | undefined;
      $text?: { $search: string };
    } = { userId };
    let projection = {};
    let sortOption = {};

    const cacheSearchPostsKey = `${cacheKey.searchPosts}:${search}`;
    const cachedPosts = await req.redisClient.get(cacheSearchPostsKey);
    if (cachedPosts) {
      logger.info(`search post loaded from cache`);
      return res.status(200).json(JSON.parse(cachedPosts));
    }
    if (search) {
      query.$text = { $search: search };
      projection = { score: { $meta: "textScore" } };
      sortOption = { score: { $meta: "textScore" } };
    }

    const result = await searchModel
      .find(query, projection)
      .sort(sortOption)
      .limit(10);

    logger.info(`Search query received: ${search}`);
    await req.redisClient.setex(cacheSearchPostsKey, 300, JSON.stringify(result));
    return res.status(200).json({ success: "true", data: result });
  }
);

export { search };
