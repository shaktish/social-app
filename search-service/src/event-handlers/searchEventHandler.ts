import Redis from "ioredis";
import { AppError } from "../middleware/appError";
import searchModel from "../models/searchModel";
import logger from "../utils/logger";
import { invalidateCacheByRedis } from "../utils/redisCache";

export interface CreatePostEventData {
  postId: string;
  userId: string;
  content: string;
}

export interface DeletePostEventData {
  postId: string;
  userId: string;
}

export const handleCreatePost = async (
  event: CreatePostEventData | undefined,
  redisClient : Redis
) => {
  logger.info("handleCreatePost event received", event);
  try {
    if (event) {
      const newSearchPost = new searchModel(event);
      const savedSearchPost = await searchModel.create(newSearchPost);
      logger.info(
        `Created post for search, post id ${event.postId} savedSearchPost ${savedSearchPost._id}`
      );
      invalidateCacheByRedis(redisClient,'',true);
    }
  } catch (e) {
    console.log(e);
  }
};

export const handlePostDeleted = async (
  event: DeletePostEventData | undefined
) => {
  logger.info("handlePostDeleted event received", event);
  try {
    if (event) {
      const { postId, userId } = event;
      const searchPostToDelete = await searchModel.findOneAndDelete({
        postId,
        userId,
      });
      if (searchPostToDelete) {
        logger.info(`Processed deletion of media for post id ${postId}`);
      } else {
        logger.info("No matching document found.");
      }
    }
  } catch (e: any) {
    logger.error("❌ Error in handlePostDeleted:", e);

    throw new AppError(e.message || "Unknown error");
  }
};
