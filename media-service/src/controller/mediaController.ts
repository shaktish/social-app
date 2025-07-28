import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import logger from "../utils/logger";
import { uploadMediaToCloudinary } from "../utils/cloudinary";
import MediaModel from "../models/MediaModel";


export const uploadMedia = asyncHandler(
  async (
    req: Request<{}, {}, {}, {}> & { file?: Express.Multer.File },
    res: Response
  ) => {
    logger.info("Starting media upload");
    if (!req?.file) {
      return res.status(400).json({
        success: false,
        message: "No file found. Please add a file and  try again",
      });
    }
    const { originalname, mimetype } = req.file;
    const userId = req.userId;
    logger.info(`File details : name =${originalname} type=${mimetype} `);
    logger.info("Uploading to cloudinary starting...");
    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfully, Public Id :${cloudinaryUploadResult.public_id}`
    );
    const newlyCreatedMedia = new MediaModel({
      publicId: cloudinaryUploadResult.public_id,
      userId,
      originalName : originalname,
      mimeType : mimetype,
      url: cloudinaryUploadResult.secure_url,
    });

    await newlyCreatedMedia.save();
    res
      .status(201)
      .json({
        success: true,
        mediaId: `${newlyCreatedMedia.id}`,
        url: newlyCreatedMedia.url,
      });
  }
);

export const getAllMedia = asyncHandler(async(req:Request, res : Response) => {
  const results = await MediaModel.find({});
  return res.json(results);
})