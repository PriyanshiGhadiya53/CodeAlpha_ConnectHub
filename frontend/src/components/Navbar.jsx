
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Profile", path: "/profile", icon: UserRound },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/15 bg-gradient-to-r from-[#4B187E] via-[#61269B] to-[#4B187E] text-white shadow-lg transition-all">
      {/* Main Navbar Bar */}
      <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 transition hover:opacity-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 sm:h-11 sm:w-11">
            <UsersRound
              size={22}
              className="sm:hidden"
              strokeWidth={2.5}
            />
            <UsersRound
              size={25}
              className="hidden sm:block"
              strokeWidth={2.5}
            />
          </div>

          <span className="text-lg font-extrabold tracking-tight sm:text-2xl">
            Connect<span className="text-purple-200">Hub</span>
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="relative mx-4 hidden max-w-lg flex-1 md:block">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200"
          />
          <input
            type="search"
            placeholder="Search people, posts, or hashtags..."
            aria-label="Search"
            className="w-full rounded-2xl border border-white/20 bg-white/10 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-purple-200 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/10"
          />
        </div>

        {/* Desktop Navigation Links */}
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

        {/* Login Button and Mobile Menu */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#61269B] shadow-md transition hover:-translate-y-0.5 hover:bg-purple-50 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <LogIn size={17} />
            <span>Login</span>
          </Link>

          {/* Mobile Menu Toggle */}
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
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-200"
          />
          <input
            type="search"
            placeholder="Search people and posts..."
            aria-label="Search"
            className="w-full rounded-xl border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-purple-200 focus:border-white/50 focus:bg-white/15"
          />
        </div>
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
