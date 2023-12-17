import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  if (username.trim() === "" || email.trim() === "" || password.trim() === "") {
    throw new ApiError(400, "Email, username, and password are required");
  }

  const userExisted = User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExisted) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (avatarLocalPath == "") {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudnary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  const user = User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
    userName: username.toLowerCase,
  });

  const createUser = User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "User Registered successfully"));
});

export default registerUser;
// comment for adding changes to git with current email
