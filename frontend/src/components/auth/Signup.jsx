import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import GoogleSignInButton from "./GoogleSignInButton";
import { showSuccessToast, showErrorToast, showWarningToast } from "../ui/Toast";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validatePassword = () => {
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!passwordRequirements.test(formData.password)) {
      return "Password must contain uppercase, lowercase, number, and special character";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Passwords don't match";
      setError(errorMsg);
      showWarningToast(errorMsg);
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      showWarningToast(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(
        "/auth/signup",
        {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        {
          withCredentials: true,
        }
      );

      // Store user data in localStorage (token is handled via cookies)
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      // Show success toast
      showSuccessToast("Account created successfully! Welcome aboard!");

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "An error occurred during signup";
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
          Create an account
        </h1>
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#6B9B8E] font-semibold hover:text-[#5A8A7D] transition-colors">
            Log in
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
            htmlFor="username"
            className="block text-sm font-bold text-gray-900 mb-2"
          >
            User name
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E] transition-colors"
            placeholder=""
            required
            minLength={3}
            maxLength={30}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-bold text-gray-900 mb-2"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
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
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B9B8E] hover:text-[#5A8A7D] font-semibold text-sm cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Use 8 or more characters with a mix of letters, numbers & symbols
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-bold text-gray-900 mb-2"
          >
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E] transition-colors"
            placeholder=""
            required
          />
        </div>

        <div className="text-sm text-gray-600">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="text-[#6B9B8E] font-semibold hover:text-[#5A8A7D]">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-[#6B9B8E] font-semibold hover:text-[#5A8A7D]">
            Privacy Policy
          </Link>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notRobot"
            required
            className="w-4 h-4 accent-[#6B9B8E] border-2 border-black"
          />
          <label htmlFor="notRobot" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
            I'm not a robot
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#F4A460] text-white py-3 font-bold hover:bg-[#E89450] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-black cursor-pointer drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        >
          {isLoading ? "Creating account..." : "Create an account"}
        </button>
      </form>

      {/* Bottom Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-[#6B9B8E] font-semibold hover:text-[#5A8A7D] transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Signup;
