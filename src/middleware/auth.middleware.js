import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) throw new Error("Token missing, login again");

  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decode) next(new Error("Login first"));
    req.user = decode;
    next();
  } catch (error) {
    next(new Error("Error in login system"));
  }
});

export { authMiddleware };
