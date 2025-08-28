import { Blog } from "../model/blog.model.js";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formattedName } from "../utils/textFormater.js";

const createBlogPost = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content || !tags)
    throw new Error("Title, content and tags must needed");
  const finalContent = content.trim().toString();
  const finalTitle = title.trim().toString();
  if (title.length > 100) throw new Error("Title is too long");

  let splittedTags = tags.trim().split(" ");
  if (!splittedTags.every((tag) => /^#[^#].*/.test(tag)))
    throw new Error("Tag must start with Hashtag");

  const createBlog = await Blog.create({
    content: finalContent,
    title: finalTitle,
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

  const blog = await Blog.find({
    _id: blogId,
    isDeleted: false,
    isDrafted: false,
  });
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

  if (!updatedBlog)
    throw new Error("Blog can't update due to internal server error");

  res.status(200).json({ msg: "Data updated...!!", updatedBlog });
});

const deleteBlogPost = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const findedBlog = await Blog.findOne({ _id: blogId, isDrafted: false });
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
  return res.status(200).json({
    msg: "Blog post deleted successfully",
    blog,
  });
});

const publishToggle = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const findedBlog = await Blog.findOne({
    _id: blogId,
    isDeleted: false,
    owner: req.user?._id,
  });
  if (!findedBlog) throw new Error("Blog not found");

  if (findedBlog?.isDrafted === true) {
    const publishedBlog = await Blog.findByIdAndUpdate(
      findedBlog?._id,
      { isDrafted: false },
      { new: true }
    ).populate([
      { path: "owner", select: "name email" },
      {
        path: "comment",
        select: "comment",
        populate: { path: "owner", select: "name email" },
      },
    ]);
    if (!publishedBlog) throw new Error("Published failed");
    return res.status(200).json({ msg: "Blog Published", publishedBlog });
  } else {
    const unpublishedBlog = await Blog.findByIdAndUpdate(
      findedBlog?._id,
      { isDrafted: true },
      { new: true }
    );
    if (!unpublishedBlog) throw new Error("Unpublished failed");
    return res.status(200).json({ msg: "Blog Unpublished", unpublishedBlog });
  }
});

const searchPost = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const searchedContent = await Blog.find({
    isDrafted: false,
    isDeleted: false,
    $or: [
      { tags: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ],
  });
  console.log(searchedContent);
  if (!searchedContent) {
    throw new Error("No content found");
  }
  return res.status(200).json({ msg: "Searched data...", searchedContent });
});

const getBlogPostById = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const findedBlog = await Blog.findOne({
    _id: blogId,
    isDrafted: false,
    isDeleted: false,
  }).populate([
    {
      path: "owner",
      select: "name email",
    },
    {
      path: "comment",
      select: "comment owner",
      match: { isDeleted: false },
      populate: { path: "owner", select: "name email" },
    },
    {
      path: "likes",
      select: "owner",
      populate: [
        {
          path: "owner",
          select: "name email",
        },
      ],
    },
  ]);
  if (!findedBlog) throw new Error("Blog not found");
  return res.status(200).json({ msg: "Here's your blog", findedBlog });
});

const getAllBlogPost = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const findedUser = await User.findById(userId);
  if (!findedUser) throw new Error("User not found");

  const allBlogs = await Blog.find({
    owner: findedUser?._id,
    isDeleted: false,
    isDrafted: false,
  }).populate([
    { path: "owner", select: "name email" },
    {
      path: "comment",
      select: "comment",
      match: {
        isDeleted: false,
      },
      populate: { path: "owner", select: "name email" },
    },
  ]);

  if (!allBlogs) throw new Error("No post found");
  if (!allBlogs.length) {
    return res.status(200).json({ msg: "No post found" });
  }
  return res.status(200).json({
    msg: `${allBlogs.length} post found`,
    allBlogs,
  });
});

export {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishToggle,
  getBlogPostById,
  getAllBlogPost,
  searchPost,
};
