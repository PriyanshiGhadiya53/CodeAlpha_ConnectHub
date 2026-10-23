import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, LoaderCircle, Heart, MessageSquare } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import RightSidebar from "../components/RightSidebar.jsx";

const API_URL = "https://connecthub-backend-zf8y.onrender.com/api/v1";

function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/bookmarks`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setBookmarks(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || "Bookmarks load nahi hue.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3FF]">
      

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </div>

        <main className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-[#E6D9F5] bg-white p-5 shadow-sm sm:p-6">
            <h1 className="flex items-center gap-2.5 text-xl font-black text-[#4B187E]">
              <Bookmark className="text-purple-600" size={24} /> Saved Bookmarks
            </h1>
            <p className="mt-1 text-xs text-gray-500">
          All your saved posts will appear here.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20 text-purple-600">
              <LoaderCircle className="animate-spin" size={32} />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-[#E6D9F5] bg-white p-12 text-center shadow-sm">
              <Bookmark size={48} className="mx-auto text-purple-300 mb-3" />
              <h3 className="font-bold text-[#4B187E] text-lg">No saved bookmarks yet</h3>
              <p className="text-sm text-gray-500 mt-1">
              You can save any post here by clicking the bookmark icon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {bookmarks.map((item) => {
                const post = item.post;
                if (!post) return null;

                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="cursor-pointer rounded-2xl border border-[#E6D9F5] bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4B187E] text-white font-black text-sm">
                        {(post.author?.fullName || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">
                          {post.author?.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{post.author?.userName || "username"}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                      {post.content}
                    </p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post media"
                        className="h-40 w-full rounded-xl object-cover mb-3"
                      />
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 pt-2 border-t border-purple-50">
                      <span className="flex items-center gap-1 text-[#61269B]">
                        <Heart size={14} /> {post.likes?.length || 0} Likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} /> Comments
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <div className="hidden xl:block">
          <div className="sticky top-24">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bookmarks;