import { Like } from "../model/like.model.js";
import { Blog } from "../model/blog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error("Blog not found");
  const existedLike = await Like.findOne({
    blog: blogId,
    owner: req.user?._id,
  });

  if (existedLike) {
    const existedLikes_id = existedLike?._id;
    await Like.findByIdAndDelete(existedLikes_id);

    const unlikeVideoFromVideoModel = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: {
          likes: existedLikes_id,
        },
      },
      { new: true }
    )
      .select("title content tags comment likes")
      .populate([
        {
          populate: [
            {
              path: "likes",
              select: "owner",
              populate: { path: "owner", select: "name email" },
            },
            {
              path: "comment",
              select: "comment owner",
            },
            {
              path: "owner", // blog ka owner
              select: "name email",
            },
          ],
        },
      ]);
    if (!unlikeVideoFromVideoModel)
      throw new Error("Unlike couldn't completed");
    return res
      .status(200)
      .json({ msg: "Unlike success", unlikeVideoFromVideoModel });
  } else {
    const newLike = await Like.create({
      blog: blogId,
      owner: req.user?._id,
    });
    await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: {
          likes: newLike?._id,
        },
      },
      { new: true }
    );

    const confirmLikes = await newLike.populate([
      {
        path: "blog",
        select: "title content tags comment likes",
        populate: [
          {
            path: "likes",
            select: "owner",
            populate: { path: "owner", select: "name email" },
          },
          {
            path: "comment",
            select: "comment owner",
            populate: { path: "owner", select: "name email" },
          },
          {
            path: "owner", // blog ka owner
            select: "name email",
          },
        ],
      },
      {
        path: "owner", // like ka owner
        select: "name email",
      },
    ]);
    if (!confirmLikes) throw new Error("Like couldn't completed");
    return res.status(200).json({ msg: "Like success", confirmLikes });
  }
});

export { toggleLike };
