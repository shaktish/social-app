import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AppError } from "./appError";
import config from "../config/config";

export const globalErrorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isDevelopmentEnv = config.env === "development";
  logger.error(err.stack);
  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
      ...(isDevelopmentEnv && { stack: err.stack }),
    });
  }
  return res
    .status(500)
    .json({
      message: "Internal server error",
      ...(isDevelopmentEnv && { stack: err.stack }),
    });
};
