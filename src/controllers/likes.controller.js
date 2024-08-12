import mongoose from "mongoose";
import { Like } from "../models/likes.model.js";
import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  console.log(userId);

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(400, "Video does not exists");
    }

    const existingLike = await Like.find({
      $and: [
        { video: new mongoose.Types.ObjectId(videoId) },
        { likedBy: userId },
      ],
    });

    if (existingLike[0]) {
      const deleteLike = await Like.findByIdAndDelete(existingLike[0]._id);
      return res
        .status(200)
        .json(new ApiResponse(200, deleteLike, "like removed successfully"));
    }

    const addLike = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, addLike, "like added successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(400, "Comment does not exists");
    }

    const existingLike = await Like.Like.find({
      $and: [
        { comment: new mongoose.Types.ObjectId(commentId) },
        { likedBy: userId },
      ],
    });

    if (existingLike[0]) {
      const deleteLike = await Like.findByIdAndDelete(existingLike[0]._id);
      return res
        .status(200)
        .json(new ApiResponse(200, deleteLike, "like removed successfully"));
    }

    const addLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, addLike, "like added successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const totalLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const noOfLikes = await Like.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $count: "likes",
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, noOfLikes, "total likes on video"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const likeStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  try {
    const status = await Like.find({
      $and: [
        { video: new mongoose.Types.ObjectId(videoId) },
        { likedBy: userId },
      ],
    });

    if (status[0]) {
      return res
        .status(200)
        .json(new ApiResponse(200, true, "video is liked by user"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, false, "video is liked by user"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});
export { toggleVideoLike, toggleCommentLike, totalLikes, likeStatus };
