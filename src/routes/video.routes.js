import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();

router.route("/publishVideo").post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      }
    ]),
    verifyJwt,
    publishVideo
  )

  router.route("/allVideos").post(
    verifyJwt,
    getAllVideos,
  )

  router.route("/videoByID/:videoId").get(
    getVideoById
  )
  
  router.route("/updateVideo/:videoId").post(
    upload.fields([
      {
        name: "thumbnail",
        maxCount: 1,
      }
    ]),
    verifyJwt,
    updateVideo
  )

  router.route("/deleteVideo/:videoId").get(
    verifyJwt,
    deleteVideo
  )


export default router;