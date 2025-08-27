import { Schema, model } from "mongoose";

const commentSchema = new Schema({
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Comment = model("Comment", commentSchema);
