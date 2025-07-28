import { NextFunction, Request, Response } from "express";

const healthChecker = (req:Request, res:Response, next:NextFunction)=>{
    res.send("ok");
}

export default healthChecker;