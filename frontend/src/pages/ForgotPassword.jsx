import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import toast from "react-hot-toast";

const API_URL = "https://connecthub-backend-zf8y.onrender.com/api/v1";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      // 🔍 Debugging ke liye console me check karein response kya hai
      console.log("Forgot Password Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      toast.success(data.message || "Reset request successful!");

      // Backend ke alag-alag response formats ko handle karne ke liye:
      const token = 
        data.resetToken || 
        data.token || 
        data.data?.resetToken || 
        data.data?.token || 
        data.resetPasswordToken;

      if (token) {
        // Agar token mil gaya, toh redirect karein
        navigate(`/reset-password/${token}`);
      } else {
        // Agar backend sirf email bhej raha hai aur token response me nahi hai
        toast.success("Reset instructions sent to your email.");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-[#4B187E]">
          Forgot Password?
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Enter your registered email to request a password reset.
        </p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            autoComplete="off"
            required
            className="w-full rounded-xl border border-purple-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#4B187E] px-4 py-3 font-semibold text-white transition hover:bg-[#61269B] disabled:opacity-60"
        >
          {loading ? "Generating Token..." : "Reset Password"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#61269B] hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;