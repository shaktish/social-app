import { NextFunction, Response } from "express";
import { ProxyOptions } from "express-http-proxy";
import logger from "../utils/logger";

const proxyOptions: ProxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err: Error, res: Response, _next: NextFunction) => {
    logger.error(`Proxy error ${err.message}`);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  },
};

export default proxyOptions;