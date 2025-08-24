import { Router } from "express";
import {
  logout,
  login,
  registration,
  test,
} from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/registration").post(registration);

router.route("/logIn").post(login);

router.route("/logOut").post(logout);
router.route("/test").get(authMiddleware ,test);

export default router;
