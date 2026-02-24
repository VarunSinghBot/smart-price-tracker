import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from "../layouts/DashboardLayout";
import { showSuccessToast, showWarningToast, showInfoToast, showErrorToast } from "../components/ui/Toast";
import { fetchProducts, fetchProductStats, removeProduct } from '../store/productSlice';
import { fetchAlerts } from '../store/alertSlice';
import { fetchSupportedPlatforms, addToSearchHistory } from '../store/scraperSlice';
import AddProductModal from '../components/products/AddProductModal';
import SetAlertModal from '../components/products/SetAlertModal';
import RemoveProductModal from '../components/products/RemoveProductModal';
import ProductCard from '../components/products/ProductCard';
import PriceHistoryChart from '../components/products/PriceHistoryChart';

function Dashboard() {
  const dispatch = useDispatch();
  
  // Redux state
  const { products, loading, error, stats } = useSelector((state) => state.products);
  const { alerts } = useSelector((state) => state.alerts);
  const { scrapedProducts } = useSelector((state) => state.scraper);
  
  // Get alert for a product
  const getProductAlert = (productId) => {
    return alerts.find(alert => alert.productId === productId && alert.active);
  };
  
  // User state from localStorage
  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Smart Shopper"}');
  
  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductForAlert, setSelectedProductForAlert] = useState(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [selectedProductForRemoval, setSelectedProductForRemoval] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefilledProductUrl, setPrefilledProductUrl] = useState(null);
  
  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSetAlertModal, setShowSetAlertModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  
  // Filter and pagination states
  const [selectedCategory, setSelectedCategory] = useState('Everything');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [displayedRecommendedCount, setDisplayedRecommendedCount] = useState(8);

  // Combine tracked products with scraped products (search history)
  // Mark tracked products and limit to max 10
  const searchedProducts = useMemo(() => {
    const trackedProductUrls = new Set(products.map(p => p.url));
    
    // Map tracked products with isTracked flag and alert info
    const trackedWithFlag = products.map(p => ({ 
      ...p, 
      isTracked: true,
      alert: getProductAlert(p.id)
    }));
    
    // Map scraped products with isTracked flag
    const scrapedWithFlag = (scrapedProducts || [])
      .filter(p => !trackedProductUrls.has(p.url)) // Exclude already tracked
      .map(p => ({ ...p, isTracked: false, alert: null }));
    
    // Combine and limit to 10
    return [...trackedWithFlag, ...scrapedWithFlag].slice(0, 10);
  }, [products, scrapedProducts, alerts]);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductStats());
    dispatch(fetchAlerts());
    dispatch(fetchSupportedPlatforms());
  }, [dispatch]);

  // Set first product as selected by default
  useEffect(() => {
    if (searchedProducts.length > 0 && !selectedProductForDetails) {
      setSelectedProductForDetails(searchedProducts[0]);
    }
  }, [searchedProducts, selectedProductForDetails]);

  // Handlers
  const handleSetPriceAlert = (product) => {
    setSelectedProductForAlert(product);
    setShowSetAlertModal(true);
  };

  const handleViewDetails = (product) => {
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedProductForDetails(product);
      setIsAnimating(false);
    }, 150);
  };

  const handleProductAdded = () => {
    // Reload dashboard data
    dispatch(fetchProducts());
    dispatch(fetchProductStats());
  };

  const handleRemoveProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProductForRemoval(product);
    setShowRemoveModal(true);
  };

  const confirmRemoveProduct = async () => {
    if (!selectedProductForRemoval) return;
    
    try {
      // Add to search history before removing from tracker
      dispatch(addToSearchHistory(selectedProductForRemoval));
      
      await dispatch(removeProduct(selectedProductForRemoval.id)).unwrap();
      showSuccessToast('Product removed successfully!');
      dispatch(fetchProducts()); // Refresh list
    } catch (error) {
      showErrorToast(error || 'Failed to remove product');
    } finally {
      setShowRemoveModal(false);
      setSelectedProductForRemoval(null);
    }
  };

  // Get categories from products
  const categories = ['Everything', ...new Set(products.map(p => p.platform))];

  // Filter products by category/platform
  const filteredProducts = selectedCategory === 'Everything'
    ? searchedProducts
    : searchedProducts.filter(p => p.platform === selectedCategory);

  // Mock data for tracking activity (will be replaced with real API later)
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
  const handleLoadMoreRecommended = () => {
    setDisplayedRecommendedCount(prev => prev + 8);
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="bg-[#E8DCC4] border-3 border-black p-6 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Welcome back, {user?.name?.toUpperCase() || user?.username?.toUpperCase() || "VARUN SINGH"} {user?.id || "2547254"}!
          </h1>
          <p className="text-lg text-[#6B9B8E] font-semibold">
            You've saved ₹{stats?.totalSavings?.toLocaleString() || dashboardData.totalSavings.toLocaleString()} so far!
          </p>
        </div>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-3 border-black p-5 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-semibold text-sm">Products Tracked</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] border-2 border-black rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{products.length}</p>
          </div>

          <div className="bg-white border-3 border-black p-5 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-semibold text-sm">Active Alerts</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] border-2 border-black rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{alerts.filter(a => a.active).length}</p>
          </div>

          <div className="bg-white border-3 border-black p-5 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-semibold text-sm">Deals Confirmed</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] border-2 border-black rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{alerts.filter(a => a.triggered).length}</p>
          </div>

          <div className="bg-white border-3 border-black p-5 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-semibold text-sm">Total Savings</h3>
              <div className="w-12 h-12 bg-[#E8F4F1] border-2 border-black rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6B9B8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">₹{stats?.totalSavings?.toLocaleString() || (dashboardData.totalSavings || 6200).toLocaleString()}</p>
          </div>
        </div>

        {/* Popular/Recently Tracked Products Section */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2 bg-white border-3 border-black p-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Searched Products</h3>
              <div className="text-gray-500 font-medium text-sm">
                Showing {Math.min(filteredProducts.length, 10)} of {filteredProducts.length} (Max 10)
              </div>
            </div>

            {loading && (
              <div className="flex flex-col justify-center items-center py-8 gap-3">
                <div className="w-12 h-12 border-4 border-black border-t-[#6B9B8E] rounded-full animate-spin"></div>
                <div className="bg-[#E8DCC4] border-2 border-black px-4 py-2">
                  <p className="text-gray-800 text-sm font-bold uppercase tracking-wide">Loading Products...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border-3 border-red-600 p-4 drop-shadow-[4px_4px_0px_rgba(220,38,38,0.5)]">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">⚠️</div>
                  <p className="text-red-800 font-bold text-sm uppercase tracking-wide">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-[#E8DCC4] border-3 border-black p-6 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] max-w-md">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="text-gray-800 font-bold text-lg mb-2 uppercase tracking-wide">No Products Yet</p>
                  <p className="text-gray-600 font-semibold text-xs mb-4 uppercase tracking-wide">Start tracking to find the best deals</p>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-5 py-2 bg-[#F4A460] text-white text-sm font-bold border-3 border-black hover:bg-[#E89450] transition-all drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                  >
                    🔍 Add First Product
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id || product.url}
                      onClick={() => handleViewDetails(product)}
                      className="border-3 border-black overflow-hidden hover:border-[#F4A460] transition-all cursor-pointer group drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(244,164,96,1)]"
                    >
                      <div className="aspect-3/4 bg-gray-100 flex items-center justify-center relative">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        {(product.isTracked || (product.alert && product.alert.active)) && (
                          <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 flex items-center justify-center border-2 border-black">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white">
                        <h4 className="font-bold text-sm text-gray-800 mb-1 truncate">{product.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{product.platform}</p>
                        {product.metadata?.rating ? (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(product.metadata.rating) ? 'text-[#F4A460]' : 'text-gray-300'} fill-current`} 
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        ) : (
                          <div className="h-3 mb-2"></div>
                        )}
                        <p className="text-xs text-gray-800 font-bold">₹{product.currentPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details Sidebar */}
          <div className="bg-white border-4 border-black p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            {selectedProductForDetails ? (
              <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div className="mb-6">
                  <div className="aspect-square bg-[#F4DFC8] mb-4 flex items-center justify-center border-2 border-black overflow-hidden">
                    {selectedProductForDetails.imageUrl ? (
                      <img src={selectedProductForDetails.imageUrl} alt={selectedProductForDetails.title} className="w-full h-full object-contain p-2" />
                    ) : (
                      <svg className="w-24 h-24 text-[#F4A460]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedProductForDetails.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    By: {selectedProductForDetails.metadata?.brand || 'Apple Inc.'}<br />
                    Platform: {selectedProductForDetails.platform}<br />
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-bold border-2 border-black ${selectedProductForDetails.isTracked ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {selectedProductForDetails.isTracked ? '✓ Tracked' : 'Not Tracked'}
                    </span>
                  </p>
                  
                  {selectedProductForDetails.isTracked ? (
                    <button 
                      onClick={() => {
                        setSelectedProductForAlert(selectedProductForDetails);
                        setShowSetAlertModal(true);
                      }}
                      className="w-full py-3 bg-white border-2 border-[#6B9B8E] text-gray-800 font-medium mb-3 hover:bg-gray-50 transition-colors hover:cursor-pointer"
                    >
                      📌 Set Price Alert
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        // Pre-fill the add product modal with the product URL
                        setPrefilledProductUrl(selectedProductForDetails.url);
                        setShowAddProductModal(true);
                      }}
                      className="w-full py-3 bg-[#6B9B8E] border-2 border-black text-white font-bold mb-3 hover:bg-[#5A8A7D] transition-colors hover:cursor-pointer"
                    >
                      ➕ Add to Tracker
                    </button>
                  )}
                  <button 
                    onClick={() => window.open(selectedProductForDetails.url, '_blank')}
                    className="w-full py-3 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors flex items-center justify-center gap-2 hover:cursor-pointer border-2 border-black"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                    </svg>
                    Buy Now
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  {selectedProductForDetails.metadata?.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-bold text-gray-800">⭐ {selectedProductForDetails.metadata.rating} ({selectedProductForDetails.metadata.reviewCount?.toLocaleString() || 1523})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-bold text-gray-800">{selectedProductForDetails.metadata?.category || 'Electronics'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format</span>
                    <span className="font-bold text-gray-800">{selectedProductForDetails.metadata?.format || 'Physical'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price</span>
                    <span className="font-bold text-gray-800">₹{selectedProductForDetails.currentPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 min-h-[400px]">
                <p>Select a product to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Your Tracked Products - Full Management Section */}
        <div className="mb-6">
          <div className="bg-white border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="bg-[#6B9B8E] border-b-3 border-black p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wide mb-1">Manage Products</h3>
                  <p className="text-sm text-white/90 font-medium">
                    Track and monitor your saved products
                  </p>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 text-sm border-3 border-black font-bold bg-white hover:bg-[#E8DCC4] transition-all drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-5 py-2.5 text-sm bg-[#F4A460] text-white font-bold border-3 border-black hover:bg-[#E89450] transition-all drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] uppercase tracking-wide whitespace-nowrap"
                  >
                    + Add Product
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSetAlert={handleSetPriceAlert}
                      onViewDetails={handleViewDetails}
                      onRemove={handleRemoveProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="bg-[#E8DCC4] border-3 border-black p-8 inline-block drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-900 font-bold text-lg uppercase tracking-wide mb-2">No Products in This Category</p>
                    <p className="text-gray-600 font-medium text-sm">Try selecting a different category or add a new product</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddProductModal && (
          <AddProductModal 
            onClose={() => {
              setShowAddProductModal(false);
              setPrefilledProductUrl(null);
            }}
            prefilledUrl={prefilledProductUrl}
            onProductAdded={handleProductAdded}
          />
        )}

        {showSetAlertModal && selectedProductForAlert && (
          <SetAlertModal
            isOpen={showSetAlertModal}
            product={selectedProductForAlert}
            onClose={() => {
              setShowSetAlertModal(false);
              setSelectedProductForAlert(null);
              // Refresh alerts to show the newly created alert
              dispatch(fetchAlerts());
            }}
          />
        )}

        {showRemoveModal && selectedProductForRemoval && (
          <RemoveProductModal
            isOpen={showRemoveModal}
            productName={selectedProductForRemoval.title}
            onClose={() => {
              setShowRemoveModal(false);
              setSelectedProductForRemoval(null);
            }}
            onConfirm={confirmRemoveProduct}
          />
        )}
    </DashboardLayout>
  );
}

export default Dashboard;
