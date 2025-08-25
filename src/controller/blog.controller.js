import { Blog } from "../model/blog.model.js";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formattedName } from "../utils/textFormater.js";

const createBlogost = asyncHandler(async (req, res) => {
  let { title, content, tags } = req.body;
  if (!title || !content || !tags)
    throw new Error("Title, content and tags must needed");
  content = content.toString();
  title = formattedName(title);

  let splittedTags = tags.trim().split(" ");
  if (!splittedTags.every((tag) => /^#[^#].*/.test(tag)))
    throw new Error("Tag must start with Hashtag");

  const createBlog = await Blog.create({
    content: content,
    title: title,
    likes: [],
    owner: req.user?._id,
    tags: splittedTags,
  });

  const confirmationForBlogCreation = await Blog.findById(
    createBlog?._id
  ).populate({
    path: "owner",
    select: "name email",
  });

  if (!confirmationForBlogCreation) throw new Error("Internal Server Error..!");
  return res
    .status(200)
    .json({ msg: "Blog create successfully", confirmationForBlogCreation });
});

const updateBlogPost = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  let { content, title, tags } = req.body;

  if (content) content = content.toString();
  if (title) title = formattedName(title);

  console.log(content, title);

  const blog = await Blog.find({ _id: blogId, isDeleted: false });
  if (!blog) throw new Error("Blog not found");

  if (blog.title === title && blog.content === content)
    throw new Error("No change detect in data");
  const updatedBlog = await Blog.findByIdAndUpdate(
    blogId,
    {
      ...(title && { title }),
      ...(content && { content }),
      ...(tags && { tags: tags.trim().split(" ") }),
    },
    {
      new: true,
    }
  );

  console.log("updatedBlog", updatedBlog);
  if (!updatedBlog)
    throw new Error("Blog can't update due to internal server error");

  res.status(200).json({ msg: "Data updated...!!", updatedBlog });
});

const deleteBlogPost = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const findedBlog = await Blog.findById(blogId);
  if (!findedBlog) throw new Error("Blog not found");
  const blog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $set: {
        isDeleted: true,
      },
    },
    { new: true }
  );
  if (blog.isDeleted !== true) throw new Error("Deletion problem occur");
  console.log(blog);
  return res.status(200).json({
    msg: "Blog post deleted successfully",
    blog,
  });
});

const getAllBlogPost = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const allBlogs = await Blog.find({
    owner: userId,
    isDeleted: false,
  }).populate({ path: "owner", select: "name email" });
  if (!allBlogs) throw new Error("No post found");
  if (!allBlogs.length) {
    return res.status(200).json({ msg: "No post found" });
  }
  return res.status(200).json({
    msg: `${allBlogs.length} post found`,
    allBlogs,
  });
});
export { createBlogost, updateBlogPost, deleteBlogPost, getAllBlogPost };
