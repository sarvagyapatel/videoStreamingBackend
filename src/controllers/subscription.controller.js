import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const channel = new mongoose.Types.ObjectId(req.params.channel);
  const subscriber = req.user._id;
  try {
    if (!subscriber) {
      throw new ApiError(400, "Unauthorised Access");
    }
    if (!channel) {
      throw new ApiError(400, "Invalid request");
    }

    const exsistingSubscription = await Subscription.find({
      $and: [{ subscriber }, { channel }],
    });

    if (exsistingSubscription[0]) {
      // remove subscription
      const removeSubscrition = await Subscription.findByIdAndDelete(
        exsistingSubscription[0]._id,
        { new: true }
      );

      return res
        .status(200)
        .json(
          200,
          new ApiResponse(200, removeSubscrition, "Unsubscribed successfuly")
        );
    }

    const newSubscription = await Subscription.create({
      subscriber,
      channel,
    });

    const addedSubscription = await Subscription.findById(newSubscription._id);

    return res
      .status(200)
      .json(
        200,
        new ApiResponse(200, addedSubscription, "Subscribed successfuly")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriber = req.user;
  try {
    if (!subscriber._id) {
      throw new ApiError(400, "Unaurthorised access");
    }

    const channelList = await Subscription.aggregate([
      {
        $match: {
          subscriber: subscriber._id,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    console.log(channelList);

    return res
      .status(200)
      .json(new ApiResponse(200, channelList, "All subscribed channels"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  try {
    const channel = await User.findById(channelId).select(
      "-refreshToken -password"
    );
    if (!channel) {
      throw new ApiError(400, "No such channel exist");
    }

    const subscribersOfChannel = await Subscription.aggregate([
      {
        $match: {
          channel: channel._id,
        },
      },
      {
        $count: "Subscribers",
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribersOfChannel, "Number of subscribers")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
});

const isSubscribed = asyncHandler(async (req, res) => {
  const channel = new mongoose.Types.ObjectId(req.params.channel);
  const subscriber = req.user._id;

  try {
    const checkSubscription = await Subscription.find({
      $and: [{ subscriber }, { channel }],
    });
    console.log(checkSubscription[0]);
    if (checkSubscription[0]) {
      return res
        .status(200)
        .json(new ApiResponse(200, true, "Subscribed channel"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, false, "not Subscribed channel"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Something went wrong");
  }
});

export {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
  isSubscribed,
};
