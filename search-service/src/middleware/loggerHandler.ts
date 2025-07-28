import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export const loggerHandler = (req:Request, res:Response, next : NextFunction) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body ${req.body}`);
    next();
}