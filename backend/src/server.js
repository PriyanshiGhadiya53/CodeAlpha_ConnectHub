import "dotenv/config"; 

import http from "http";
import { Server } from "socket.io";


import app from "./app.js";
import connectDB from "./db/index.js";
import Message from "./model/message.model.js"; // Message model import



const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// Initialize Socket.io instance
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (userId) => {
        if (!userId) return;

        socket.join(userId);
        socket.data.userId = userId;

        console.log("User joined room:", userId);
    });

    socket.on("send-message", async (data, callback) => {
        try {
            const sender = socket.data.userId;
            const { receiver, content } = data || {};

            if (!sender || !receiver || !content?.trim()) {
                return callback?.({
                    success: false,
                    message: "Sender, receiver and message are required.",
                });
            }

            if (sender === receiver) {
                return callback?.({
                    success: false,
                    message: "You cannot message yourself.",
                });
            }

            const message = await Message.create({
                sender,
                receiver,
                content: content.trim(),
            });

            const savedMessage = message.toObject();

            io.to(receiver).emit("new-message", savedMessage);
            io.to(sender).emit("new-message", savedMessage);

            callback?.({
                success: true,
                message: savedMessage,
            });
        } catch (error) {
            console.error("Send message error:", error);

            callback?.({
                success: false,
                message: "Message could not be sent.",
            });
        }
    });

    socket.on("get-messages", async (data, callback) => {
        try {
            const sender = socket.data.userId;
            const { userId } = data || {};

            if (!sender || !userId) {
                return callback?.({
                    success: false,
                    messages: [],
                });
            }

            const messages = await Message.find({
                $or: [
                    { sender, receiver: userId },
                    { sender: userId, receiver: sender },
                ],
            }).sort({ createdAt: 1 });

            callback?.({
                success: true,
                messages,
            });
        } catch (error) {
            console.error("Fetch messages error:", error);

            callback?.({
                success: false,
                messages: [],
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Database connection & Server start
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    });