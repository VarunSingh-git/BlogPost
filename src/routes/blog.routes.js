import { Router } from "express";
import {
  createBlogost,
  updateBlogPost,
  deleteBlogPost,
  getAllBlogPost,
  getBlogPostById,
} from "../controller/blog.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/createBlog").post(authMiddleware, createBlogost);

router.route("/updateBlog/:blogId").patch(authMiddleware, updateBlogPost);

router.route("/deleteBlog/:blogId").patch(authMiddleware, deleteBlogPost);

router.route("/getAllBlog/:userId").get(authMiddleware, getAllBlogPost);

router.route("/getBlogPostById/:blogId").get(authMiddleware, getBlogPostById);

export default router;
