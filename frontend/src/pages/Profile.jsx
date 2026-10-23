
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Pencil,
  Share2,
  CalendarDays,
  MapPin,
  Link as LinkIcon,
  Grid3X3,
  Heart,
  ImagePlus,
  LoaderCircle,
  X,
  Camera,
  Bookmark,
  ChevronRight,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";

import Sidebar from "../components/Sidebar.jsx";
import RightSidebar from "../components/RightSidebar.jsx";

const API_URL = "https://connecthub-backend-zf8y.onrender.com/api/v1";

function Profile() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [activeTab, setActiveTab] = useState("posts");

  const [likedPosts, setLikedPosts] = useState([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState("");

  const [connectionType, setConnectionType] = useState("");
  const [connections, setConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsError, setConnectionsError] = useState("");

  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const userRes = await fetch(`${API_URL}/user/me`, {
        credentials: "include",
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        throw new Error(userData.message || "Profile load nahi hui.");
      }

      const currentUser = userData.data;

      setUser(currentUser);

      setForm({
        fullName: currentUser.fullName || "",
        bio: currentUser.bio || "",
      });

      const postsRes = await fetch(`${API_URL}/post`, {
        credentials: "include",
      });

      const postsData = await postsRes.json();

      if (!postsRes.ok) {
        throw new Error(postsData.message || "Posts load nahi hue.");
      }

      const allPosts = Array.isArray(postsData.data)
        ? postsData.data
        : [];

      const userId = String(currentUser._id || currentUser.id);

      setPosts(
        allPosts.filter((post) => {
          const authorId =
            post.author?._id ||
            post.author?.id ||
            post.author;

          return String(authorId) === userId;
        })
      );
    } catch (err) {
      setError(err.message || "Profile load karne mein error aaya.");
    } finally {
      setLoading(false);
    }
  };

  const loadLikedPosts = async () => {
    try {
      setLikedLoading(true);
      setLikedError("");

      const res = await fetch(`${API_URL}/post/liked`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Liked posts load nahi hui.");
      }

      setLikedPosts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setLikedError(err.message || "Liked posts load nahi hui.");
    } finally {
      setLikedLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Profile link copied successfully! 💜");
    } catch {
      showToast(
        "Link copy nahi hua. Browser permission check karo.",
        "error"
      );
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          bio: form.bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Profile update nahi hui.");
      }

      setUser(data.data);
      setForm({
        fullName: data.data.fullName || "",
        bio: data.data.bio || "",
      });

      setEditing(false);
      showToast("Profile updated successfully! 💜");
    } catch (err) {
      showToast(err.message || "Profile update nahi hui.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image 5 MB se chhoti honi chahiye.", "error");
      e.target.value = "";
      return;
    }

    try {
      setAvatarSaving(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_URL}/user/avatar`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Avatar upload nahi hua.");
      }

      if (data.data?.avatar) {
        setUser((previous) => ({
          ...previous,
          avatar: data.data.avatar,
        }));
      } else {
        await loadProfile();
      }

      showToast("Profile photo updated! 📸");
    } catch (err) {
      showToast(err.message || "Avatar upload nahi hua.", "error");
    } finally {
      setAvatarSaving(false);
      e.target.value = "";
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const res = await fetch(`${API_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Logout failed.");
      }

      navigate("/login", { replace: true });
    } catch (err) {
      showToast(err.message || "Logout nahi hua.", "error");
    } finally {
      setLoggingOut(false);
    }
  };

  const loadConnections = async (type) => {
    try {
      setConnectionType(type);
      setConnections([]);
      setConnectionsError("");
      setConnectionsLoading(true);

      const userId = user._id || user.id;

      const res = await fetch(
        `${API_URL}/user/${userId}/${type}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `${type} load nahi hue.`);
      }

      setConnections(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setConnectionsError(err.message || "Users load nahi hue.");
    } finally {
      setConnectionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#F7F3FF] text-[#4B187E]">
        <LoaderCircle size={30} className="animate-spin" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F3FF] px-5 text-center">
        <UserRound size={44} className="text-[#61269B]" />
        <h2 className="mt-4 text-xl font-bold text-[#4B187E]">
          Profile load nahi hui
        </h2>
        <p className="mt-2 text-sm text-gray-600">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-5 rounded-xl bg-[#61269B] px-5 py-3 font-semibold text-white"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const followersCount = Array.isArray(user.followers)
    ? user.followers.length
    : 0;

  const followingCount = Array.isArray(user.following)
    ? user.following.length
    : 0;

  return (
    <div className="min-h-screen bg-[#F7F3FF]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-5 z-[200] w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-3 duration-300">
          <div
            role="status"
            className={`flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
              toast.type === "error"
                ? "border-red-200"
                : "border-[#EDE0FF]"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-[#EDE0FF] text-[#61269B]"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle size={22} />
              ) : (
                <CheckCircle2 size={22} />
              )}
            </span>

            <p
              className={`flex-1 text-sm font-semibold ${
                toast.type === "error"
                  ? "text-red-700"
                  : "text-[#4B187E]"
              }`}
            >
              {toast.message}
            </p>

            <button
              onClick={() => setToast(null)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-3 pb-24 pt-4 sm:gap-5 sm:px-5 sm:py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-6 lg:pb-6 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </div>

        <main className="min-w-0 space-y-5">
          {error && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{error}</p>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Profile Header */}
          <section className="overflow-hidden rounded-2xl border border-[#E6D9F5] bg-white shadow-sm">
            <div className="relative h-28 bg-gradient-to-r from-[#4B187E] via-[#61269B] to-[#A178D5] sm:h-36">
              <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                ✦ ConnectHub
              </div>
            </div>

            <div className="px-4 pb-5 sm:px-7 sm:pb-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 items-end gap-3 sm:gap-4">
                  <div className="relative -mt-12 h-24 w-24 shrink-0 sm:-mt-14 sm:h-28 sm:w-28">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EDE0FF] text-[#61269B] shadow-md">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName || "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={46} />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarSaving}
                      className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#61269B] text-white shadow-md hover:bg-[#4B187E] disabled:opacity-60"
                      aria-label="Change profile picture"
                    >
                      {avatarSaving ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Camera size={17} />
                      )}
                    </button>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  <div className="min-w-0 pb-1">
                    <h1 className="break-words text-xl font-black text-[#4B187E] sm:text-2xl">
                      {user.fullName || "Your Name"}
                    </h1>
                    <p className="break-words text-sm text-gray-500">
                      @{user.userName || "username"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:pb-1">
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#61269B] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#4B187E] sm:flex-none sm:px-4"
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#61269B] px-3 py-2.5 text-sm font-semibold text-[#61269B] hover:bg-[#F7F3FF] sm:px-4"
                  >
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                {user.bio || "Share your story with the ConnectHub community. 💜"}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {user.location}
                  </span>
                )}

                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#61269B] hover:underline"
                  >
                    <LinkIcon size={16} />
                    Website
                  </a>
                )}

                {user.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={16} />
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Profile Stats */}
              <div className="mt-6 grid grid-cols-3 divide-x divide-[#EDE0FF] rounded-xl bg-[#F7F3FF] py-4 text-center">
                <div>
                  <p className="text-xl font-black text-[#4B187E]">
                    {posts.length}
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">Posts</p>
                </div>

                <button
                  type="button"
                  onClick={() => loadConnections("followers")}
                  className="rounded-lg hover:bg-[#EDE0FF]"
                >
                  <p className="text-xl font-black text-[#4B187E]">
                    {followersCount}
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">Followers</p>
                </button>

                <button
                  type="button"
                  onClick={() => loadConnections("following")}
                  className="rounded-lg hover:bg-[#EDE0FF]"
                >
                  <p className="text-xl font-black text-[#4B187E]">
                    {followingCount}
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">Following</p>
                </button>
              </div>

              {/* Saved Posts */}
              <button
                type="button"
                onClick={() => navigate("/bookmarks")}
                className="group mt-5 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#4B187E] via-[#61269B] to-[#8050B8] p-4 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Bookmark size={25} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-white">Saved Posts</span>
                  <span className="mt-1 block text-xs text-purple-100 sm:text-sm">
                    Your favourite posts, all in one place
                  </span>
                </span>
                <ChevronRight size={21} className="text-white" />
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-3 flex w-full items-center justify-between rounded-2xl border border-red-200 bg-white p-4 text-left hover:bg-red-50 disabled:opacity-60 sm:p-5"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    {loggingOut ? (
                      <LoaderCircle size={23} className="animate-spin" />
                    ) : (
                      <LogOut size={23} />
                    )}
                  </span>
                  <span>
                    <span className="block font-bold text-red-600">
                      {loggingOut ? "Logging out..." : "Logout"}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500 sm:text-sm">
                      Sign out from your ConnectHub account
                    </span>
                  </span>
                </span>
                <ChevronRight size={21} className="text-red-400" />
              </button>
            </div>
          </section>

          {/* Edit Profile Form */}
          {editing && (
            <form
              onSubmit={handleSave}
              className="space-y-4 rounded-2xl border border-[#E6D9F5] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-lg font-bold text-[#4B187E]">
                Edit Your Profile
              </h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6D9F5] px-4 py-3 outline-none focus:border-[#61269B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  className="w-full resize-y rounded-xl border border-[#E6D9F5] px-4 py-3 outline-none focus:border-[#61269B]"
                  placeholder="Tell people about yourself..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#4B187E] px-5 py-2.5 font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      fullName: user.fullName || "",
                      bio: user.bio || "",
                    });
                  }}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Posts and Liked Tabs */}
          <section className="overflow-hidden rounded-2xl border border-[#E6D9F5] bg-white shadow-sm">
            <div className="flex gap-6 border-b border-[#EDE0FF] px-5 sm:px-7">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-semibold ${
                  activeTab === "posts"
                    ? "border-[#61269B] text-[#61269B]"
                    : "border-transparent text-gray-500 hover:text-[#61269B]"
                }`}
              >
                <Grid3X3 size={18} />
                Posts
              </button>

              <button
                onClick={() => {
                  setActiveTab("liked");
                  loadLikedPosts();
                }}
                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-semibold ${
                  activeTab === "liked"
                    ? "border-[#61269B] text-[#61269B]"
                    : "border-transparent text-gray-500 hover:text-[#61269B]"
                }`}
              >
                <Heart size={18} />
                Liked
              </button>
            </div>

            {activeTab === "posts" ? (
              posts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5">
                  {posts.map((post) => (
                    <button
                      key={post._id}
                      onClick={() => navigate(`/post/${post._id}`)}
                      className="min-w-0 overflow-hidden rounded-xl border border-[#EDE0FF] bg-[#F7F3FF] text-left hover:shadow-md"
                    >
                      {post.image ? (
                        <img
                          src={post.image}
                          alt="Post"
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center overflow-hidden p-3 text-sm text-[#4B187E]">
                          <p className="line-clamp-6 break-words">
                            {post.content || "Post"}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 px-2 py-2 text-xs text-[#61269B] sm:px-3 sm:text-sm">
                        <Heart size={15} />
                        {Array.isArray(post.likes) ? post.likes.length : 0}
                        <span className="text-gray-500">Likes</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center px-5 py-14 text-center">
                  <ImagePlus size={38} className="text-[#61269B]" />
                  <h3 className="mt-3 font-bold text-[#4B187E]">No posts yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your posts will appear here.
                  </p>
                </div>
              )
            ) : likedLoading ? (
              <div className="flex items-center justify-center gap-3 py-14 text-[#61269B]">
                <LoaderCircle size={25} className="animate-spin" />
                <span>Loading liked posts...</span>
              </div>
            ) : likedError ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-red-600">{likedError}</p>
                <button
                  onClick={loadLikedPosts}
                  className="mt-3 rounded-xl bg-[#61269B] px-4 py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : likedPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5">
                {likedPosts.map((post) => (
                  <button
                    key={post._id}
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="min-w-0 overflow-hidden rounded-xl border border-[#EDE0FF] bg-[#F7F3FF] text-left hover:shadow-md"
                  >
                    {post.image ? (
                      <img
                        src={post.image}
                        alt="Liked post"
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center overflow-hidden p-3 text-sm text-[#4B187E]">
                        <p className="line-clamp-6 break-words">
                          {post.content || "Post"}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2 py-2 text-xs text-[#61269B] sm:px-3 sm:text-sm">
                      <Heart size={15} fill="#61269B" />
                      {Array.isArray(post.likes) ? post.likes.length : 0}
                      <span className="text-gray-500">Likes</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center">
                <Heart size={38} className="mx-auto text-[#B99AE8]" />
                <h3 className="mt-3 font-bold text-[#4B187E]">
                  No liked posts yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Posts you like will appear here.
                </p>
              </div>
            )}
          </section>
        </main>

        <div className="hidden min-w-0 xl:block">
          <div className="sticky top-24">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Followers / Following Modal */}
      {connectionType && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConnectionType("")}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold capitalize text-[#4B187E]">
                {connectionType}
              </h2>
              <button
                onClick={() => setConnectionType("")}
                className="rounded-lg p-2 text-gray-500 hover:bg-[#F7F3FF]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {connectionsLoading ? (
              <div className="flex justify-center py-8 text-[#61269B]">
                <LoaderCircle className="animate-spin" size={28} />
              </div>
            ) : connectionsError ? (
              <p className="py-5 text-sm text-red-600">{connectionsError}</p>
            ) : connections.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No {connectionType} yet.
              </p>
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {connections.map((person) => (
                  <div
                    key={person._id}
                    className="flex items-center gap-3 rounded-xl p-3"
                  >
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDE0FF] text-[#61269B]">
                        <UserRound size={23} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#4B187E]">
                        {person.fullName || "User"}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        @{person.userName || "username"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
