export const app = express();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRoute from "../11. Blog_Post/src/routes/user.routes.js";
import blogRoute from "../11. Blog_Post/src/routes/blog.routes.js";
import commentRoute from "../11. Blog_Post/src/routes/comment.routes.js";

app.use("/api/v1/user", userRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/comment", commentRoute);

export default app;
