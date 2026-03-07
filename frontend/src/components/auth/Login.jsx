import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import GoogleSignInButton from "./GoogleSignInButton";
import { showSuccessToast, showErrorToast } from "../ui/Toast";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post(
        '/auth/login',
        formData,
        {
          withCredentials: true,
        }
      );

      // Store user data in localStorage (token is handled via cookies)
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      // Show success toast
      showSuccessToast("Login successful! Redirecting to dashboard...");

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred during login";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#6B9B8E] flex items-center justify-center border-2 border-black">
            <span className="text-white font-bold text-xl">$</span>
          </div>
          <span className="text-sm font-bold text-[#6B9B8E]">SMART PRICE TRACKER</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#6B9B8E] font-semibold hover:text-[#5A8A7D] transition-colors">
            Sign up
          </Link>
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-black text-red-700 font-medium text-sm drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
          {error}
        </div>
      )}

      {/* Google Sign-In Button */}
      <div className="mb-6">
        <GoogleSignInButton />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-black"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-600 font-semibold">Or continue with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="emailOrUsername"
            className="block text-sm font-bold text-gray-900 mb-2"
          >
            User name / Email
          </label>
          <input
            type="text"
            id="emailOrUsername"
            name="emailOrUsername"
            value={formData.emailOrUsername}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E] transition-colors"
            placeholder=""
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-gray-900 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E] transition-colors pr-16"
              placeholder=""
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B9B8E] hover:text-[#5A8A7D] font-semibold text-sm cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 accent-[#6B9B8E] border-2 border-black"
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-[#6B9B8E] font-semibold hover:text-[#5A8A7D] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#F4A460] text-white py-3 font-bold hover:bg-[#E89450] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-black cursor-pointer drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>

      {/* Legal */}
      <div className="mt-6 text-center text-sm text-gray-600">
        By logging in, you agree to our{" "}
        <Link to="/terms" className="text-[#6B9B8E] font-semibold hover:text-[#5A8A7D]">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-[#6B9B8E] font-semibold hover:text-[#5A8A7D]">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

export default Login;
