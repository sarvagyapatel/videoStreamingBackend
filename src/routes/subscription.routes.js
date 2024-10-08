import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, isSubscribed, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.route('/subscribe/:channel').get(
    verifyJwt,
    toggleSubscription
)

router.route('/subscribedChannels').get(
    verifyJwt,
    getSubscribedChannels
)

router.route('/channelSubscribers/:channelId').get(
    getUserChannelSubscribers
)

router.route('/checkSubscription/:channel').get(
    verifyJwt,
    isSubscribed
)

export default router;