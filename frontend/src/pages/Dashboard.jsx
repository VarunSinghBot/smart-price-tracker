import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { showSuccessToast, showWarningToast, showInfoToast } from "../components/ui/Toast";

function Dashboard() {
  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Tracked products state
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Everything');
  
  // Pagination states
  const [displayedPopularCount, setDisplayedPopularCount] = useState(6);
  const [displayedRecommendedCount, setDisplayedRecommendedCount] = useState(8);

  // Load tracked products from localStorage on mount
  useEffect(() => {
    const savedTrackedProducts = localStorage.getItem('trackedProducts');
    if (savedTrackedProducts) {
      try {
        setTrackedProducts(JSON.parse(savedTrackedProducts));
      } catch (error) {
        console.error('Error loading tracked products:', error);
      }
    }
  }, []);

  // Function to add product to tracker
  const handleSetPriceAlert = (product) => {
    // Check if product is already tracked
    const isAlreadyTracked = trackedProducts.some(p => p.id === product.id);
    
    if (isAlreadyTracked) {
      showWarningToast('This product is already being tracked!');
      return;
    }

    // Add tracking timestamp and alert settings
    const trackedProduct = {
      ...product,
      trackedAt: new Date().toISOString(),
      alertPrice: product.price * 0.9, // Default: alert when price drops 10%
      isActive: true
    };

    const updatedTrackedProducts = [...trackedProducts, trackedProduct];
    setTrackedProducts(updatedTrackedProducts);
    
    // Save to localStorage
    localStorage.setItem('trackedProducts', JSON.stringify(updatedTrackedProducts));
    
    // Show success toast
    showSuccessToast(`${product.name} added to tracker! You'll be notified when price drops.`);
    
    console.log('Product added to tracker:', trackedProduct);
  };

  // Mock data for dashboard with product images
  const [dashboardData] = useState({
    productsTracked: 12,
    activeAlerts: 5,
    dealsConfirmed: 3,
    totalSavings: 6200,
    trackingActivity: [
      { month: "Jan", activity: 20 },
      { month: "Feb", activity: 35 },
      { month: "Mar", activity: 28 },
      { month: "Apr", activity: 45 },
      { month: "May", activity: 38 },
    ],
    savingsOverTime: [
      { month: "Jan", amount: 1650 },
      { month: "Feb", amount: 2100 },
      { month: "Mar", amount: 1850 },
    ],
    popularProducts: [
      { 
        id: 1,
        name: "iPhone 15", 
        brand: "Apple Inc.",
        platform: "Flipkart", 
        price: 52499, 
        originalPrice: 56999,
        status: "dropped", 
        change: -8,
        image: "https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg",
        rating: 4.5,
        reviews: 1523,
        category: "Electronics",
        format: "Physical",
        description: "Die-hard tech enthusiasts will love the ways in which Apple has innovated with the iPhone 15. From the A17 chip to the improved camera system, there's so much to explore about this device."
      },
      { 
        id: 2,
        name: "Nike Air Max", 
        brand: "Nike",
        platform: "Amazon", 
        price: 2999, 
        originalPrice: 2999,
        status: "no-change", 
        change: 0,
        image: "https://m.media-amazon.com/images/I/61enWtztGtL._SL1500_.jpg",
        rating: 4.2,
        reviews: 856,
        category: "Fashion",
        format: "Physical",
        description: "Step up your style game with the iconic Nike Air Max. Featuring premium materials and legendary cushioning for all-day comfort."
      },
      { 
        id: 3,
        name: "Samsung 55\" 4K TV", 
        brand: "Samsung",
        platform: "Reliance Digital", 
        price: 44999, 
        originalPrice: 44999,
        status: "alert", 
        change: 0,
        image: "https://img-prd-pim.poorvika.com/cdn-cgi/image/width=1600,height=1600,quality=75/product/samsung-4k-ultra-hd-led-smart-tv-du7000-55-inch-front-view.png",
        rating: 4.7,
        reviews: 2341,
        category: "Electronics",
        format: "Physical",
        description: "Experience stunning 4K clarity with Samsung's latest TV technology. Crystal clear display with smart features built-in."
      },
      { 
        id: 4,
        name: "Sony WH-1000XM5", 
        brand: "Sony",
        platform: "Amazon", 
        price: 24999, 
        originalPrice: 29999,
        status: "dropped", 
        change: -17,
        image: "https://m.media-amazon.com/images/I/51432EoghOL._SX522_.jpg",
        rating: 4.8,
        reviews: 3214,
        category: "Electronics",
        format: "Physical",
        description: "Industry-leading noise cancellation meets exceptional sound quality. Perfect for music lovers and frequent travelers."
      },
      { 
        id: 5,
        name: "Adidas Running Shoes", 
        brand: "Adidas",
        platform: "Flipkart", 
        price: 3499, 
        originalPrice: 4999,
        status: "dropped", 
        change: -30,
        image: "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d0a2d10960904e1bbc332e6272e7ea74_9366/Galaxy_7_Running_Shoes_White_JP6600_HM1.jpg",
        rating: 4.3,
        reviews: 678,
        category: "Fashion",
        format: "Physical",
        description: "Lightweight running shoes designed for comfort and performance. Boost technology provides incredible energy return."
      },
      { 
        id: 6,
        name: "Canon EOS R6", 
        brand: "Canon",
        platform: "Amazon", 
        price: 189999, 
        originalPrice: 189999,
        status: "no-change", 
        change: 0,
        image: "https://m.media-amazon.com/images/I/81LskAU5h1L._SX679_.jpg",
        rating: 4.9,
        reviews: 445,
        category: "Electronics",
        format: "Physical",
        description: "Professional mirrorless camera with exceptional image quality and advanced autofocus. Perfect for photography enthusiasts."
      },
      { 
        id: 21,
        name: "LG 65\" OLED TV", 
        brand: "LG",
        platform: "Croma", 
        price: 129999, 
        originalPrice: 149999,
        status: "dropped", 
        change: -13,
        image: null,
        rating: 4.6,
        reviews: 892,
        category: "Electronics",
        format: "Physical",
        description: "Stunning OLED display with perfect blacks and infinite contrast. Ideal for movie enthusiasts and gamers."
      },
      { 
        id: 22,
        name: "Boat Airdopes 141", 
        brand: "Boat",
        platform: "Flipkart", 
        price: 1299, 
        originalPrice: 2999,
        status: "dropped", 
        change: -57,
        image: null,
        rating: 4.0,
        reviews: 4521,
        category: "Electronics",
        format: "Physical",
        description: "Affordable wireless earbuds with decent sound quality and long battery life."
      },
      { 
        id: 23,
        name: "Levi's Jeans", 
        brand: "Levi's",
        platform: "Myntra", 
        price: 2499, 
        originalPrice: 3999,
        status: "dropped", 
        change: -38,
        image: null,
        rating: 4.4,
        reviews: 1234,
        category: "Fashion",
        format: "Physical",
        description: "Classic denim with perfect fit and durability. A wardrobe essential for any style."
      },
      { 
        id: 24,
        name: "PlayStation 5 Controller", 
        brand: "Sony",
        platform: "Amazon", 
        price: 5999, 
        originalPrice: 5999,
        status: "no-change", 
        change: 0,
        image: null,
        rating: 4.7,
        reviews: 2156,
        category: "Electronics",
        format: "Physical",
        description: "DualSense wireless controller with haptic feedback and adaptive triggers for immersive gaming."
      },
      { 
        id: 25,
        name: "Ray-Ban Aviator", 
        brand: "Ray-Ban",
        platform: "Amazon", 
        price: 6999, 
        originalPrice: 8999,
        status: "dropped", 
        change: -22,
        image: null,
        rating: 4.5,
        reviews: 3421,
        category: "Fashion",
        format: "Physical",
        description: "Iconic aviator sunglasses with UV protection and timeless style."
      },
      { 
        id: 26,
        name: "Dell Monitor 27\"", 
        brand: "Dell",
        platform: "Flipkart", 
        price: 18999, 
        originalPrice: 18999,
        status: "alert", 
        change: 0,
        image: null,
        rating: 4.3,
        reviews: 756,
        category: "Electronics",
        format: "Physical",
        description: "Full HD monitor with excellent color accuracy. Perfect for work and entertainment."
      },
    ],
    recommendedProducts: [
      { id: 7, name: "Samsung TV 43\"", brand: "Samsung", price: 34999, image: null, category: "Electronics" },
      { id: 8, name: "Nike Sports Shoes", brand: "Nike", price: 2999, image: null, category: "Fashion" },
      { id: 9, name: "MacBook Pro 14\"", brand: "Apple", price: 129999, image: null, category: "Electronics" },
      { id: 10, name: "AirPods Pro 2", brand: "Apple", price: 24999, image: null, category: "Electronics" },
      { id: 11, name: "iPad Air", brand: "Apple", price: 54999, image: null, category: "Electronics" },
      { id: 12, name: "PS5 Console", brand: "Sony", price: 49999, image: null, category: "Electronics" },
      { id: 13, name: "Kindle Paperwhite", brand: "Amazon", price: 12999, image: null, category: "Electronics" },
      { id: 14, name: "Dell XPS 15", brand: "Dell", price: 149999, image: null, category: "Electronics" },
      { id: 15, name: "Adidas Jacket", brand: "Adidas", price: 3999, image: null, category: "Fashion" },
      { id: 16, name: "Puma Trackpants", brand: "Puma", price: 1999, image: null, category: "Fashion" },
      { id: 17, name: "Coffee Maker", brand: "Philips", price: 4999, image: null, category: "Home & Kitchen" },
      { id: 18, name: "Blender", brand: "Prestige", price: 2499, image: null, category: "Home & Kitchen" },
      { id: 19, name: "Yoga Mat", brand: "Decathlon", price: 799, image: null, category: "Sports" },
      { id: 20, name: "Dumbbells Set", brand: "Kore", price: 2999, image: null, category: "Sports" },
      { id: 27, name: "HP Laptop 15.6\"", brand: "HP", price: 45999, image: null, category: "Electronics" },
      { id: 28, name: "Reebok Sneakers", brand: "Reebok", price: 3499, image: null, category: "Fashion" },
      { id: 29, name: "Fire TV Stick", brand: "Amazon", price: 3999, image: null, category: "Electronics" },
      { id: 30, name: "Echo Dot 4th Gen", brand: "Amazon", price: 4499, image: null, category: "Electronics" },
      { id: 31, name: "Wireless Mouse", brand: "Logitech", price: 1299, image: null, category: "Electronics" },
      { id: 32, name: "Mechanical Keyboard", brand: "Cosmic Byte", price: 2499, image: null, category: "Electronics" },
      { id: 33, name: "T-Shirt Pack of 3", brand: "H&M", price: 1499, image: null, category: "Fashion" },
      { id: 34, name: "Sports Watch", brand: "Fastrack", price: 2999, image: null, category: "Fashion" },
      { id: 35, name: "Air Purifier", brand: "Mi", price: 8999, image: null, category: "Home & Kitchen" },
      { id: 36, name: "Mixer Grinder", brand: "Bajaj", price: 3499, image: null, category: "Home & Kitchen" },
      { id: 37, name: "Resistance Bands", brand: "Boldfit", price: 499, image: null, category: "Sports" },
      { id: 38, name: "Protein Shaker", brand: "Boldfit", price: 299, image: null, category: "Sports" },
    ],
    categoryBreakdown: [
      { category: "Electronics", percentage: 45, color: "#A855F7" },
      { category: "Fashion", percentage: 25, color: "#EC4899" },
      { category: "Home & Kitchen", percentage: 20, color: "#F472B6" },
      { category: "Other", percentage: 10, color: "#F9A8D4" },
    ],
  });

  // Get user from localStorage for display (DashboardLayout handles auth)
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Set first product as selected by default
  useState(() => {
    if (dashboardData.popularProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(dashboardData.popularProducts[0]);
    }
  }, []);

  // Product placeholder SVG component
  const ProductPlaceholder = ({ className = "w-16 h-16" }) => (
    <svg className={`${className} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  // Handle product click
  const handleProductClick = (product) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedProduct(product);
      setIsAnimating(false);
    }, 250);
  };

  // Filter recommended products by category
  const getFilteredProducts = () => {
    if (selectedCategory === 'Everything') {
      return dashboardData.recommendedProducts;
    }
    return dashboardData.recommendedProducts.filter(p => p.category === selectedCategory);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDisplayedRecommendedCount(8); // Reset to initial count when changing category
  };

  // Handle load more
  const handleLoadMorePopular = () => {
    setDisplayedPopularCount(prev => prev + 6);
  };

  const handleLoadMoreRecommended = () => {
    setDisplayedRecommendedCount(prev => prev + 8);
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || user?.username || "User"}!
        </h1>
        <p className="text-xl text-[#6B9B8E] font-semibold">
          You've saved ₹{dashboardData.totalSavings.toLocaleString()} so far!
        </p>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-4 border-black p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Products Tracked</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{trackedProducts.length}</p>
          </div>

          <div className="bg-white border-4 border-black p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Active Alerts</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{dashboardData.activeAlerts}</p>
          </div>

          <div className="bg-white border-4 border-black p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Deals Confirmed</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{dashboardData.dealsConfirmed}</p>
          </div>

          <div className="bg-white border-4 border-black p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Savings</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">₹{dashboardData.totalSavings.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Popular Products */}
          <div className="lg:col-span-2 bg-white border-4 border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Popular Products</h3>
              <span className="text-sm text-gray-600">
                Showing {Math.min(displayedPopularCount, dashboardData.popularProducts.length)} of {dashboardData.popularProducts.length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dashboardData.popularProducts.slice(0, displayedPopularCount).map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  className={`border-3 overflow-hidden hover:border-[rgb(244,164,96)] transition-all cursor-pointer group drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(244,164,96,1)]`}
                >
                  <div className="aspect-3/4 bg-gray-100 flex items-center justify-center relative">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <ProductPlaceholder />
                    )}
                    {product.status === "dropped" && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 flex items-center justify-center border-2 border-black">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <h4 className="font-bold text-sm text-gray-800 mb-1 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{product.platform}</p>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-[#F4A460]' : 'text-gray-300'} fill-current`} 
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-800 font-bold">₹{product.price.toLocaleString()}</p>
                      {product.status === "dropped" && (
                        <span className="text-xs text-green-600 font-bold">{product.change}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {displayedPopularCount < dashboardData.popularProducts.length && (
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={handleLoadMorePopular}
                  className="px-6 py-3 bg-[#F4A460] text-white font-bold border-2 border-black hover:bg-[#E89450] transition-colors drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:cursor-pointer"
                >
                  Load More Products
                </button>
              </div>
            )}
          </div>

          {/* Product Details Sidebar */}
          <div className="bg-white border-4 border-black p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            {selectedProduct ? (
              <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div className="mb-6">
                  <div className="aspect-square bg-[#F4DFC8] mb-4 flex items-center justify-center border-2 border-black overflow-hidden">
                    {selectedProduct.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <ProductPlaceholder className="w-24 h-24 text-[#F4A460]" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    By: {selectedProduct.brand}<br />
                    Platform: {selectedProduct.platform}
                  </p>
                  
                  <button 
                    onClick={() => handleSetPriceAlert(selectedProduct)}
                    className="w-full py-3 bg-white border-2 border-[#6B9B8E] text-gray-800 font-medium mb-3 hover:bg-gray-50 transition-colors hover:cursor-pointer"
                  >
                    📌 Set Price Alert
                  </button>
                  <button className="w-full py-3 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors flex items-center justify-center gap-2 hover:cursor-pointer border-2 border-black">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                    </svg>
                    Buy Now
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-bold text-gray-800">⭐ {selectedProduct.rating} ({selectedProduct.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-bold text-gray-800">{selectedProduct.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format</span>
                    <span className="font-bold text-gray-800">{selectedProduct.format}</span>
                  </div>
                  {selectedProduct.originalPrice !== selectedProduct.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Price</span>
                      <span className="font-bold text-gray-400 line-through">₹{selectedProduct.originalPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price</span>
                    <span className="font-bold text-gray-800">₹{selectedProduct.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-bold ${selectedProduct.status === 'dropped' ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedProduct.status === 'dropped' ? '🔥 Price Dropped!' : selectedProduct.status === 'alert' ? '🔔 Alert Set' : 'No Change'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a product to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories - Shows first on mobile, second on desktop */}
          <div className="order-1 lg:order-2 bg-white border-4 border-black p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleCategorySelect('Everything')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                  selectedCategory === 'Everything'
                    ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#F4A460]'
                } hover:cursor-pointer`}
              >
                Everything
              </button>
              <button 
                onClick={() => handleCategorySelect('Electronics')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                  selectedCategory === 'Electronics'
                    ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#F4A460]'
                } hover:cursor-pointer`}
              >
                Electronics
              </button>
              <button 
                onClick={() => handleCategorySelect('Fashion')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                  selectedCategory === 'Fashion'
                    ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#F4A460]'
                } hover:cursor-pointer`}
              >
                Fashion
              </button>
              <button 
                onClick={() => handleCategorySelect('Magazines')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                  selectedCategory === 'Magazines'
                    ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#F4A460]'
                } hover:cursor-pointer`}
              >
                Magazines
              </button>
              <button 
                onClick={() => handleCategorySelect('Home & Kitchen')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                  selectedCategory === 'Home & Kitchen'
                    ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#F4A460]'
                } hover:cursor-pointer`}
              >
                Home & Kitchen
              </button>
              <button 
                onClick={() => handleCategorySelect('Sports')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                  selectedCategory === 'Sports'
                    ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#F4A460]'
                } hover:cursor-pointer`}
              >
                Sports
              </button>
              <button 
                onClick={() => handleCategorySelect('Comics')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                  selectedCategory === 'Comics'
                    ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#F4A460]'
                } hover:cursor-pointer`}
              >
                Comics
              </button>
            </div>
          </div>

          {/* Recommended Products - Shows second on mobile, first on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-2 bg-white border-4 border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Recommended Products</h3>
              <span className="text-sm text-gray-600">
                Showing {Math.min(displayedRecommendedCount, getFilteredProducts().length)} of {getFilteredProducts().length}
              </span>
            </div>
            {getFilteredProducts().length > 0 ? (
              <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getFilteredProducts().slice(0, displayedRecommendedCount).map((product) => (
                  <div 
                    key={product.id} 
                    // onClick={() => handleProductClick(product)}
                    className="border-3 border-black overflow-hidden hover:border-[#F4A460] transition-colors cursor-pointer drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(244,164,96,1)]"
                  >
                    <div className="aspect-3/4 bg-gray-100 flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <ProductPlaceholder className="w-12 h-12" />
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <h4 className="font-bold text-xs text-gray-800 truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                      <p className="text-xs text-gray-800 font-bold mt-1">₹{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              {displayedRecommendedCount < getFilteredProducts().length && (
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={handleLoadMoreRecommended}
                    className="px-6 py-3 bg-[#F4A460] text-white font-bold border-2 border-black hover:bg-[#E89450] transition-colors drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:cursor-pointer"
                  >
                    Load More Recommendations
                  </button>
                </div>
              )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 font-bold text-lg mb-1">No products found</p>
                <p className="text-gray-500 text-sm">No recommended products available for "{selectedCategory}" category.</p>
              </div>
            )}
          </div>
        </div>
    </DashboardLayout>
  );
}

export default Dashboard;
