import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { toggleCommentLike, toggleVideoLike } from "../controllers/likes.controller.js";

const router = new Router();

router.route('/togglevideoLike/:videoId').get(
    verifyJwt,
    toggleVideoLike
)

router.route('/toggleCommentLike/:commentId').get(
    verifyJwt,
    toggleCommentLike
)

export default router;