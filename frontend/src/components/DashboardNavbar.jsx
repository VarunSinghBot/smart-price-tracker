import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DashboardNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  return (
    <nav className="bg-[#799b6b] border-b-4 border-black sticky top-0 z-50 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#6B9B8E] flex items-center justify-center border-2 border-black">
              <span className="text-white font-bold text-xl">💰</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Smart Price Tracker
            </span>
            <span className="text-xl font-bold text-white sm:hidden">
              Dashboard
            </span>
          </div>

          {/* Search Bar - Center
          <div className="flex-1 max-w-xl mx-8 hidden md:block bg-[#F4A460]">
            bg-[#E8F4F1]
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, platforms, or deals..."
                className="w-full pl-12 pr-4 py-2 bg-white border-3 border-black focus:outline-none focus:border-[#F4A460] text-gray-800 placeholder-gray-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              />
              <svg className="absolute left-4 top-2.5 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div> */}

          {/* Right Side - User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="w-10 h-10 bg-[#4A7C6F] border-2 border-black flex items-center justify-center hover:bg-[#3A6C5F] transition-colors drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#4A7C6F] border-2 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user?.name || user?.username || "User"}</p>
                <p className="text-xs text-gray-200">Smart Shopper</p>
              </div>
              <div className="w-10 h-10 bg-[#F4A460] border-2 border-black flex items-center justify-center text-white text-lg font-bold">
                {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#F4A460] text-white font-medium hover:bg-[#E89450] transition-colors border-2 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hidden md:block"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
