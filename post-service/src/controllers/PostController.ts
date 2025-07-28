import { Request, RequestHandler, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import postModel from "../models/PostModel";
import logger from "../utils/logger";
import { PostBodyI, PostUpdateBodyI } from "../types/postType";
import { publishEvent } from "../config/connectRabbitMQ";

const cacheKey = {
  posts: "posts",
};

async function invalidatePostCache(req: Request, input: string) {
  if (!req.redisClient) {
    throw new Error("req.redisClient is undefined");
  }

  const postIdCache = `${cacheKey.posts}:${input}`;
  // removes single post:id from cache
  await req.redisClient.del(postIdCache);

  const keys = await req.redisClient.keys(`${cacheKey.posts}:*`);  
  if (keys && keys.length > 0) {
    // removes all posts from cache
    await req.redisClient.del(keys);
  }
}

// create
const createPost = asyncHandler(
  async (req: Request<{}, {}, PostBodyI>, res: Response) => {
    logger.info("createPost endpoint hit");
    const { content, mediaIds } = req.body;
    const newPost = await postModel.create({
      content,
      mediaIds,
      user: req?.userId,
    });
    await invalidatePostCache(req, newPost._id.toString());
    logger.info(`Post created successfully ${JSON.stringify(newPost)}`);

    await publishEvent("post.created",{
      postId : newPost._id.toString(),
      userId : req.userId,
      content : newPost.content
    });
    
    return res
      .status(201)
      .json({ message: "Post created", success: true, data: newPost });
  }
);

// read all
const getAllPosts = asyncHandler(
  async (
    req: Request<{}, {}, {}, { page: string; limit: string }>,
    res: Response
  ) => {
    logger.info("getAllPosts endpoint hit");
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const cachePostsKey = `${cacheKey.posts}:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cachePostsKey);
    if (cachedPosts) {
      logger.info(`post loaded from cache`);
      return res.status(200).json(JSON.parse(cachedPosts));
    }

    const posts = await postModel
      .find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNoOfPosts = await postModel.countDocuments({ user: userId });
    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      total: totalNoOfPosts,
      success: true,
    };

    // save your posts in redis cache
    await req.redisClient.setex(cachePostsKey, 300, JSON.stringify(result));
    return res.status(200).json(result);
  }
);

// read
const getPost = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    logger.info("getPost endpoint hit");
    const postId = req.params.id;
    if (!postId) {
      logger.info("postId is missing");
      return res.status(400).json({ success: false, message: "id is missing" });
    }
    const postCacheKey = `${cacheKey.posts}:${postId}`;
    const cachedPost = await req.redisClient.get(postCacheKey);
    if(cachedPost) {
      logger.info(`post loaded from cache`);
      return res.status(200).json(JSON.parse(cachedPost));
    }

    const result = await postModel.findOne({ _id: postId, user: req.userId });    
    if (!result) {
      logger.info("post not found");
      return res
        .status(404)
        .json({ success: false, message: "post not found" });
    }

    // save your posts in redis cache
    await req.redisClient.setex(postCacheKey, 300, JSON.stringify(result));
    
    return res.status(200).json({ success: true, data: result });
  }
);

// update
const updatePost = asyncHandler(
  async (req: Request<{ id: string }, {}, PostUpdateBodyI>, res: Response) => {
    logger.info("updatePost endpoint hit");
    const { content, mediaIds } = req.body;
    const userId = req.userId;
    const postId = req.params.id;
    if (!postId) {
      logger.info("postId is missing");
      return res.status(400).json({ success: false, message: "id is missing" });
    }

    const post = await postModel.findOne({ _id: postId, user: req.userId });

    if (!post) {
      logger.info("post not found");
      return res
        .status(404)
        .json({ success: false, message: "post not found" });
    }

    if (content === undefined && mediaIds === undefined) {
      return res
        .status(400)
        .json({ message: "No fields to update provided. Specify content or mediaIds", success: false });
    }

    const updateFields: Record<string, any> = {};
    if (content) {
      updateFields.content = content;
    }
    if (mediaIds) {
      updateFields.mediaIds = mediaIds;
    }

    const result = await postModel.updateOne(
      { _id: postId, user: userId },
      { $set: updateFields }
    );
    await invalidatePostCache(req, postId);
    return res
      .status(200)
      .json({ success: true, message: "Post updated", data: result });
  }
);

// delete
const deletePost = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    logger.info("deletePost endpoint hit");
    const postId = req.params.id;
    const userId = req.userId;

    if (!postId) {
      logger.info("postId is missing");
      return res.status(400).json({ success: false, message: "id is missing" });
    }

    const post = await postModel.findOne({ _id: postId, user: req.userId });

    if (!post) {
      logger.info("post not found");
      return res
        .status(404)
        .json({ success: false, message: "post not found" });
    }

    const result = await postModel.deleteOne({ _id: postId, user: userId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found or already deleted" });
    }

    // publish post delete method -> 
    await publishEvent("post.deleted",{
      postId : post._id.toString(),
      userId : req.userId,
      mediaIds : post.mediaIds
    })
    await invalidatePostCache(req,postId);

    return res.status(200).json({ message: "Post deleted", success: true });
  }
);

export { createPost, getAllPosts, getPost, updatePost, deletePost };
