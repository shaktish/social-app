import express, { Response, Request } from "express";

const route = express.Router();

route.get("/health", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "search-service",
    });
});

export default route;
