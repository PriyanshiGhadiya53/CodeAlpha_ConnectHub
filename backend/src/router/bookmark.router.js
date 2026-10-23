import { Router } from "express";
import { toggleBookmark, getBookmarks } from "../controller/bookmark.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getBookmarks);
router.route("/:postId").post(verifyJWT, toggleBookmark);

export default router;