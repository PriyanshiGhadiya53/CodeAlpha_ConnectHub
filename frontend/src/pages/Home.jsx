import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  Compass,
  MessageSquare,
  Bookmark,
  Search,
  Heart,
  MessageCircle,
  Share2,
  PlusSquare,
  UserRound,
  TrendingUp,
  Sparkles,
  UsersRound,
  UserPlus,
  Check,
  LoaderCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8000/api/v1";

const trends = [
  { tag: "#WebDevelopment", category: "Technology" },
  { tag: "#ReactJS", category: "Programming" },
  { tag: "#TailwindCSS", category: "Web Design" },
  { tag: "#UIDesign", category: "Design" },
];

async function readResponse(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Server se valid response nahi mila.");
  }
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [following, setFollowing] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const navItems = [
    { label: "Home", icon: HomeIcon, path: "/" },
    { label: "Explore", icon: Compass, path: "/explore" },
    { label: "Messages", icon: MessageSquare, path: "/messages" },
    { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  ];

  const getPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/post`, {
        credentials: "include",
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Posts load nahi hui.");
      }

      setPosts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || "Backend connection error.");
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedUsers = async () => {
    try {
      setPeopleLoading(true);
      setPeopleError("");

      const [suggestionsRes, meRes] = await Promise.all([
        fetch(`${API_URL}/user/suggestions`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/user/me`, {
          credentials: "include",
        }),
      ]);

      const suggestionsData = await readResponse(suggestionsRes);
      const meData = await readResponse(meRes);

      if (!suggestionsRes.ok) {
        throw new Error(
          suggestionsData.message || "Suggested users load nahi hue."
        );
      }

      if (!meRes.ok) {
        throw new Error(meData.message || "Login check nahi ho paya.");
      }

      const user = meData.data || {};
      const userId = String(user._id || user.id || "");

      setCurrentUserId(userId);

      const users = Array.isArray(suggestionsData.data)
        ? suggestionsData.data
        : [];

      setPeople(
        users
          .filter(
            (person) =>
              String(person._id || person.id) !== userId
          )
          .slice(0, 5)
      );

      setFollowing(
        (user.following || []).map((person) =>
          String(person?._id || person?.id || person)
        )
      );
    } catch (err) {
      setPeopleError(
        err.message || "Suggested users load nahi hue."
      );
    } finally {
      setPeopleLoading(false);
    }
  };

  const getBookmarks = async () => {
    try {
      const res = await fetch(`${API_URL}/bookmarks`, {
        credentials: "include",
      });

      const data = await readResponse(res);

      if (!res.ok) return;

      const bookmarks = Array.isArray(data.data) ? data.data : [];

      setSavedPosts(
        bookmarks
          .map((item) => {
            const post = item.post;
            return String(post?._id || post?.id || "");
          })
          .filter(Boolean)
      );
    } catch (err) {
      console.error("Get bookmarks error:", err);
    }
  };

  useEffect(() => {
    getPosts();
    getSuggestedUsers();
    getBookmarks();
  }, [location.key]);

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/post/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Like nahi ho saka.");
      }

      toast.success(data.message || "Like updated!");
      await getPosts();
    } catch (err) {
      toast.error(err.message || "Like karne mein error aaya.");
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/bookmarks/${postId}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Bookmark failed.");
      }

      const isSaved = data.data?.bookmarked;

      setSavedPosts((previous) =>
        isSaved
          ? [...new Set([...previous, String(postId)])]
          : previous.filter((id) => id !== String(postId))
      );

      toast.success(
        isSaved ? "Post saved!" : "Post removed from bookmarks!"
      );
    } catch (err) {
      toast.error(err.message || "Bookmark karne mein error aaya.");
    }
  };

  const handleShare = async (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Post link copied!");
    } catch {
      toast.error("Link copy nahi ho saka.");
    }
  };

  const deletePost = async (postId) => {
    try {
      setDeletingId(String(postId));

      const res = await fetch(`${API_URL}/post/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Post delete nahi hui.");
      }

      setPosts((previous) =>
        previous.filter(
          (post) => String(post._id || post.id) !== String(postId)
        )
      );

      toast.success("Post deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Post delete karne mein error aaya.");
    } finally {
      setDeletingId("");
    }
  };

  const handleDelete = (postId) => {
    toast(
      (t) => (
        <div>
          <p className="font-semibold">
            Delete this post?
          </p>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                toast.dismiss(t.id);
                deletePost(postId);
              }}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        id: `confirm-delete-${postId}`,
        duration: Infinity,
      }
    );
  };

  const handleFollow = async (personId) => {
    const id = String(personId);

    try {
      setBusyId(id);
      setPeopleError("");

      const res = await fetch(`${API_URL}/user/follow/${id}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Follow action fail hua.");
      }

      const message = (data.message || "").toLowerCase();
      const isNowFollowing =
        message.includes("follow") && !message.includes("unfollow");

      setFollowing((previous) =>
        isNowFollowing
          ? previous.includes(id)
            ? previous
            : [...previous, id]
          : previous.filter((userId) => userId !== id)
      );

      toast.success(data.message || "Follow status updated!");
    } catch (err) {
      setPeopleError(err.message || "Follow action fail hua.");
    } finally {
      setBusyId("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredPosts = posts.filter((post) => {
    const text = `${post.content || ""} ${
      post.author?.fullName || ""
    } ${post.author?.userName || ""}`;

    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F7F3FF] pb-20 text-gray-800 sm:pb-24 lg:pb-6">
      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-4 px-3 py-4 sm:gap-6 sm:px-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[280px_minmax(0,1fr)_320px] xl:gap-8">

        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex h-[calc(100vh-120px)] flex-col justify-between rounded-3xl border border-purple-100 bg-white p-5 shadow-sm xl:p-6">
            <div>
              <h2 className="mb-7 text-2xl font-black text-[#4B187E]">
                ConnectHub
              </h2>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;

                  return (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left font-bold transition ${
                        active
                          ? "bg-[#4B187E] text-white shadow-md shadow-purple-200"
                          : "text-gray-600 hover:bg-purple-50 hover:text-[#4B187E]"
                      }`}
                    >
                      <Icon size={21} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={() => navigate("/create-post")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4B187E] to-[#61269B] px-4 py-3.5 font-bold text-white shadow-md transition hover:-translate-y-0.5"
              >
                <PlusSquare size={21} />
                Create Post
              </button>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 p-3 text-left transition hover:bg-purple-100"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4B187E] text-white">
                <UserRound size={23} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900">
                  My Profile
                </p>
                <p className="text-xs text-purple-600">
                  View your account
                </p>
              </div>
            </button>
          </div>
        </aside>

        {/* CENTER FEED */}
        <main className="mx-auto w-full min-w-0 max-w-2xl space-y-4 sm:space-y-6">
          {/* Feed heading */}
          <section className="flex items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-black text-[#4B187E] sm:text-2xl">
                Home Feed
                <Sparkles size={19} className="shrink-0 text-purple-500" />
              </h1>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Discover updates from your community.
              </p>
            </div>

            <button
              onClick={() => {
                getPosts();
                getBookmarks();
              }}
              aria-label="Refresh posts"
              className="flex shrink-0 items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-xs font-bold text-[#61269B] transition hover:bg-purple-100 sm:px-4"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </section>

          {/* Search posts */}
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search community, posts, hashtags..."
              aria-label="Search posts"
              className="w-full rounded-2xl border border-purple-100 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#61269B] focus:ring-2 focus:ring-purple-100 sm:py-4 sm:pl-12"
            />
          </div>

          {/* Errors */}
          {error && (
            <div className="break-words rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
              <button
                onClick={getPosts}
                className="ml-2 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="rounded-3xl border border-purple-100 bg-white p-12 text-center">
              <LoaderCircle
                size={32}
                className="mx-auto mb-3 animate-spin text-[#61269B]"
              />
              <p className="font-semibold text-purple-700">
                Loading latest posts...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-purple-100 bg-white px-5 py-14 text-center shadow-sm">
              <MessageCircle
                size={42}
                className="mx-auto mb-4 text-[#61269B]"
              />
              <h2 className="text-xl font-bold text-[#4B187E]">
                {search ? "No matching posts" : "No posts available"}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try another keyword."
                  : "Be the first to create a post!"}
              </p>
              {!search && (
                <button
                  onClick={() => navigate("/create-post")}
                  className="mt-5 rounded-xl bg-[#4B187E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#61269B]"
                >
                  Create your first post
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => {
              const postId = String(post._id || post.id);
              const authorId = String(
                post.author?._id || post.author?.id || ""
              );
              const isOwner =
                currentUserId && authorId === currentUserId;
              const isSaved = savedPosts.includes(postId);

              return (
                <article
                  key={postId}
                  className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition hover:shadow-md sm:rounded-3xl"
                >
                  {/* Author */}
                  <div className="flex items-center justify-between gap-2 p-4 pb-3 sm:p-5 sm:pb-4">
                    <button
                      onClick={() =>
                        post.author?.userName &&
                        navigate(
                          `/profile/${encodeURIComponent(post.author.userName)}`
                        )
                      }
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.fullName || "User"}
                          className="h-10 w-10 shrink-0 rounded-xl border border-purple-100 object-cover sm:h-12 sm:w-12 sm:rounded-2xl"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B187E] text-white sm:h-12 sm:w-12 sm:rounded-2xl">
                          <UserRound size={23} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-extrabold text-gray-900 sm:text-base">
                          {post.author?.fullName || "ConnectHub User"}
                        </h3>
                        <p className="truncate text-[11px] font-medium text-purple-600 sm:text-xs">
                          {post.author?.userName
                            ? `@${post.author.userName} · `
                            : ""}
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => handleDelete(postId)}
                        disabled={deletingId === postId}
                        title="Delete your post"
                        aria-label="Delete post"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === postId ? (
                          <LoaderCircle size={19} className="animate-spin" />
                        ) : (
                          <Trash2 size={19} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Post text */}
                  {post.content && (
                    <p className="whitespace-pre-wrap break-words px-4 pb-4 text-sm leading-relaxed text-gray-800 sm:px-5">
                      {post.content}
                    </p>
                  )}

                  {/* Post image */}
                  {post.image && (
                    <div className="w-full overflow-hidden bg-purple-50">
                      <img
                        src={post.image}
                        alt="Post attachment"
                        loading="lazy"
                        onError={() =>
                          toast.error("Post image load nahi hui.")
                        }
                        className="block max-h-[580px] w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Likes and comments count */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-purple-100 px-4 py-3 text-xs font-bold text-purple-600 sm:px-5 sm:text-sm">
                    <span>
                      {Array.isArray(post.likes)
                        ? post.likes.length
                        : Number(post.likes) || 0}{" "}
                      Likes
                    </span>
                    <span>
                      {post.commentsCount ??
                        post.commentCount ??
                        post.comments?.length ??
                        0}{" "}
                      Comments
                    </span>
                  </div>

                  {/* Post actions */}
                  <div className="grid grid-cols-4 gap-1 p-2 sm:p-3">
                    <button
                      onClick={() => handleLike(postId)}
                      className="flex min-w-0 items-center justify-center gap-1 rounded-xl py-3 text-[10px] font-bold text-gray-600 transition hover:bg-purple-50 hover:text-red-500 sm:gap-1.5 sm:text-xs"
                    >
                      <Heart size={17} />
                      <span>Like</span>
                    </button>

                    <button
                      onClick={() => navigate(`/post/${postId}`)}
                      className="flex min-w-0 items-center justify-center gap-1 rounded-xl py-3 text-[10px] font-bold text-gray-600 transition hover:bg-purple-50 hover:text-[#61269B] sm:gap-1.5 sm:text-xs"
                    >
                      <MessageCircle size={17} />
                      <span>Comment</span>
                    </button>

                    <button
                      onClick={() => handleShare(postId)}
                      className="flex min-w-0 items-center justify-center gap-1 rounded-xl py-3 text-[10px] font-bold text-gray-600 transition hover:bg-purple-50 hover:text-[#61269B] sm:gap-1.5 sm:text-xs"
                    >
                      <Share2 size={17} />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => handleBookmark(postId)}
                      className={`flex min-w-0 items-center justify-center gap-1 rounded-xl py-3 text-[10px] font-bold transition sm:gap-1.5 sm:text-xs ${
                        isSaved
                          ? "bg-purple-100 text-[#4B187E]"
                          : "text-gray-600 hover:bg-purple-50 hover:text-[#61269B]"
                      }`}
                    >
                      <Bookmark
                        size={17}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                      <span>{isSaved ? "Saved" : "Save"}</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden space-y-6 xl:block">
          {/* Trending */}
          

          {/* Suggested users */}
          <section className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm xl:p-6">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-lg font-black text-[#4B187E]">
                Suggested for You
              </h2>
              <UsersRound size={21} className="shrink-0 text-[#61269B]" />
            </div>

            <p className="mb-4 text-sm text-purple-400">
              Discover people in your community.
            </p>

            {peopleLoading ? (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-purple-600">
                <LoaderCircle size={18} className="animate-spin" />
                Loading people...
              </div>
            ) : peopleError ? (
              <div className="space-y-3">
                <p className="break-words text-sm text-red-500">
                  {peopleError}
                </p>
                <button
                  onClick={getSuggestedUsers}
                  className="rounded-xl bg-[#61269B] px-4 py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : people.length === 0 ? (
              <p className="py-3 text-sm text-gray-500">
                No suggested users available right now.
              </p>
            ) : (
              <div className="space-y-4">
                {people.map((person) => {
                  const id = String(person._id || person.id);
                  const isFollowing = following.includes(id);
                  const isBusy = busyId === id;

                  return (
                    <div key={id} className="flex min-w-0 items-center gap-3">
                      {person.avatar ? (
                        <img
                          src={person.avatar}
                          alt={person.fullName || "User"}
                          className="h-10 w-10 shrink-0 rounded-xl border border-purple-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B187E] text-white">
                          <UserRound size={21} />
                        </div>
                      )}

                      <button
                        onClick={() =>
                          person.userName &&
                          navigate(
                            `/profile/${encodeURIComponent(person.userName)}`
                          )
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-extrabold text-gray-900">
                          {person.fullName || person.userName}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          @{person.userName}
                        </p>
                      </button>

                      <button
                        onClick={() => handleFollow(id)}
                        disabled={isBusy}
                        className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold disabled:opacity-60 ${
                          isFollowing
                            ? "bg-purple-100 text-[#4B187E]"
                            : "bg-[#4B187E] text-white hover:bg-[#61269B]"
                        }`}
                      >
                        {isBusy ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : isFollowing ? (
                          <Check size={14} />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate("/explore")}
              className="mt-5 w-full rounded-xl bg-[#61269B] py-3 font-semibold text-white transition hover:bg-[#4B187E]"
            >
              Find More People
            </button>
          </section>

          <div className="px-3 text-xs leading-relaxed text-gray-400">
            About · Privacy · Community Guidelines
            <br />
            © 2026 ConnectHub
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;