import { NavLink } from "react-router-dom";
import {
  Home,
  Compass,
  PlusSquare,
   MessageSquare,
  UserRound,
} from "lucide-react";

const items = [
  { label: "Home", path: "/", icon: Home },
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Create", path: "/create-post", icon: PlusSquare },
  { label: "Messages", path: "/messages", icon: MessageSquare },
  { label: "Profile", path: "/profile", icon: UserRound },
];

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] border-t border-purple-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-5px_20px_rgba(75,24,126,0.10)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition sm:text-xs ${
                  isActive
                    ? "text-[#61269B]"
                    : "text-gray-500 hover:text-[#61269B]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-10 items-center justify-center rounded-xl transition ${
                      isActive ? "bg-[#EDE0FF]" : ""
                    }`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </span>
                  <span className="max-w-full truncate">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;