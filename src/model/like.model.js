import { Schema, model } from "mongoose";

const likeSchema = new Schema({
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// blog ke andar like ki _id daalni h
// like ke andar owner ki _id daalni h
export const Like = model("Like", likeSchema);
