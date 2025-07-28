import { NextFunction, Request, Response } from "express";

type AsyncHandlerI<P = any, ResBody = any, ReqBody = any, ReqQuery = any> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncHandlerI) => (req : Request, res : Response, next:NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
} 

export default asyncHandler;