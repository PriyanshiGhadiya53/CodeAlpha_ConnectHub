import { asyncHandler } from "../util/asyncHandler.js";
import { apiError } from "../util/apiError.js";
import { apiResponse } from "../util/apiResponse.js";
import Bookmark from "../model/bookmark.model.js";

// Toggle Bookmark (Save / Unsave)
const toggleBookmark = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

  if (existingBookmark) {
    await Bookmark.findByIdAndDelete(existingBookmark.id);
    return res.status(200).json(new apiResponse(200, "Post removed from bookmarks", { bookmarked: false }));
  }

  const bookmark = await Bookmark.create({ user: userId, post: postId });
  return res.status(201).json(new apiResponse(201, "Post bookmarked successfully", { bookmarked: true, bookmark }));
});

// Get Bookmarked Posts
const getBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const bookmarks = await Bookmark.find({ user: userId })
    .populate({
      path: "post",
      populate: { path: "author", select: "fullName userName avatar" }
    })
    .sort({ createdAt: -1 });

  return res.status(200).json(new apiResponse(200, "Bookmarks fetched successfully", bookmarks));
});

export { toggleBookmark, getBookmarks };