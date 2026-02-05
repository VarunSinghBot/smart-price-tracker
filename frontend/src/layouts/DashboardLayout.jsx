import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [searchInput, setSearchInput] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState("");
  const [scrapedProducts, setScrapedProducts] = useState([]);
  const [isLoadingScrape, setIsLoadingScrape] = useState(false);
  const [scrapeError, setScrapeError] = useState(null);

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
  const handleSearch = () => {
    const value = searchInput.trim();
    
    // Show modal if any text is present
    if (value) {
      setDetectedUrl(value);
      setShowUrlModal(true);
      handleUrlScrape(value);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mock function to scrape product data from URL
  const handleUrlScrape = async (url) => {
    setIsLoadingScrape(true);
    setScrapeError(null);
    setScrapedProducts([]);

    try {
      // Simulate API call to scrape the URL
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock scraped data
      const platform = url.includes('amazon') ? 'Amazon' : url.includes('flipkart') ? 'Flipkart' : url.includes('myntra') ? 'Myntra' : 'Unknown Platform';
      
      const mockProducts = [
        {
          id: Date.now() + 1,
          name: "Premium Wireless Headphones",
          brand: "Sony",
          platform: platform,
          price: 24999,
          originalPrice: 29999,
          image: "https://m.media-amazon.com/images/I/51432EoghOL._SX522_.jpg",
          rating: 4.8,
          reviews: 1523,
          category: "Electronics",
          url: url
        },
        {
          id: Date.now() + 2,
          name: "Smart Watch Series 8",
          brand: "Apple",
          platform: platform,
          price: 45999,
          originalPrice: 52999,
          image: "https://m.media-amazon.com/images/I/71xb2xkN5qL._SX679_.jpg",
          rating: 4.6,
          reviews: 892,
          category: "Electronics",
          url: url
        },
        {
          id: Date.now() + 3,
          name: "Running Shoes Pro",
          brand: "Nike",
          platform: platform,
          price: 8999,
          originalPrice: 12999,
          image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/22a9856e-fb88-45df-8b64-9c35910cb7c1/jumpman-mvp-shoes-JV1HCs.png",
          rating: 4.5,
          reviews: 567,
          category: "Fashion",
          url: url
        },
        {
          id: Date.now() + 4,
          name: "4K Ultra HD Smart TV 55\"",
          brand: "Samsung",
          platform: platform,
          price: 54999,
          originalPrice: 64999,
          image: "https://img-prd-pim.poorvika.com/cdn-cgi/image/width=1600,height=1600,quality=75/product/samsung-4k-ultra-hd-led-smart-tv-du7000-55-inch-front-view.png",
          rating: 4.7,
          reviews: 2341,
          category: "Electronics",
          url: url
        },
        {
          id: Date.now() + 5,
          name: "Premium Leather Backpack",
          brand: "Wildcraft",
          platform: platform,
          price: 3499,
          originalPrice: 4999,
          image: "https://m.media-amazon.com/images/I/81VF3W5HFZL._SY741_.jpg",
          rating: 4.4,
          reviews: 423,
          category: "Fashion",
          url: url
        }
      ];
      
      setScrapedProducts(mockProducts);
    } catch (error) {
      console.error("Error scraping URL:", error);
      setScrapeError("Failed to extract product information from URL. Please try again.");
    } finally {
      setIsLoadingScrape(false);
    }
  };

  // Handle adding product to tracked list
  const handleAddProduct = (product) => {
    // In a real app, you'd save this to your backend
    console.log("Adding product to track:", product);
    alert(`Product "${product.name}" added to tracking!`);
    handleCloseModal();
  };

  // Close modal and reset
  const handleCloseModal = () => {
    setShowUrlModal(false);
    setSearchInput("");
    setDetectedUrl("");
    setScrapedProducts([]);
    setScrapeError(null);
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
          `${import.meta.env.VITE_API_URL}/api/v1/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3a48.667 48.667 0 0 1-5.5 0l-3 3v-3.09c-.34-.021-.68-.046-1.02-.073C4.097 17.07 3.25 16.105 3.25 14.97v-4.286c0-.97.616-1.813 1.5-2.097m17.5 0c0 .621-.504 1.125-1.125 1.125h-17.25A1.125 1.125 0 0 1 2.75 8.511m19.5 0V5.625c0-.621-.504-1.125-1.125-1.125H2.875A1.125 1.125 0 0 0 1.75 5.625v2.886" />
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
              <button className="p-2 hover:bg-black hover:text-white transition-colors shrink-0 hover:cursor-pointer">
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
        {/* bg-[#E8F4F1] */}
        <div className="bg-[#6b9b8e] border-b-4 border-black px-3 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-4">
          <div className="flex-1 max-w-2xl flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                placeholder="Search or paste URL..."
                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black text-gray-800 font-medium placeholder-gray-500 focus:outline-none focus:border-[#6B9B8E] text-sm md:text-base"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <button 
              onClick={handleSearch}
              className="px-3 md:px-6 py-2 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors border-2 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:cursor-pointer whitespace-nowrap text-sm md:text-base"
            >
              Search
            </button>
          </div>
          <button className="hidden md:block p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors hover:cursor-pointer">
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
          </button>
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-2xl w-full max-h-[90vh] flex flex-col drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-dialog-enter">
            {/* Modal Header */}
            <div className="bg-[#6B9B8E] border-b-4 border-black p-4 flex items-center justify-between shrink-0">
              <h2 className="text-2xl font-bold text-black">Product URL Detected</h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 bg-black text-white hover:cursor-pointer hover:bg-red-600 transition-colors flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              {/* URL Display */}
              <div className="mb-6 shrink-0">
                <label className="block text-sm font-bold text-gray-700 mb-2">Detected URL:</label>
                <div className="p-3 bg-gray-100 border-2 border-gray-300 break-all text-sm">
                  {detectedUrl}
                </div>
              </div>

              {/* Loading State */}
              {isLoadingScrape && (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-t-4 border-b-4 border-[#6B9B8E] mx-auto mb-4"></div>
                  <p className="text-[#6B9B8E] font-semibold">Extracting product information...</p>
                </div>
              )}

              {/* Error State */}
              {scrapeError && (
                <div className="bg-red-100 border-2 border-red-500 p-4 mb-4 shrink-0">
                  <p className="text-red-700 font-medium">{scrapeError}</p>
                  <button
                    onClick={() => handleUrlScrape(detectedUrl)}
                    className="mt-2 px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors border-2 border-black"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Products List */}
              {!isLoadingScrape && scrapedProducts.length > 0 && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 shrink-0">Found Products:</h3>
                  <div className="space-y-4 overflow-y-auto pr-2">
                    {scrapedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border-3 border-black p-4 bg-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 bg-gray-100 border-2 border-black flex items-center justify-center shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {product.brand} • {product.platform}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-bold text-gray-800">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>⭐ {product.rating}</span>
                              <span>•</span>
                              <span>{product.reviews.toLocaleString()} reviews</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => handleAddProduct(product)}
                            className="flex-1 py-2 px-4 bg-[#6B9B8E] text-white font-bold hover:bg-[#5A8A7D] transition-colors border-2 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                          >
                            Track This Product
                          </button>
                          <button
                            onClick={() => window.open(product.url, '_blank')}
                            className="py-2 px-4 bg-white text-gray-800 font-bold hover:bg-gray-100 transition-colors border-2 border-black"
                          >
                            View Original
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoadingScrape && !scrapeError && scrapedProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No products found from this URL.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t-4 border-black p-4 bg-gray-50 flex-shrink-0">
              <button
                onClick={handleCloseModal}
                className="w-full py-2 px-4 bg-black text-white font-bold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
