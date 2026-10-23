

import { Router } from "express";
import {
    explorePosts,
    getFollowingFeed,
    toggleLikePost,
    updatePost,
    deletePost,
    getPostById,
    getAllPosts,
     getLikedPosts,
    createPost
} from "../controller/post.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.route("/").post(
    verifyJWT,
    upload.single("image"),
    createPost
);
router.route("/").get(getAllPosts);

router.route("/feed/following").get(verifyJWT, getFollowingFeed);
router.route("/explore").get(explorePosts);
router.route("/liked").get(verifyJWT, getLikedPosts);
router.route("/:postId/like").post(verifyJWT, toggleLikePost);
router.route("/:postId").get(getPostById);
router.route("/:postId").delete(verifyJWT, deletePost);
router.route("/:postId").patch(verifyJWT, updatePost);


export default router;
