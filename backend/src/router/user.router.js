import { Router } from "express";
import { getSuggestedUsers,updateAvatar,updateUserProfile,getUserProfile,forgotPassword, resetPassword,changeCurrentPassword,getCurrentUser, login, logout, refreshAccessToken, register } from "../controller/user.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import { toggleFollow,getFollowers,getFollowing,searchUsers} from "../controller/user.controller.js";

const router=Router();

router.route("/register").post(register)

router.route("/login").post(login)
router.route("/me").get(verifyJWT,getCurrentUser)
router.route("/logout").post(logout)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/refresh").post(refreshAccessToken)
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/profile/:userName").get(verifyJWT, getUserProfile);
router.route("/profile").patch(verifyJWT, updateUserProfile);
router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
);

router.route("/suggestions").get(verifyJWT, getSuggestedUsers);
router.route("/search").get(searchUsers);
router.route("/follow/:userId").post(verifyJWT, toggleFollow);
router.route("/:userId/followers").get(getFollowers);

router.route("/:userId/following").get(getFollowing);

export default router;