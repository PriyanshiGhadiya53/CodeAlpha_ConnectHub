
import { Router } from "express";
import { deleteComment,updateComment,getPostComments,createComment } from "../controller/comment.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:postId").post(verifyJWT, createComment);
router.route("/:postId").get(getPostComments);
router.route("/edit/:commentId").patch(verifyJWT,updateComment);
router.route("/edit/:commentId").delete(verifyJWT,deleteComment);


export default router;
