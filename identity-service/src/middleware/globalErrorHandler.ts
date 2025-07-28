import { Response, Request, NextFunction, ErrorRequestHandler } from "express";
import logger from "../utils/logger";

interface AppError extends Error {
  status?: number;
}

const globalErrorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.stack);
  res
    .status(err.status ?? 500)
    .json({ message: err.message || "Internal server error" });
};

export default globalErrorHandler;
