import { Router } from "express";
import { sendMessage, getMessages } from "../controller/message.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, sendMessage);
router.route("/:userId").get(verifyJWT, getMessages);

export default router;