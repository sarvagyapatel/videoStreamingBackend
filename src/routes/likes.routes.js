import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { likeStatus, toggleCommentLike, toggleVideoLike, totalLikes } from "../controllers/likes.controller.js";

const router = new Router();

router.route('/togglevideoLike/:videoId').get(
    verifyJwt,
    toggleVideoLike
)

router.route('/toggleCommentLike/:commentId').get(
    verifyJwt,
    toggleCommentLike
)

router.route('/totalLikes/:videoId').get(
    totalLikes
)

router.route('/likeStatus/:videoId').get(
    verifyJwt,
    likeStatus
)

export default router;