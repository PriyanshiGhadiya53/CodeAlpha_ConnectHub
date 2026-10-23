
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersRound,
  UserPlus,
  UserRound,
  Check,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://localhost:8000/api/v1";



async function getResponseData(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Server se valid JSON nahi mila. Backend URL aur server check karo."
    );
  }
}

function RightSidebar() {
  const navigate = useNavigate();

  const [people, setPeople] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      setLoading(true);
      setError("");

      const [suggestionsResponse, meResponse] = await Promise.all([
        fetch(`${API_URL}/user/suggestions`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/user/me`, {
          credentials: "include",
        }),
      ]);

      const suggestionsData = await getResponseData(suggestionsResponse);
      const meData = await getResponseData(meResponse);

      if (!suggestionsResponse.ok) {
        throw new Error(
          suggestionsData.message || "Suggested users load nahi hue."
        );
      }

      if (!meResponse.ok) {
        throw new Error(meData.message || "Login check nahi ho paya.");
      }

      const currentUser = meData.data;
      const currentId = String(currentUser?._id || currentUser?.id || "");

      const users = Array.isArray(suggestionsData.data)
        ? suggestionsData.data
        : [];

      setPeople(
        users
          .filter(
            (person) =>
              String(person._id || person.id) !== currentId
          )
          .slice(0, 5)
      );

      setFollowing(
        (currentUser?.following || []).map((person) =>
          String(person?._id || person?.id || person)
        )
      );
    } catch (err) {
      setError(err.message || "Suggested users load nahi hue.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (personId) => {
    const id = String(personId);

    try {
      setBusyId(id);
      setError("");

      const response = await fetch(`${API_URL}/user/follow/${id}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(data.message || "Follow action fail hua.");
      }

      const isNowFollowing =
        (data.message || "").toLowerCase().includes("followed") &&
        !(data.message || "").toLowerCase().includes("unfollowed");

      setFollowing((previous) => {
        if (isNowFollowing) {
          return previous.includes(id) ? previous : [...previous, id];
        }

        return previous.filter((followingId) => followingId !== id);
      });
    } catch (err) {
      setError(err.message || "Follow action fail hua.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#4B187E]">
            Suggested for You
          </h2>
          <UsersRound className="h-6 w-6 text-[#61269B]" />
        </div>

        <p className="mb-5 text-sm text-purple-400">
          Discover people in your community.
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-purple-600">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading people...</span>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="break-words text-sm text-red-500">{error}</p>
            <button
              onClick={loadPeople}
              className="rounded-lg bg-[#61269B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4B187E]"
            >
              Try Again
            </button>
          </div>
        ) : people.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">
            Abhi koi suggested user nahi mila. Baad mein dobara try karo.
          </p>
        ) : (
          <div className="space-y-4">
            {people.map((person) => {
              const id = String(person._id || person.id);
              const isFollowing = following.includes(id);
              const isBusy = busyId === id;

              return (
                <div key={id} className="flex items-center gap-3">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.fullName || "User"}
                      className="h-11 w-11 rounded-full border border-purple-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#61269B]">
                      <UserRound className="h-6 w-6" />
                    </div>
                  )}

                  <button
                    onClick={() =>
                      navigate(
                        `/profile/${encodeURIComponent(person.userName)}`
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {person.fullName || person.userName}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      @{person.userName}
                    </p>
                  </button>

                  <button
                    onClick={() => handleFollow(id)}
                    disabled={isBusy}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isFollowing
                        ? "border border-purple-200 bg-purple-50 text-[#61269B]"
                        : "bg-[#61269B] text-white hover:bg-[#4B187E]"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isBusy ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
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

      
    </aside>
  );
}

export default RightSidebar;
