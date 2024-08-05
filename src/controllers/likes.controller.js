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

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(400, "Video does not exists");
    }

    const existingLike = await Like.findOne({
      video: videoId,
    });

    if (existingLike) {
      const deleteLike = await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, deleteLike, "like removed successfully"));
    }

    const addLike = await Like.create({
      video: videoId,
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

    const existingLike = await Like.findOne({
      comment: commentId,
    });

    if (existingLike) {
      const deleteLike = await Like.findByIdAndDelete(existingLike._id);
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
export { toggleVideoLike, toggleCommentLike };
