import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, fullName } = req.body;
  console.log(userName, email, password);

  if (userName.trim() === "" || email.trim() === "" || password.trim() === "") {
    throw new ApiError(400, "Email, username, and password are required");
  }

  const userExisted = await User.findOne({
    $or: [{ userName }, { email }],
  });

  console.log(userExisted);
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

  const coverImage = await uploadOnCloudnary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "avatar file is required");
  }

  const user = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
    userName: userName.toLowerCase,
  });

  console.log(user._id);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log(createdUser);
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const generateRefreshAndAccessToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};
export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email) {
      throw new ApiError(401, "username or password not found");
    }

    const user = User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError(400, "User not exists");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Password Incorrect");
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      );
  } catch (error) {}
});

export const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(async (req, res) => {
    req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      };
  });
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options),
    json(200, {}, "User LoggedOut");
});
export default registerUser;
// comment for adding changes to git with current email
