import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { getCurrentUser, getUserByID, loginUser, logoutuser, registerUser, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
      {
        name: "avatar",
        maxCount: 1,
      },
      {
        name: "coverImage",
        maxCount: 1,
      },
    ]),
    registerUser
  );

  router.route("/login").post(
    upload.fields([]),
    loginUser
  )

  router.route("/logout").post(
    verifyJwt,
    logoutuser
  )

  router.route("/current_user").post(
    verifyJwt,
    getCurrentUser
  )

  router.route("/update_avatar").post(
    upload.fields([
      {
        name: "avatar",
        maxCount: 1,
      },
    ]),
    verifyJwt,
    updateUserAvatar
  )

  router.route("/update_coverImage").post(
    upload.fields([
      {
        name: "coverImage",
        maxCount: 1,
      },
    ]),
    verifyJwt,
    updateUserCoverImage
  )

  router.route("/getUserById/:userId").get(
    getUserByID
  )


  
  export default router;