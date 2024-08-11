import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;

  try {
    if (!user) {
      throw new ApiError(401, "Unauthorized Access!! Please login or signup");
    }

    const videoFileLoaclpath = req.files?.videoFile[0]?.path;
    const thumbnailLoaclpath = req.files?.thumbnail[0]?.path;
    console.log(req.files?.videoFile[0])

    const videoFile = await uploadOnCloudinary(videoFileLoaclpath);
    const thumbnail = await uploadOnCloudinary(thumbnailLoaclpath);

    const video = await Video.create({
      title,
      description,
      thumbnail: thumbnail.url,
      videoFile: videoFile.url,
      duration: videoFile.duration,
      views: 0,
      isPublished: false,
      owner: user._id,
    });

    const uploadedVideo = await Video.findById(video._id);

    if (!uploadedVideo) {
      throw new ApiError(500, "Something went wrong while uploading video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, uploadedVideo, "video uploaded"));
  } catch (error) {
    throw new ApiError(500, error.message, "Something went wrong");
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const user = req.user;

  try {
    const videos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(user._id),
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
      .json(new ApiResponse(200, videos, "videos Fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Something went wrong");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(400, "video does not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "video fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Something went wrong");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const user = req.user;
  const userId = user._id;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(400).json(new ApiError(400, "Video does not exist"));
    }

    if (video.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "Unauthorized access, please login"));
    }

    let thumbnail = video.thumbnail;
    if (req.files && req.files.thumbnail) {
      const thumbnailLocalPath = req.files.thumbnail[0].path;
      if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      }
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail;

    await video.save({ validateBeforeSave: false });

    const newVideo = await Video.findById(video._id);

    return res
      .status(200)
      .json(new ApiResponse(200, newVideo, "Details updated successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          error.message || "Something went wrong while updating video details"
        )
      );
  }
});

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const user = req.user;

    try {
        if(!user){
            throw new ApiError(401, "Unauthorized Access!! Please login or signup");
        }
    
        const deletedVideo = await Video.findByIdAndDelete(videoId);
    
        if(!deletedVideo){
            throw new ApiError(500, "Something went wrong");
        }
    
        return res
        .stauts(200)
        .json(new ApiResponse(200, deleteVideo, "Video deleted successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, "Something went wrong");
    }
})

const getAllVideosForHomePage = asyncHandler(async (req, res) => {

  try {
    const videos = await Video.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "All Videos Fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Something went wrong");
  }
});

export { publishVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, getAllVideosForHomePage };
