import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8000/api/v1";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          userName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed!");
        return;
      }

      toast.success("Registration successful! Redirecting to login...");

      // Reset form fields
      setFullName("");
      setUserName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Register Error:", err);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join ConnectHub and start connecting with people."
    >
      {/* autoComplete="off" on entire form */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        
        {/* Full Name Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="new-user-fullname"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="off"
            required
            className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Username Input - Fixed onChange handler & autocomplete */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            User Name
          </label>
          <input
            type="text"
            name="new-user-username"
            placeholder="Choose a username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)} /* Fixed: setUserName instead of setEmail */
            autoComplete="off"
            required
            className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="new-user-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
            className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>

          <div className="flex rounded-xl border border-purple-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100">
            <input
              type={showPassword ? "text" : "password"}
              name="new-user-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" /* Prevents saved password popups */
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
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-purple-700 hover:underline"
          >
            Log In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;