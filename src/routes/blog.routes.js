import { Router } from "express";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishToggle,
  getAllBlogPost,
  getBlogPostById,
  searchPost
} from "../controller/blog.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/createBlog").post(authMiddleware, createBlogPost);

router.route("/updateBlog/:blogId").patch(authMiddleware, updateBlogPost);

router.route("/deleteBlog/:blogId").patch(authMiddleware, deleteBlogPost);

router.route("/publishToggle/:blogId").patch(authMiddleware, publishToggle);

router.route("/getAllBlog/:userId").get(authMiddleware, getAllBlogPost);

router.route("/getBlogPostById/:blogId").get(authMiddleware, getBlogPostById);

router.route("/searchPost").get(authMiddleware, searchPost);

export default router;
