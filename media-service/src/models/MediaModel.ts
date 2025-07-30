import mongoose, { Schema } from "mongoose";

const mediaSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    publicId: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
