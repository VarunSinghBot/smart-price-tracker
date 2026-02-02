import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setIsMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/#features" },
    { name: "Contact", path: "/contact" },
  ];

  const scrollToFeatures = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const featuresSection = document.getElementById("features");
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="bg-[#6B9B8E] border-b-4 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group hover:cursor-pointer">
            <div className="w-9 h-9 bg-white flex items-center justify-center border-2 border-black group-hover:bg-[#E8DCC4] transition-colors">
              <span className="text-[#6B9B8E] font-bold text-xl">$</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Smart Price Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={link.path === "/#features" ? scrollToFeatures : undefined}
                className="px-4 py-2 text-white hover:bg-white hover:text-[#6B9B8E] transition-all font-semibold border-2 border-transparent hover:border-black hover:cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-white text-[#6B9B8E] font-bold border-2 border-black hover:bg-[#E8DCC4] transition-colors hover:cursor-pointer"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium text-sm px-3 py-1 bg-[#5A8A7D] border-2 border-black">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors border-2 border-black hover:cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-white font-semibold hover:bg-white hover:text-[#6B9B8E] transition-all border-2 border-transparent hover:border-black hover:cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors border-2 border-black hover:cursor-pointer"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-white hover:text-[#6B9B8E] text-white transition-colors border-2 border-black bg-[#5A8A7D] hover:cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t-4 border-black">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={(e) => {
                  if (link.path === "/#features") scrollToFeatures(e);
                  setIsMenuOpen(false);
                }}
                className="block px-4 py-3 text-[#6B9B8E] hover:bg-[#E8DCC4] transition-colors font-semibold border-2 border-black hover:cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-3 border-t-2 border-[#6B9B8E] mt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center bg-[#6B9B8E] text-white font-bold hover:bg-[#5A8A7D] transition-colors border-2 border-black hover:cursor-pointer"
                  >
                    Go to Dashboard
                  </Link>
                  <div className="px-4 py-2 text-center text-[#6B9B8E] font-medium border-2 border-[#6B9B8E]">
                    {user?.username || user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-center bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors border-2 border-black hover:cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center text-[#6B9B8E] font-bold hover:bg-[#E8DCC4] transition-colors border-2 border-black hover:cursor-pointer"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors border-2 border-black hover:cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
