import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import config from "../config/config";
import logger from "./logger";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

interface UploadedFile {
  buffer: Buffer;
}

export const uploadMediaToCloudinary = (
  file: UploadedFile
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (
        err: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (err) {
          logger.error(`Error while uploading media to cloudinary`);
          return reject(err);
        }
        if (!result) {
          return reject(new Error("No result returned from Cloudinary."));
        }

        return resolve(result);
      }
    );
    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const deleteMediaFromCloudinary = async (publicId:string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    logger.info(`Media deleted successfully from cloud storage ${publicId}` )
    return result;
  } catch (e) {
    logger.error(`Error Deleting media from cloudinary ${e}`);
    throw e
  }
};
