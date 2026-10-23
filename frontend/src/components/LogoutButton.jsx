
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LoaderCircle } from "lucide-react";

function LogoutButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/user/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title="Logout"
      className="flex items-center gap-2 rounded-xl px-3 py-2
        text-red-600 transition hover:bg-red-50
        disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle size={20} className="animate-spin" />
      ) : (
        <LogOut size={20} />
      )}

      <span>{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}

export default LogoutButton;
