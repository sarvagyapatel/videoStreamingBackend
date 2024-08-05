import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router
  .route("/addComment/:videoId")
  .post(upload.fields([]), verifyJwt, addComment);

router.route("/videoComments/:videoId").get(getVideoComments);

router.route("/deleteComment/:commentId").get(verifyJwt, deleteComment);

router.route("/updateComment/:commentId").post(
  upload.fields([
    {
      name: "content",
      maxCount: 1,
    },
  ]),
  verifyJwt,
  updateComment
);

export default router;
