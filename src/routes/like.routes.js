import { Router } from "express";
import { toggleLike } from "../controller/like.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/toggleLike/:blogId").post(authMiddleware, toggleLike);

export default router;
