import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { showSuccessToast, showWarningToast, showErrorToast } from "../components/ui/Toast";
import { searchCrossPlatform, scrapeNewProduct, scrapeMultiPlatform, clearScrapedProduct } from "../store/scraperSlice";
import { fetchProducts } from "../store/productSlice";
import FindSimilarProductsModal from "../components/products/FindSimilarProductsModal";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state
  const { scrapedProduct, scrapedProducts, searchResults, scraping, searching, error: scrapeError } = useSelector((state) => state.scraper);
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [searchInput, setSearchInput] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState("");
  const [multiPlatformMode, setMultiPlatformMode] = useState(false);
  const [platformUrls, setPlatformUrls] = useState({
    amazon: "",
    flipkart: "",
    ebay: ""
  });
  const [showFindSimilarModal, setShowFindSimilarModal] = useState(false);
  const [productForSimilar, setProductForSimilar] = useState(null);

  // Sync activeTab with current route
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setActiveTab('home');
    } else if (location.pathname === '/trackers') {
      setActiveTab('trackers');
    } else if (location.pathname === '/chat') {
      setActiveTab('schedule');
    } else if (location.pathname === '/library') {
      setActiveTab('library');
    } else if (location.pathname === '/notifications') {
      setActiveTab('notifications');
    }
  }, [location.pathname]);

  // Function to validate if input is a URL
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Handle search input change and detect URLs
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  // Handle search execution (button click or Enter key)
  const handleSearch = async () => {
    const value = searchInput.trim();
    
    // Show modal and scrape if URL is provided
    if (value) {
      setDetectedUrl(value);
      setShowUrlModal(true);
      setMultiPlatformMode(false);
      
      // Clear any previous scraped product
      dispatch(clearScrapedProduct());
      
      // Search across all platforms using Redux action
      const result = await dispatch(searchCrossPlatform({ url: value }));
      
      if (searchCrossPlatform.fulfilled.match(result)) {
        showSuccessToast('Products found across platforms!');
      } else {
        showErrorToast(result.payload || 'Failed to search product');
      }
    }
  };

  // Handle multi-platform scraping
  const handleMultiPlatformScrape = async () => {
    const urls = Object.values(platformUrls).filter(url => url.trim());
    
    if (urls.length === 0) {
      showErrorToast('Please enter at least one product URL');
      return;
    }
    
    setShowUrlModal(true);
    dispatch(clearScrapedProduct());
    
    const result = await dispatch(scrapeMultiPlatform(urls));
    
    if (scrapeMultiPlatform.fulfilled.match(result)) {
      showSuccessToast(`Products scraped from ${result.payload.totalScraped} platform(s)!`);
    } else {
      showErrorToast(result.payload || 'Failed to scrape products');
    }
  };

  // Toggle multi-platform mode
  const toggleMultiPlatformMode = () => {
    setMultiPlatformMode(!multiPlatformMode);
    if (!multiPlatformMode) {
      // Clear single URL mode
      setSearchInput("");
      setDetectedUrl("");
    } else {
      // Clear multi-platform URLs
      setPlatformUrls({ amazon: "", flipkart: "", ebay: "" });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle adding product to tracker
  const handleTrackProduct = async () => {
    if (scrapedProduct && scrapedProduct.url) {
      try {
        // Save product to database
        const result = await dispatch(scrapeNewProduct(scrapedProduct.url));
        
        if (result.error) {
          showErrorToast('Failed to track product. Please try again.');
          return;
        }
        
        // Refresh products list to show the newly saved product
        await dispatch(fetchProducts());
        
        showSuccessToast(`${scrapedProduct.title} is now being tracked! You'll be notified when price drops.`);
        
        // Close modal and navigate to trackers page
        setTimeout(() => {
          handleCloseModal();
          navigate('/trackers');
        }, 500);
      } catch (error) {
        console.error('Error tracking product:', error);
        showErrorToast('Failed to track product. Please try again.');
      }
    }
  };

  // Handle find similar products
  const handleFindSimilar = (product) => {
    setProductForSimilar(product);
    setShowFindSimilarModal(true);
  };

  // Close modal and reset
  const handleCloseModal = () => {
    setShowUrlModal(false);
    setSearchInput("");
    setDetectedUrl("");
    setMultiPlatformMode(false);
    setPlatformUrls({ amazon: "", flipkart: "", ebay: "" });
    dispatch(clearScrapedProduct());
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      // Try to get user from localStorage first
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing cached user data:", error);
        }
      }

      // If no cached user, fetch from backend
      try {
        const response = await axios.get(
          '/auth/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
          }
        );

        const userData = response.data.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Token might be invalid, clear and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        '/auth/logout',
        {},
        {
          withCredentials: true,
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8DCC4]">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-t-4 border-b-4 border-[#6B9B8E] mx-auto mb-4"></div>
          <p className="text-[#6B9B8E] font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#E8DCC4] flex overflow-hidden">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[#6B9B8E] flex-col border-r-4 border-black z-40">
        {/* Logo/Brand */}
        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center text-white text-xl font-bold">
              💰
            </div>
            <span className="text-2xl font-bold text-black">PRICE TRACKER</span>
          </div>
        </div>

        {/* Search Bar */}
        {/* <div className="px-4 py-4 border-b-2 border-black">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black text-gray-800 font-medium placeholder-gray-500 focus:outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div> */}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => {
              setActiveTab('home');
              navigate('/dashboard');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold transition-colors hover:cursor-pointer ${
              activeTab === "home"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-[#5A8A7D] hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('schedule');
              navigate('/chat');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold transition-colors hover:cursor-pointer ${
              activeTab === "schedule"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-[#5A8A7D] hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <span>Chat</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trackers');
              navigate('/trackers');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold transition-colors hover:cursor-pointer ${
              activeTab === "trackers"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-[#5A8A7D] hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            <span>Trackers</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('library');
              navigate('/library');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold transition-colors hover:cursor-pointer ${
              activeTab === "library"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-[#5A8A7D] hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Policy Library</span>
          </button>
        </nav>

        {/* User Profile & Bottom Actions */}
        <div className="border-t-2 border-black">
          {/* User Profile */}
          <div className="px-4 py-3 border-b-2 border-black">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black flex items-center justify-center font-bold text-white text-lg shrink-0">
                {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "V"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-black text-sm truncate">{user?.username || user?.name || "User"}</p>
                <p className="text-xs text-black">Smart Shopper</p>
              </div>
              <button 
                onClick={() => navigate('/notifications')}
                className={`p-2 transition-colors shrink-0 hover:cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-black text-white'
                    : 'hover:bg-black hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <button
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold transition-colors hover:cursor-pointer ${
              activeTab === "preferences"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-[#5A8A7D] hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span>Preferences</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-bold bg-transparent text-black hover:bg-red-600 hover:text-white transition-colors hover:cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Fixed Window */}
      <main className="md:ml-64 flex-1 flex flex-col h-screen">
        {/* Top Bar with Search */}
        <div className="bg-[#6b9b8e] border-b-[6px] border-black px-3 md:px-6 py-4 md:py-5">
          {/* Single URL Mode - Simplified */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex-1 max-w-3xl flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Search or paste URL..."
                  className="w-full pl-12 pr-4 py-3 bg-white border-3 border-black text-gray-800 font-semibold placeholder-gray-500 focus:outline-none focus:border-[#F4A460] text-sm md:text-base drop-shadow-[3px_3px_0px_rgba(0,0,0,0.2)]"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <button 
                onClick={handleSearch}
                className="px-5 md:px-8 py-3 bg-[#F4A460] text-white font-bold uppercase hover:bg-[#E89450] transition-all border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:cursor-pointer whitespace-nowrap text-sm md:text-base"
              >
                Search
              </button>
              <button 
                className="p-3 bg-white border-3 border-black hover:bg-[#E8DCC4] transition-all drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                title="Filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-800">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Window */}
        <div className="flex-1 overflow-y-auto bg-[#E8DCC4] p-4 md:p-8 pb-20 md:pb-8 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#6B9B8E] border-t-4 border-black z-50 flex">
        <button
          onClick={() => {
            setActiveTab('home');
            navigate('/dashboard');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            activeTab === "home"
              ? "bg-black text-white"
              : "bg-transparent text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-xs font-bold">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('trackers');
            navigate('/trackers');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            activeTab === "trackers"
              ? "bg-black text-white"
              : "bg-transparent text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          <span className="text-xs font-bold">Trackers</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("library");
            navigate('/library');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            activeTab === "library"
              ? "bg-black text-white"
              : "bg-transparent text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <span className="text-xs font-bold">Library</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 bg-transparent text-black"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          <span className="text-xs font-bold">Logout</span>
        </button>
      </nav>

      {/* URL Modal Popup */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-[6px] border-black max-w-4xl w-full max-h-[92vh] flex flex-col drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-dialog-enter">
            {/* Modal Header */}
            <div className="bg-[#F4A460] border-b-[6px] border-black p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black border-3 border-white flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Product Tracker</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 bg-black text-white hover:cursor-pointer hover:bg-red-600 transition-all border-3 border-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.7)] flex items-center justify-center font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* URL Display for Single Mode */}
              {!multiPlatformMode && detectedUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Detected URL:</label>
                  <div className="p-4 bg-[#E8DCC4] border-3 border-black break-all text-sm font-mono">
                    {detectedUrl}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {scraping && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 border-[6px] border-black border-t-[#6B9B8E] mx-auto mb-6 animate-spin"></div>
                  <div className="bg-[#E8F4F1] border-3 border-black p-4 inline-block mb-4">
                    <p className="text-[#6B9B8E] font-bold text-xl uppercase tracking-wide">Extracting Product Info...</p>
                  </div>
                  <p className="text-gray-600 text-sm font-semibold">This may take a few moments</p>
                </div>
              )}

              {/* Error State */}
              {scrapeError && !scraping && (
                <div className="bg-red-100 border-4 border-red-600 p-8 text-center drop-shadow-[6px_6px_0px_rgba(220,38,38,0.3)]">
                  <div className="w-20 h-20 bg-red-600 border-3 border-black mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="bg-white border-2 border-black p-3 inline-block mb-4">
                    <p className="text-red-700 font-bold text-xl uppercase">Scraping Failed</p>
                  </div>
                  <p className="text-red-800 mb-6 font-semibold">{scrapeError}</p>
                  <button
                    onClick={() => multiPlatformMode ? handleMultiPlatformScrape() : handleSearch()}
                    className="px-8 py-3 bg-red-600 text-white font-bold uppercase hover:bg-red-700 transition-all border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)]"
                  >
                    ↻ Retry
                  </button>
                </div>
              )}

              {/* Single Product Display with Cross-Platform Results */}
              {!scraping && !scrapeError && scrapedProduct && (
                <div className="space-y-8">
                  {/* Main Product */}
                  <div>
                    <div className="bg-[#E8F4F1] border-3 border-black p-3 mb-6 inline-block">
                      <h3 className="text-2xl font-bold text-[#6B9B8E] uppercase tracking-wide">✓ Product Found</h3>
                    </div>
                    <div className="border-4 border-black p-6 bg-white drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                      <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-40 h-40 bg-[#E8DCC4] border-4 border-black flex items-center justify-center shrink-0 p-3">
                        {scrapedProduct.imageUrl ? (
                          <img
                            src={scrapedProduct.imageUrl}
                            alt={scrapedProduct.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <svg class="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              `;
                            }}
                          />
                        ) : (
                          <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-gray-800 mb-3 leading-tight uppercase">{scrapedProduct.title}</h4>
                        <div className="bg-[#E8F4F1] border-2 border-black px-3 py-1 inline-block mb-4">
                          <p className="text-sm font-bold text-[#6B9B8E]">
                            {scrapedProduct.brand && `${scrapedProduct.brand} • `}{scrapedProduct.platform || 'Unknown Platform'}
                          </p>
                        </div>
                        <div className="bg-white border-4 border-black p-4 mb-4">
                          <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Current Price</div>
                          <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-bold text-[#6B9B8E]">
                              ₹{scrapedProduct.currentPrice?.toLocaleString('en-IN')}
                            </span>
                            {scrapedProduct.originalPrice && scrapedProduct.originalPrice > scrapedProduct.currentPrice && (
                              <>
                                <span className="text-xl text-gray-400 line-through">
                                  ₹{scrapedProduct.originalPrice?.toLocaleString('en-IN')}
                                </span>
                                <span className="text-sm font-bold text-white bg-[#F4A460] px-3 py-2 border-3 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                                  {Math.round(((scrapedProduct.originalPrice - scrapedProduct.currentPrice) / scrapedProduct.originalPrice) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {scrapedProduct.rating && (
                          <div className="bg-white border-2 border-black px-3 py-2 inline-block">
                            <span className="font-bold text-gray-800">⭐ {scrapedProduct.rating}</span>
                            {scrapedProduct.reviewCount && (
                              <span className="text-sm text-gray-600 ml-3">
                                {scrapedProduct.reviewCount?.toLocaleString('en-IN')} reviews
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-4">
                      <button
                        onClick={() => handleFindSimilar(scrapedProduct)}
                        className="w-full py-4 px-6 bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold text-lg uppercase hover:from-blue-600 hover:to-purple-600 transition-all border-4 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3"
                      >
                        <span className="text-2xl">🔍</span>
                        <span>Find on Other Sites</span>
                      </button>
                      <div className="flex gap-4">
                        <button
                          onClick={handleTrackProduct}
                          className="flex-1 py-4 px-6 bg-[#F4A460] text-white font-bold text-lg uppercase hover:bg-[#E89450] transition-all border-4 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                        >
                          📌 Track This Product
                        </button>
                        <button
                          onClick={() => window.open(scrapedProduct.url, '_blank')}
                          className="py-4 px-8 bg-white text-gray-800 font-bold uppercase hover:bg-[#E8DCC4] transition-all border-4 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                        >
                          🔗 View Original
                        </button>
                      </div>
                      <button
                        onClick={() => window.open(scrapedProduct.url, '_blank')}
                        className="py-4 px-8 bg-white text-gray-800 font-bold uppercase hover:bg-[#E8DCC4] transition-all border-4 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                      >
                        🔗 View Original
                      </button>
                    </div>
                  </div>
                  </div>

                  {/* Similar Products from Other Platforms */}
                  {scrapedProducts && scrapedProducts.length > 0 && (
                    <div>
                      <div className="bg-[#E8F4F1] border-3 border-black p-3 mb-6 inline-block">
                        <h3 className="text-2xl font-bold text-[#6B9B8E] uppercase tracking-wide">💰 Similar Products on Other Platforms</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scrapedProducts.map((product, index) => (
                          <div key={index} className="border-4 border-black p-5 bg-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all">
                            {/* Platform Badge */}
                            <div className="mb-4">
                              <span className={`inline-block px-4 py-2 text-sm font-bold border-3 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] ${
                                product.platform === 'Amazon' ? 'bg-orange-400 text-white' :
                                product.platform === 'Flipkart' ? 'bg-blue-500 text-white' :
                                product.platform === 'eBay' ? 'bg-yellow-400 text-black' :
                                'bg-gray-400 text-white'
                              }`}>
                                {product.platform || 'Unknown'}
                              </span>
                            </div>

                            {/* Product Image */}
                            <div className="w-full h-40 bg-[#E8DCC4] border-3 border-black flex items-center justify-center mb-4 p-3">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.title}
                                  className="w-full h-full object-contain"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )}
                            </div>

                            {/* Product Details */}
                            <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 leading-tight uppercase">{product.title}</h4>
                            
                            <div className="mb-4 bg-[#E8F4F1] border-3 border-black p-3">
                              <div className="text-xs font-bold text-gray-600 mb-1">CURRENT PRICE</div>
                              <span className="text-3xl font-bold text-[#6B9B8E]">
                                ₹{product.currentPrice?.toLocaleString('en-IN')}
                              </span>
                              {product.originalPrice && product.originalPrice > product.currentPrice && (
                                <>
                                  <div className="text-sm text-gray-500 line-through mt-2">
                                    ₹{product.originalPrice?.toLocaleString('en-IN')}
                                  </div>
                                  <div className="inline-block text-xs font-bold text-white bg-[#F4A460] px-3 py-1 border-2 border-black mt-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
                                    {Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)}% OFF
                                  </div>
                                </>
                              )}
                            </div>

                            {product.rating && (
                              <div className="text-sm text-gray-700 mb-4 font-bold bg-white border-2 border-black px-2 py-1 inline-block">
                                ⭐ {product.rating}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2 mt-4">
                              <button
                                onClick={() => window.open(product.url, '_blank')}
                                className="w-full py-3 px-4 bg-[#6B9B8E] text-white font-bold text-sm uppercase hover:bg-[#5A8A7D] transition-all border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)]"
                              >
                                View on {product.platform}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform Search Links */}
                  {searchResults && searchResults.platformResults && searchResults.platformResults.length > 0 && (
                    <div>
                      <div className="bg-[#E8F4F1] border-3 border-black p-3 mb-6 inline-block">
                        <h3 className="text-2xl font-bold text-[#6B9B8E] uppercase tracking-wide">🔍 Search on Other Platforms</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {searchResults.platformResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => window.open(result.searchUrl, '_blank')}
                            className={`p-4 font-bold text-white uppercase border-4 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all ${
                              result.platform === 'Amazon' ? 'bg-orange-400 hover:bg-orange-500' :
                              result.platform === 'Flipkart' ? 'bg-blue-500 hover:bg-blue-600' :
                              result.platform === 'eBay' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' :
                              'bg-gray-400 hover:bg-gray-500'
                            }`}
                          >
                            🔗 Search on {result.platform}
                            {result.totalFound > 0 && (
                              <span className="block text-xs mt-1 opacity-90">
                                {result.totalFound} products found
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty/Initial State */}
              {!scraping && !scrapeError && !scrapedProduct && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-[#E8DCC4] border-4 border-black mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <div className="bg-[#E8F4F1] border-3 border-black p-4 inline-block">
                    <p className="font-bold text-gray-800 text-lg uppercase">
                      {multiPlatformMode ? 'Enter URLs to Compare' : 'Waiting to Scrape...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t-[6px] border-black p-5 bg-[#E8DCC4] shrink-0">
              <button
                onClick={handleCloseModal}
                className="w-full py-4 px-4 bg-black text-white font-bold text-lg uppercase hover:bg-gray-800 transition-all border-3 border-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
              >
                ✕ Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Find Similar Products Modal */}
      {showFindSimilarModal && productForSimilar && (
        <FindSimilarProductsModal
          product={productForSimilar}
          isOpen={showFindSimilarModal}
          onClose={() => {
            setShowFindSimilarModal(false);
            setProductForSimilar(null);
          }}
        />
      )}
    </div>
  );
}

export default DashboardLayout;
