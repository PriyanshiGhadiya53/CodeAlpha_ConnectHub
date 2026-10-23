import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8000/api/v1";

function Login() {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // Disable readOnly after render to trick browser autofill managers
  useEffect(() => {
    const timer = setTimeout(() => setIsReadOnly(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: emailOrUsername,
          username: emailOrUsername,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid email or password!");
        return;
      }

      toast.success("Logged in successfully!");

      setEmailOrUsername("");
      setPassword("");
      setShowPassword(false);

      navigate("/");
    } catch (error) {
      console.error("An error occurred during login:", error);
      toast.error("Network error! Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Log in to continue connecting with your community."
    >
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
        
        {/* Dummy hidden inputs to catch browser auto-fill */}
        <input type="text" name="prevent_autofill" className="hidden" tabIndex="-1" />
        <input type="password" name="password_prevent_autofill" className="hidden" tabIndex="-1" />

        {/* Username / Email Field */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Username or Email
          </label>
          <input
            type="text"
            name="connecthub_user_identifier"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="Enter your username or email"
            autoComplete="one-time-code" /* Chrome suppresses autofill for OTP inputs */
            readOnly={isReadOnly}
            onFocus={() => setIsReadOnly(false)}
            required
            className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-[#61269B] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="flex rounded-xl border border-purple-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100">
            <input
              type={showPassword ? "text" : "password"}
              name="connecthub_user_pass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password" /* Prevents browser saved password dropdown */
              readOnly={isReadOnly}
              onFocus={() => setIsReadOnly(false)}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#4B187E] px-4 py-3 font-semibold text-white transition hover:bg-[#61269B] disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-purple-700 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;