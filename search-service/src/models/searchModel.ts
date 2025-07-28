import mongoose, { Schema } from "mongoose";

const SearchSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index:true
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SearchSchema.index({content:"text"});
SearchSchema.index({createdAt:-1});

export default mongoose.model("SearchPost", SearchSchema);
