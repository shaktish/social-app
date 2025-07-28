import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    logger.info("Access attempted w/o user id");
    res
      .status(401)
      .json({ success: false, message: "Auth require, please signin" });
  } else {
    req.userId = userId as string;
    next();
  }
};

export default authenticateRequest;
