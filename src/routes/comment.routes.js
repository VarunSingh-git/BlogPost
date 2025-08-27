import { Router } from "express";
import {
  createComment,
  deleteComment,
  getAllCommentByPost,
} from "../controller/comment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/createComment/:blogId").post(authMiddleware, createComment);
router.route("/deleteComment/:commentId").patch(authMiddleware, deleteComment);
router
  .route("/getAllCommentByPost/:blogId")
  .get(authMiddleware, getAllCommentByPost);

export default router;
