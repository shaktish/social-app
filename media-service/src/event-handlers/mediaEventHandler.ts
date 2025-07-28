import MediaModel from "../models/MediaModel";
import { deleteMediaFromCloudinary } from "../utils/cloudinary";
import logger from "../utils/logger";

export interface DeletePostEventData {
  postId: string;
  userId: string;
  mediaIds: string[];
}

export const handlePostDeleted = async (
  event: DeletePostEventData | undefined
) => {
  logger.info("handlePostDeleted event received", event);
  try {
    if (event) {
      const { postId, mediaIds } = event;
      const mediaToDelete = await MediaModel.find({ _id: { $in: mediaIds } });

      for (const media of mediaToDelete) {
        await deleteMediaFromCloudinary(media.publicId);
        await MediaModel.findByIdAndDelete(media._id);
        logger.info(
          `Deleted media ${media._id} ${media.publicId} associated with deleted post ${postId}`
        );
      }
      logger.info(`Processed deletion of media for post id ${postId}`);
    }
  } catch (e) {
    console.log(e);
  }
};
