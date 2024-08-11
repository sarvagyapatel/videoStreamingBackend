import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  console.log(content)
  const user = req.user;
  try {
    if (!user._id) {
      throw new ApiError(400, "Unauthorised Access, Please Login");
    }

    const comment = await Comment.create({
      content,
      video: new mongoose.Types.ObjectId(videoId),
      owner: user._id,
    });

    return res
      .status(200)
      .json(200, new ApiResponse(200, comment, "Commented Susccssfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const videoComments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        200,
        new ApiResponse(200, videoComments, "Comments fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(400, "Comment does not exist");
    }
    const video = await Video.findById(comment.video);

    if (!(comment.owner.equals(userId) || video.owner.equals(userId))) {
      throw new ApiError(400, "Unauthorised to delete comment");
    }

    const deleteComment = await Comment.findByIdAndDelete(comment._id);
    return res
      .status(200)
      .json(200, new ApiResponse(200, deleteComment, "Comment deleted"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(400, "Comment does not exist");
    }

    if (!comment.owner.equals(userId)) {
      throw new ApiError(400, "Unauthorised to modify comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        200,
        new ApiResponse(200, updatedComment, "comment updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

export { addComment, getVideoComments, deleteComment, updateComment };
