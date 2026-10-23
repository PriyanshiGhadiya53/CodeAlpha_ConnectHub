import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Send,
  Search,
  ArrowLeft,
  MessageSquare,
  LoaderCircle,
  UserRound,
} from "lucide-react";

const API_URL = "https://connecthub-backend-zf8y.onrender.com/api/v1";
const SOCKET_URL = "https://connecthub-backend-zf8y.onrender.com";

function Messages() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);

  // 1. Current logged-in user fetch karein
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_URL}/user/me`, {
          credentials: "include",
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Unauthorized");
        }
        if (res.ok) {
          setCurrentUser(data.data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.warn("User fetch error:", err);
        navigate("/login");
      }
    };
    fetchMe();
  }, [navigate]);

  // 2. Socket Connection & Join Room setup
  useEffect(() => {
    if (!currentUser) return;

    const currentUserId = currentUser._id || currentUser.id;
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      newSocket.emit("join-room", currentUserId);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [currentUser]);

  // 3. Socket new-message listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (savedMessage) => {
      if (
        selectedUser &&
        (String(savedMessage.sender) === String(selectedUser._id || selectedUser.id) ||
          String(savedMessage.receiver) === String(selectedUser._id || selectedUser.id))
      ) {
        setMessages((prev) => [...prev, savedMessage]);
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => socket.off("new-message", handleNewMessage);
  }, [socket, selectedUser]);

  // 4. Users list fetch (Search query ya default "a" query ke sath)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const searchQuery = search.trim() ? search.trim() : "a";
        const res = await fetch(
          `${API_URL}/user/search?search=${encodeURIComponent(searchQuery)}`,
          {
            credentials: "include",
          }
        );
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { data: [] };
        }

        if (res.ok) {
          const list = Array.isArray(data.data) ? data.data : [];
          const currentId = currentUser?._id || currentUser?.id;
          setUsers(
            list.filter((u) => String(u._id || u.id) !== String(currentId))
          );
        }
      } catch (err) {
        console.error("Users list fetch error:", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (currentUser) fetchUsers();
  }, [search, currentUser]);

  // 5. Selected User ke messages socket ke zariye fetch karna
  useEffect(() => {
    if (!selectedUser || !socket) return;

    setLoadingChat(true);
    const targetUserId = selectedUser._id || selectedUser.id;

    socket.emit("get-messages", { userId: targetUserId }, (response) => {
      if (response?.success) {
        setMessages(response.messages || []);
      } else {
        setMessages([]);
      }
      setLoadingChat(false);
    });
  }, [selectedUser, socket]);

  // Auto scroll down to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 6. Send message handler
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const messageText = newMessage.trim();
    const receiverId = selectedUser._id || selectedUser.id;

    setNewMessage("");

    socket.emit(
      "send-message",
      {
        receiver: receiverId,
        content: messageText,
      },
      (response) => {
        if (!response?.success) {
          alert(response?.message || "Failed to send message.");
        }
      }
    );
  };

  return (
    <div className="flex h-screen bg-[#F3ECFF] p-3 text-gray-800 sm:p-6">
      <div className="mx-auto flex w-full max-w-[1500px] gap-4 overflow-hidden rounded-[32px] border border-purple-200/60 bg-white shadow-xl">
        
        {/* LEFT PANEL - USERS LIST & SEARCH */}
        <div
          className={`${
            selectedUser ? "hidden md:flex" : "flex"
          } w-full flex-col border-r border-purple-100 bg-white p-5 md:w-[380px]`}
        >
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl p-2.5 text-[#4B187E] transition hover:bg-purple-50"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="flex items-center gap-2 text-2xl font-black text-[#4B187E]">
              <MessageSquare size={24} className="text-purple-600" /> Messages
            </h1>
          </div>

          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people to chat..."
              className="w-full rounded-2xl border border-purple-200/60 bg-purple-50/50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#61269B] focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {loadingUsers ? (
              <div className="py-10 text-center text-xs font-bold text-purple-600">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <p className="py-10 text-center text-xs text-gray-400">
                No users found.
              </p>
            ) : (
              users.map((u) => {
                const userId = u._id || u.id;
                const isSelected =
                  selectedUser && (selectedUser._id || selectedUser.id) === userId;

                return (
                  <button
                    key={userId}
                    onClick={() => setSelectedUser(u)}
                    className={`flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition ${
                      isSelected
                        ? "bg-[#4B187E] text-white shadow-md shadow-purple-900/20"
                        : "text-gray-800 hover:bg-purple-50"
                    }`}
                  >
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="h-12 w-12 rounded-2xl border border-purple-200 object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black ${
                          isSelected
                            ? "bg-white text-[#4B187E]"
                            : "bg-[#4B187E] text-white"
                        }`}
                      >
                        {(u.fullName || u.userName || "U")[0].toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">
                        {u.fullName || "User"}
                      </p>
                      <p
                        className={`truncate text-xs ${
                          isSelected ? "text-purple-200" : "text-gray-400"
                        }`}
                      >
                        @{u.userName || "username"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL - CHAT AREA */}
        <div
          className={`${
            !selectedUser ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-[#F3ECFF]/30`}
        >
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3.5 border-b border-purple-100 bg-white p-4 sm:px-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-xl p-2 text-gray-600 hover:bg-purple-50 md:hidden"
                >
                  <ArrowLeft size={20} />
                </button>

                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.fullName}
                    className="h-11 w-11 rounded-2xl border border-purple-200 object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4B187E] font-black text-white">
                    {(
                      selectedUser.fullName ||
                      selectedUser.userName ||
                      "U"
                    )[0].toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    {selectedUser.fullName || "User"}
                  </h2>
                  <p className="text-xs font-semibold text-purple-600">
                    @{selectedUser.userName}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                {loadingChat ? (
                  <div className="flex h-full items-center justify-center text-purple-600">
                    <LoaderCircle className="animate-spin" size={28} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                    <MessageSquare size={40} className="mb-2 text-purple-300" />
                    <p className="text-sm font-semibold">
                      Say hi to {selectedUser.fullName || selectedUser.userName}!
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const currentUserId = currentUser?._id || currentUser?.id;
                    const isMe = String(m.sender) === String(currentUserId);

                    return (
                      <div
                        key={m._id}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
                            isMe
                              ? "rounded-tr-none bg-[#4B187E] text-white"
                              : "rounded-tl-none border border-purple-100 bg-white text-gray-800"
                          }`}
                        >
                          <p className="break-words">{m.content}</p>
                          <p
                            className={`mt-1 text-right text-[10px] font-medium ${
                              isMe ? "text-purple-200" : "text-gray-400"
                            }`}
                          >
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex items-center gap-3 border-t border-purple-100 bg-white p-3 sm:p-4"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-2xl border border-purple-200/70 bg-purple-50/40 px-4 py-3 text-sm outline-none focus:border-[#61269B] focus:ring-2 focus:ring-purple-200"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4B187E] text-white shadow-md shadow-purple-900/20 transition hover:bg-[#61269B] disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-gray-400">
              <MessageSquare size={52} className="mb-3 text-purple-300" />
              <h3 className="text-lg font-extrabold text-[#4B187E]">
                Your Messages
              </h3>
              <p className="mt-1 max-w-xs text-xs text-gray-500">
                Select a user from the left list to start real-time messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;