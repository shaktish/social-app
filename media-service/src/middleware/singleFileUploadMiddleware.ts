import { Response, Request, NextFunction} from "express";
import multer from "multer";
import logger from "../utils/logger";

const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 5 * 1024 * 1024 // 5mb
    }
}).single('file');

const singleFileUploadMiddleware = (req : Request, res : Response, next : NextFunction) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error("Multer error while uploading", err);
      return res.status(400).json({
        message: "Multer error while uploading",
        error: err.message,
        stack: err.stack,
      });
    } else if (err) {
      logger.error("Unknown error occurred while uploading", err);
      return res.status(500).json({
        message: "Unknown error while uploading",
        error: err.message,
        stack: err.stack,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file found" });
    }

    next();
  });
};

export default singleFileUploadMiddleware