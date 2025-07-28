import { NextFunction, Request, Response } from "express";
import { PostBodyI } from "../types/postType";
import { createPostSchema } from "../validations/post.schema";

/**
 * Middleware to validate the request body for creating a post.
 * Validates against the createPostSchema (Joi).
 */

const validatePostBody = (
  req: Request<{}, {}, PostBodyI>,
  res: Response,
  next: NextFunction
) => {
  const { error } = createPostSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export { validatePostBody };
