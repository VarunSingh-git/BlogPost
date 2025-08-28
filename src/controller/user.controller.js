import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formattedName } from "../utils/textFormater.js";

const registration = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new Error("Invalid Credentials");
  }

  const isUserExist = await User.findOne({ email: email.toLowerCase() });
  if (isUserExist)
    throw new Error("User already registered with this creadentials");
  if (typeof name !== "string" || name.trim().length < 2) {
    throw new Error("Invalid Name");
  }
  if (
    typeof email !== "string" ||
    email.trim().startsWith("@") ||
    email.trim().endsWith("@") ||
    !email.includes("@")
  ) {
    throw new Error("Invalid Email");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 character long");
  }

  const formatedName = formattedName(name);

  const newUser = await User.create({
    name: formatedName,
    email: email.toLowerCase(),
    password: password,
  });

  const userExistence = await User.findById(newUser?._id).select(
    "-password -refreshToken"
  );
  if (!userExistence) throw new Error("Internal Server Error...!");
  return res.status(200).json({
    msg: "User Registered Successfully",
    userExistence,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Please enter valid creadentials for login");
  }
  const user = await User.findOne({
    email,
  });

  if (!user) throw new Error("User not found");

  const checkPassword = await user.isPasswordCorrect(password);
  if (!checkPassword) throw new Error("Password is incorrect");

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  const loggedInUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser)
    throw new Error("Error while login process please try again...!");

  user.refreshToken = refreshToken;

  await user.save({
    validateBeforeSave: false,
  });
  const opt = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, opt)
    .cookie("refreshToken", refreshToken, opt)
    .json({ msg: "User logIn Successfully", loggedInUser });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const opt = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", opt)
    .clearCookie("refreshToken", opt)
    .json({ msg: "Logout successfully" });
});

const test = async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new Error("user not found");
  return res.status(200).json({ msg: "user still loggedIn", user });
};

export { registration, login, logout, test };
