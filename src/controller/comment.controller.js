import { Comment } from "../model/comment.model.js";
import { Blog } from "../model/blog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { blogId } = req.params;

  if (!content) throw new Error("Comment section is empty");
  const findedBlog = await Blog.findById(blogId);
  if (!findedBlog) throw new Error("Blog not found");

  const comment = await Comment.create({
    blog: findedBlog?._id,
    owner: req.user?._id,
    comment: content,
  });
  const confirmCommentCreation = await Comment.findById(comment?._id).populate([
    { path: "blog", select: "_id title content tags" },
    { path: "owner", select: "_id name email" },
  ]);
  if (!confirmCommentCreation) throw new Error("Couldn't create comment");
  const commentPushInBlog = await Blog.findByIdAndUpdate(
    findedBlog,
    {
      $push: {
        comment: confirmCommentCreation?._id,
      },
    },
    { new: true }
  );
  if (!commentPushInBlog) throw new Error("Couldn't createe comment");

  return res.status(200).json({
    msg: "Comment Send",
    confirmCommentCreation,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const findedComment = await Comment.findById(commentId);
  if (!findedComment) throw new Error("Comment not found");
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        isDeleted: true,
      },
    },
    { new: true }
  );
  if (comment.isDeleted !== true) throw new Error("Deletion problem occur");
  return res.status(200).json({
    msg: "comment post deleted successfully",
    comment,
  });
});

export { createComment, deleteComment };
