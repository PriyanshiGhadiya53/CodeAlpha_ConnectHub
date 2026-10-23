
import express from "express";
import cors from "cors";
import userRouter  from "./router/user.router.js";
import postRouter  from "./router/post.router.js";
import commentRouter from "./router/comment.router.js";
import messageRouter from "./router/message.router.js";
import bookmarkRouter from "./router/bookmark.router.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://connecthub-network.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user",userRouter);
app.use("/api/v1/post",postRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/bookmarks",bookmarkRouter)
app.get("/", (req, res) => {
  res.send("ConnectHub API is running!");
});

export default app;
