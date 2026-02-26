import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchAlerts } from '../store/alertSlice';
import { fetchProducts } from '../store/productSlice';

function Notifications() {
  const dispatch = useDispatch();
  
  // Redux state
  const { alerts, loading } = useSelector((state) => state.alerts);
  const { products } = useSelector((state) => state.products);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchAlerts(false)); // Get all alerts including notified ones
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get product details for an alert
  const getProductForAlert = (productId) => {
    return products.find(p => p.id === productId);
  };

  // Filter alerts that have been triggered (notified)
  const triggeredAlerts = alerts.filter(alert => alert.notified);
  const activeAlerts = alerts.filter(alert => alert.active && !alert.notified);
  
  // Filter out-of-stock products
  const outOfStockProducts = products.filter(product => !product.inStock);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white border-3 border-black p-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {triggeredAlerts.length} price {triggeredAlerts.length === 1 ? 'alert' : 'alerts'} triggered · {activeAlerts.length} active · {outOfStockProducts.length} out of stock
              </p>
            </div>
            <div className="bg-[#6B9B8E] border-3 border-black p-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-8 gap-3">
          <div className="w-12 h-12 border-4 border-black border-t-[#6B9B8E] rounded-full animate-spin"></div>
          <div className="bg-[#E8DCC4] border-2 border-black px-4 py-2">
            <p className="text-gray-800 text-sm font-bold uppercase tracking-wide">Loading Notifications...</p>
          </div>
        </div>
      )}

      {/* No notifications */}
      {!loading && alerts.length === 0 && (
        <div className="bg-white border-3 border-black p-12 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="bg-[#E8DCC4] border-3 border-black p-8 w-24 h-24 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-2xl mb-2 uppercase tracking-wide">No Notifications</h3>
            <p className="text-gray-600 font-medium text-sm mb-6">Set price alerts on products to receive notifications when prices drop</p>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {!loading && alerts.length > 0 && (
        <div className="space-y-6">
          {/* Triggered Alerts */}
          {triggeredAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#F4A460] border-2 border-black px-3 py-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">Price Drops</h2>
                </div>
                <div className="flex-1 h-0.5 bg-black"></div>
              </div>
              
              <div className="space-y-4">
                {triggeredAlerts.map((alert) => {
                  const product = getProductForAlert(alert.productId);
                  if (!product) return null;
                  
                  const savings = product.currentPrice ? alert.targetPrice - product.currentPrice : 0;
                  const savingsPercent = product.currentPrice 
                    ? ((savings / alert.targetPrice) * 100).toFixed(1)
                    : 0;

                  return (
                    <div
                      key={alert.id}
                      className="bg-white border-3 border-black p-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 border-2 border-black bg-gray-100 shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Alert Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                              {product.title}
                            </h3>
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                              {formatDate(alert.notifiedAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-green-500 border-2 border-black px-2 py-1 text-xs font-bold text-white uppercase">
                              Price Drop!
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {product.platform}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Target Price</p>
                              <p className="text-lg font-bold text-gray-900">
                                ₹{alert.targetPrice.toLocaleString()}
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Current Price</p>
                              <p className="text-lg font-bold text-green-600">
                                ₹{product.currentPrice?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {savings > 0 && (
                            <div className="bg-green-100 border-2 border-green-500 px-3 py-2 inline-block">
                              <p className="text-sm font-bold text-green-800">
                                You save ₹{Math.abs(savings).toLocaleString()} ({savingsPercent}%)
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex gap-2">
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-[#6B9B8E] text-white text-sm font-bold border-3 border-black hover:bg-[#5A8A7D] transition-all drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                            >
                              Buy Now
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Out of Stock Products */}
          {outOfStockProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-red-500 border-2 border-black px-3 py-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">Out of Stock</h2>
                </div>
                <div className="flex-1 h-0.5 bg-black"></div>
              </div>
              
              <div className="space-y-4">
                {outOfStockProducts.map((product) => {
                  return (
                    <div
                      key={product.id}
                      className="bg-white border-3 border-black p-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 border-2 border-black bg-gray-100 shrink-0 relative">
                          {product.imageUrl ? (
                            <>
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-contain opacity-60"
                              />
                              <div className="absolute inset-0 bg-red-500 bg-opacity-20"></div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                              {product.title}
                            </h3>
                            {product.lastChecked && (
                              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                {formatDate(product.lastChecked)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-red-500 border-2 border-black px-2 py-1 text-xs font-bold text-white uppercase">
                              Out of Stock
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {product.platform}
                            </span>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Last Available Price</p>
                            <p className="text-lg font-bold text-gray-600">
                              ₹{product.currentPrice?.toLocaleString() || 'N/A'}
                            </p>
                          </div>

                          <div className="bg-red-50 border-2 border-red-300 px-3 py-2 inline-block mb-3">
                            <p className="text-sm font-bold text-red-700">
                              This product is currently unavailable
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold border-3 border-black hover:bg-gray-300 transition-all drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                            >
                              Check Availability
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Alerts (Waiting) */}
          {activeAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#6B9B8E] border-2 border-black px-3 py-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">Active Alerts</h2>
                </div>
                <div className="flex-1 h-0.5 bg-black"></div>
              </div>
              
              <div className="space-y-4">
                {activeAlerts.map((alert) => {
                  const product = getProductForAlert(alert.productId);
                  if (!product) return null;

                  const priceDiff = product.currentPrice ? product.currentPrice - alert.targetPrice : 0;

                  return (
                    <div
                      key={alert.id}
                      className="bg-white border-3 border-black p-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 border-2 border-black bg-gray-100 shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Alert Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                            {product.title}
                          </h3>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-yellow-400 border-2 border-black px-2 py-1 text-xs font-bold text-gray-900 uppercase">
                              Watching
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {product.platform}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Current Price</p>
                              <p className="text-lg font-bold text-gray-900">
                                ₹{product.currentPrice?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Target Price</p>
                              <p className="text-lg font-bold text-[#6B9B8E]">
                                ₹{alert.targetPrice.toLocaleString()}
                              </p>
                            </div>
                            {priceDiff > 0 && (
                              <div className="bg-gray-100 border-2 border-black px-3 py-1">
                                <p className="text-xs font-bold text-gray-700">
                                  ₹{priceDiff.toLocaleString()} to go
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Notifications;
