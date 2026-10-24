
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  UsersRound,
  Search,
  Home,
  Compass,
  UserRound,
  LogIn,
  Menu,
  X,
} from "lucide-react";

const API_URL = "https://connecthub-backend-zf8y.onrender.com/api/v1";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Profile", path: "/profile", icon: UserRound },
  ];

  // Search users from backend
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        const response = await fetch(
         `${API_URL}/user/search?search=${encodeURIComponent(searchTerm.trim())}`,
          {
            signal: controller.signal,
            credentials: "include",
          }
        );

        const responseText = await response.text();

let result;

try {
  result = JSON.parse(responseText);
} catch {
  throw new Error(
    `Server ne JSON nahi bheja. Status: ${response.status}`
  );
}

if (!response.ok) {
  throw new Error(result.message || `HTTP ${response.status}`);
}

const users = result.data?.users ?? result.data ?? [];
setSearchResults(Array.isArray(users) ? users : []);


       
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
          setSearchResults([]);
          setSearchError("Search load nahi hui. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  const openUserProfile = (user) => {
    const username = user.userName || user.username;

    if (!username) return;

    setSearchTerm("");
    setSearchResults([]);
    setMenuOpen(false);
    navigate(`/profile/${username}`);
  };

  const renderSearchResults = () => {
    if (!searchTerm.trim()) return null;

    return (
      <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-80 overflow-y-auto rounded-2xl border border-purple-100 bg-white p-2 text-gray-800 shadow-2xl">
        {searchLoading && (
          <p className="p-3 text-sm text-gray-500">Searching...</p>
        )}

        {!searchLoading && searchError && (
          <p className="p-3 text-sm text-red-500">{searchError}</p>
        )}

        {!searchLoading &&
          !searchError &&
          searchResults.length === 0 && (
            <p className="p-3 text-sm text-gray-500">
              No users found.
            </p>
          )}

        {!searchLoading &&
          searchResults.map((user) => (
            <button
              key={user._id || user.id || user.userName}
              type="button"
              onClick={() => openUserProfile(user)}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-purple-50"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-[#61269B]">
                  {(user.fullName || user.userName || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user.fullName || user.userName || "User"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  @{user.userName || user.username || ""}
                </p>
              </div>
            </button>
          ))}
      </div>
    );
  };

  const searchInput = (mobile = false) => (
    <div className={`relative ${mobile ? "w-full" : "w-full"}`}>
      <Search
        size={mobile ? 17 : 19}
        className={`absolute top-1/2 -translate-y-1/2 text-purple-200 ${
          mobile ? "left-3.5" : "left-4"
        }`}
      />

      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={
          mobile
            ? "Search people..."
            : "Search people by name or username..."
        }
        aria-label="Search people"
        autoComplete="off"
        className={`w-full rounded-xl border border-white/20 bg-white/10 text-sm text-white outline-none transition placeholder:text-purple-200 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/10 ${
          mobile
            ? "py-2 pl-9 pr-3"
            : "rounded-2xl py-2.5 pl-11 pr-4"
        }`}
      />

      {renderSearchResults()}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/15 bg-gradient-to-r from-[#4B187E] via-[#61269B] to-[#4B187E] text-white shadow-lg">
      {/* Main Navbar */}
      <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 transition hover:opacity-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 sm:h-11 sm:w-11">
            <UsersRound size={22} className="sm:hidden" strokeWidth={2.5} />
            <UsersRound size={25} className="hidden sm:block" strokeWidth={2.5} />
          </div>

          <span className="text-lg font-extrabold tracking-tight sm:text-2xl">
            Connect<span className="text-purple-200">Hub</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="relative mx-4 hidden max-w-lg flex-1 md:block">
          {searchInput()}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1.5 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 font-semibold transition ${
                  active
                    ? "bg-white/20 text-white shadow-inner"
                    : "text-purple-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Login and Mobile Menu */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#61269B] shadow-md transition hover:bg-purple-50 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <LogIn size={17} />
            <span>Login</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition hover:bg-white/20 sm:h-10 sm:w-10 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="px-3 pb-3 md:hidden">
        {searchInput(true)}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/15 bg-[#4B187E] px-4 py-3 shadow-xl lg:hidden">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-purple-100 hover:bg-white/10"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
