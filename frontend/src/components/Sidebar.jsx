
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  MessageCircle,
  Bookmark,
  UserRound,
  UsersRound,
  PlusSquare,
} from "lucide-react";

const API_URL = "https://connecthub-backend-zf8y.onrender.com/api/v1";

const menuItems = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Explore", icon: Compass, path: "/explore" },
  { name: "Messages", icon: MessageCircle, path: "/messages" },
 
  { name: "Saved", icon: Bookmark, path: "/bookmarks" },
  { name: "Profile", icon: UserRound, path: "/profile" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${API_URL}/user/me`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.data) {
          setUser(data.data);

          const postsRes = await fetch(`${API_URL}/post`, {
            credentials: "include",
          });
          const postsData = await postsRes.json();

          if (postsRes.ok && Array.isArray(postsData.data)) {
            const userId = data.data._id || data.data.id;

            setPostsCount(
              postsData.data.filter((post) => {
                const authorId =
                  post.author?._id || post.author?.id || post.author;
                return String(authorId) === String(userId);
              }).length
            );
          }
        }
      } catch (error) {
        console.error("Sidebar user load error:", error);
      }
    };

    loadUser();
  }, []);

  return (
    <aside className="h-fit rounded-2xl border border-[#E6D9F5] bg-white p-5 shadow-sm">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left font-medium transition ${
                active
                  ? "bg-[#EDE0FF] text-[#61269B]"
                  : "text-[#45345F] hover:bg-[#F7F3FF]"
              }`}
            >
              <Icon size={22} />
              <span className="flex-1">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => navigate("/create-post")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#61269B] px-4 py-3 font-semibold text-white transition hover:bg-[#4B187E]"
      >
        <PlusSquare size={20} />
        Create Post
      </button>

      <div className="my-5 border-t border-[#EDE0FF]" />

      <h3 className="mb-4 text-sm font-semibold text-[#6B5A80]">
        My Profile
      </h3>

      <button
        onClick={() => navigate("/profile")}
        className="flex w-full items-center gap-3 text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE0FF] text-[#61269B]">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={26} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-bold text-[#352047]">
            {user?.fullName || "My Account"}
          </p>
          <p className="truncate text-sm text-[#8B7AA3]">
            @{user?.userName || "username"}
          </p>
        </div>
      </button>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#6B5A80]">
        {user?.bio || "Connect with your community ✨"}
      </p>

      <div className="mt-5 grid grid-cols-3 border-t border-[#EDE0FF] pt-4 text-center">
        <div>
          <p className="font-bold text-[#4B187E]">{postsCount}</p>
          <p className="text-xs text-[#8B7AA3]">Posts</p>
        </div>

        <div>
          <p className="font-bold text-[#4B187E]">
            {Array.isArray(user?.followers) ? user.followers.length : 0}
          </p>
          <p className="text-xs text-[#8B7AA3]">Followers</p>
        </div>

        <div>
          <p className="font-bold text-[#4B187E]">
            {Array.isArray(user?.following) ? user.following.length : 0}
          </p>
          <p className="text-xs text-[#8B7AA3]">Following</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-gradient-to-br from-[#4B187E] to-[#7C3AED] p-4 text-white">
        <div className="flex items-center gap-2 font-bold">
          <UsersRound size={23} />
          ConnectHub
        </div>
        <p className="mt-2 text-xs text-purple-100">
          Connect. Share. Grow.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
