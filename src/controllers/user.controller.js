import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  const { FullName, email, password, username } = req.body;

  if (
    [FullName, email, password, username].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exist LogIn");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    FullName,
    username,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genrating access and refresh token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "enter email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user does not exist");
  }

  if (!(await user.isPasswordCorrect(password))) {
    throw new ApiError(404, "enter correnct password");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedUser, "user logged in"));
});

const logoutuser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user loggedOut"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  return res.status(200).json(new ApiResponse(200, req.user, "current user"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshAccessTokenFromCookies = req.cookies?.refreshToken;

  if (!refreshAccessTokenFromCookies) {
    throw new ApiError(404, "Unauthorised Access");
  }

  try {
    const decodedToken = jwt.verify(
      refreshAccessTokenFromCookies,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findById(decodedToken._id);
    if (user.refreshToken !== refreshAccessTokenFromCookies) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = generateAccessandRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Accesstoken refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400, "unauthorised access")
    }
    if(!(user.isPasswordCorrect(oldPassword))){
        throw new ApiResponse(400, "password didn't match")
    }
    user.password = password;
    user.save({validateBeforeSave:false})

    res.status(200).json(
        new ApiResponse(
         202,
         {},
         "password updated successfully"
       )
     );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {FullName, username, email} = req.body;
    const user = await User.findByIdAndUpdate(user._id,{
        $set:{
            FullName,
            username,
            email
        }
    },{new: true}).select("-password")

    return res
           .status(200)
           .json(new ApiResponse(
            200,
            user,
            "user details updated successfully"
           ))
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "upload avatar")     
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
       throw new ApiError(500, "avatar update failed")     
    }
    
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set: {
            avatar: avatar.url,
        }
    }, {new: true}).select("-password -refreshToken")

    return res
           .status(200)
           .json(new ApiResponse(
            200,
            user,
            "avatar updated!!"
           ))
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400, "upload coverImage")     
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage){
       throw new ApiError(500, "coverImage update failed")     
    }
    
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set: {
            coverImage: coverImage.url,
        }
    }, {new: true}).select("-password -refreshToken")

    return res
           .status(200)
           .json(new ApiResponse(
            200,
            user,
            "coverImage updated!!"
           ))
});

export {
  registerUser,
  loginUser,
  logoutuser,
  getCurrentUser,
  refreshAccessToken,
  changeCurrrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
