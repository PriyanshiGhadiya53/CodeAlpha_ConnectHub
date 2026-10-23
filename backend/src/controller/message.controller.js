import { asyncHandler } from "../util/asyncHandler.js";
import { apiError } from "../util/apiError.js";
import { apiResponse } from "../util/apiResponse.js";
import Message from "../model/message.model.js";

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, content } = req.body;

  if (!receiver || !content?.trim()) {
    throw new apiError(400, "Receiver and message are required.");
  }

  if (receiver === req.user.id) {
    throw new apiError(400, "You cannot send a message to yourself.");
  }

  const message = await Message.create({
    sender: req.user.id,
    receiver,
    content: content.trim(),
  });

  return res
    .status(201)
    .json(new apiResponse(201, "Message sent successfully", message));
});

// Get messages between logged-in user and selected user
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new apiError(400, "User ID is required.");
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: userId },
      { sender: userId, receiver: req.user.id },
    ],
  }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new apiResponse(200, "Messages fetched successfully", messages));
});

export { sendMessage, getMessages };