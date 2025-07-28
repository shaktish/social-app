import { NextFunction, Response, Request } from "express";
import logger from "../utils/logger";

const loggerHandler = (req:Request, _res:Response, next:NextFunction) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body ${req.body}`);
    next();
}

export default loggerHandler;