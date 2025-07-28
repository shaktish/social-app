import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mediaIds: [{ type: String }],
}, {timestamps:true});

// bcoz we will be having a different service for search
postSchema.index({content:"text"});

export default mongoose.model('Post', postSchema);
