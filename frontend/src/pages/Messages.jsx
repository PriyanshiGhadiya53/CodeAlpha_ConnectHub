import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Send,
  Search,
  ArrowLeft,
  MessageSquare,
  LoaderCircle,
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

  // 1. Current logged-in user fetch
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

  // 2. Socket Connection
  useEffect(() => {
    if (!currentUser) return;

    const currentUserId = currentUser._id || currentUser.id;
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
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

  // 4. Users list fetch
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const searchQuery = search.trim() ? search.trim() : "a";
        const res = await fetch(
          `${API_URL}/user/search?search=${encodeURIComponent(searchQuery)}`,
          { credentials: "include" }
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

  // 5. Selected User messages fetch
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

  // Scroll down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const messageText = newMessage.trim();
    const receiverId = selectedUser._id || selectedUser.id;

    setNewMessage("");

    socket.emit(
      "send-message",
      { receiver: receiverId, content: messageText },
      (response) => {
        if (!response?.success) {
          alert(response?.message || "Failed to send message.");
        }
      }
    );
  };

  return (
<div className="fixed inset-0 bottom-[68px] z-[90] flex overflow-hidden bg-[#F3ECFF] p-0 lg:static lg:inset-auto lg:z-auto lg:h-screen lg:w-screen lg:p-6">
  <div className="mx-auto flex h-full w-full max-w-[1500px] overflow-hidden bg-white lg:rounded-[24px] lg:border lg:border-purple-200 lg:shadow-lg">
        {/* LEFT PANEL */}
        <div
          className={`${selectedUser ? "hidden md:flex" : "flex"
            } w-full flex-col border-r border-purple-100 bg-white p-4 md:w-[360px] h-full`}
        >
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-xl p-2 text-[#4B187E] hover:bg-purple-50"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="flex items-center gap-2 text-xl font-black text-[#4B187E]">
              <MessageSquare size={22} className="text-purple-600" /> Messages
            </h1>
          </div>

          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full rounded-xl border border-purple-200 bg-purple-50/40 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#61269B]"
            />
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {loadingUsers ? (
              <div className="py-8 text-center text-xs font-bold text-purple-600">
                Loading...
              </div>
            ) : users.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">No users found.</p>
            ) : (
              users.map((u) => {
                const userId = u._id || u.id;
                const isSelected =
                  selectedUser && (selectedUser._id || selectedUser.id) === userId;

                return (
                  <button
                    key={userId}
                    onClick={() => setSelectedUser(u)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${isSelected
                        ? "bg-[#4B187E] text-white"
                        : "text-gray-800 hover:bg-purple-50"
                      }`}
                  >
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="h-10 w-10 rounded-xl object-cover border border-purple-200"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${isSelected ? "bg-white text-[#4B187E]" : "bg-[#4B187E] text-white"
                          }`}
                      >
                        {(u.fullName || u.userName || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{u.fullName || "User"}</p>
                      <p className={`truncate text-xs ${isSelected ? "text-purple-200" : "text-gray-400"}`}>
                        @{u.userName}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL - CHAT */}
        <div
          className={`${!selectedUser ? "hidden md:flex" : "flex"
            } h-full flex-1 flex-col bg-[#F3ECFF]/20 min-w-0`}
        >
          {selectedUser ? (
            <div className="flex h-full flex-col justify-between">
              {/* Header */}
              <div className="flex shrink-0 items-center gap-3 border-b border-purple-100 bg-white p-3.5">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-purple-50 md:hidden"
                >
                  <ArrowLeft size={18} />
                </button>
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.fullName}
                    className="h-9 w-9 rounded-xl object-cover border border-purple-200"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B187E] font-bold text-white text-sm">
                    {(selectedUser.fullName || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{selectedUser.fullName}</h2>
                  <p className="text-[11px] text-purple-600">@{selectedUser.userName}</p>
                </div>
              </div>

              {/* Chat Messages */}
<div className="flex-1 min-h-0 space-y-2 overflow-y-auto p-4 pb-8">                {loadingChat ? (
                  <div className="flex h-full items-center justify-center text-purple-600">
                    <LoaderCircle className="animate-spin" size={24} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={36} className="mb-2 text-purple-300" />
                    <p className="text-xs font-semibold">Say hi to {selectedUser.fullName}!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const currentUserId = currentUser?._id || currentUser?.id;
                    const isMe = String(m.sender) === String(currentUserId);
                    return (
                      <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${isMe ? "bg-[#4B187E] text-white" : "border border-purple-100 bg-white text-gray-800"
                            }`}
                        >
                          <p className="break-words">{m.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form Box - Fixed at bottom */}
             <form
  onSubmit={handleSend}
  className="relative z-10 flex shrink-0 items-center gap-2 border-t border-purple-100 bg-white p-3 pb-3 sm:gap-3 sm:p-4"
>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-xl border border-purple-200 bg-purple-50/40 px-3.5 py-2.5 text-sm outline-none focus:border-[#61269B]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B187E] text-white transition hover:bg-[#61269B] disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-gray-400">
              <MessageSquare size={48} className="mb-2 text-purple-300" />
              <h3 className="text-base font-bold text-[#4B187E]">Your Messages</h3>
              <p className="text-xs text-gray-500">Select a user to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;