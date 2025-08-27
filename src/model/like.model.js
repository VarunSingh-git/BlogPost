import { Schema, model } from "mongoose";

const likeSchema = new Schema({
  comment: {
    type: Schema.Types.ObjectId,
    ref: "comment",
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "blog",
  },
});

export const Like = model("Like", likeSchema);
