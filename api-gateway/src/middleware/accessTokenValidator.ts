import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import config from "../config/config";

const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info("authenticateJWT had hit from api-gateway service");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access Token missing" });
    return;
  }

  const token = authHeader?.split(" ")[1] || "";
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {id : string};
    logger.info(`decoded ${JSON.stringify(decoded)}`);
    req.user = decoded;
    next();
  } catch (e) {
    if (e instanceof Error) {
      logger.warn(e.message);
      res.status(403).json({ message: "Invalid token" });
    } else {
      logger.warn("Unknown error occurred");
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export { authenticateJWT };
