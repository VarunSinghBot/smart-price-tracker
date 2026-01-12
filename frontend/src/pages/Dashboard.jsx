import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (!userData || !token) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-2xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.name || user.username}! 🎉
            </h1>
            <p className="text-blue-100 text-lg">
              You're successfully logged into your Smart Price Tracker dashboard
            </p>
          </div>

          {/* User Credentials Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Account Details
              </h2>
              <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-6">
              {/* User ID */}
              <div className="border-l-4 border-blue-600 pl-4">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  User ID
                </label>
                <p className="text-lg font-mono text-gray-900 mt-1">{user.id}</p>
              </div>

              {/* Username */}
              <div className="border-l-4 border-purple-600 pl-4">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Username
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  @{user.username}
                </p>
              </div>

              {/* Email */}
              <div className="border-l-4 border-green-600 pl-4">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Email Address
                </label>
                <p className="text-lg text-gray-900 mt-1">{user.email}</p>
              </div>

              {/* Name */}
              {user.name && (
                <div className="border-l-4 border-yellow-600 pl-4">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <p className="text-lg text-gray-900 mt-1">{user.name}</p>
                </div>
              )}

              {/* Account Created */}
              {user.createdAt && (
                <div className="border-l-4 border-pink-600 pl-4">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Member Since
                  </label>
                  <p className="text-lg text-gray-900 mt-1">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow text-left group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Add Product</h3>
              <p className="text-sm text-gray-600">Start tracking a new product</p>
            </button>

            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow text-left group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">View Tracked</h3>
              <p className="text-sm text-gray-600">See all your products</p>
            </button>

            <button
              onClick={handleLogout}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow text-left group"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Logout</h3>
              <p className="text-sm text-gray-600">Sign out of your account</p>
            </button>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-linear-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                  Dashboard Features Coming Soon!
                </h3>
                <p className="text-yellow-700">
                  Product tracking, price alerts, and deal intelligence features are currently under development.
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
