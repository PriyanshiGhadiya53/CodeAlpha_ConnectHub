import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8000/api/v1";

function ResetPassword() {
  const { token } = useParams(); // URL path se reset token read karega
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/user/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      toast.success("Password reset successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Invalid or expired token!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-[#4B187E]">
          Set New Password
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            New Password
          </label>

          <div className="flex rounded-xl border border-purple-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
              className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-4 text-sm font-medium text-purple-700 transition hover:text-purple-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#4B187E] px-4 py-3 font-semibold text-white transition hover:bg-[#61269B] disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <p className="text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="font-semibold text-[#61269B] hover:underline"
          >
            Cancel and Back to Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;