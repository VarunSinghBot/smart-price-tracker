import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { showSuccessToast, showWarningToast, showInfoToast } from "../components/ui/Toast";
import { useConfirmDialog } from "../components/ui/ConfirmDialog";

function Trackers() {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlertPrice, setEditingAlertPrice] = useState(0);

  // Load tracked products from localStorage
  useEffect(() => {
    loadTrackedProducts();
  }, []);

  const loadTrackedProducts = () => {
    const savedTrackedProducts = localStorage.getItem('trackedProducts');
    if (savedTrackedProducts) {
      try {
        setTrackedProducts(JSON.parse(savedTrackedProducts));
      } catch (error) {
        console.error('Error loading tracked products:', error);
      }
    }
  };

  // Remove product from tracking
  const handleRemoveProduct = async (productId) => {
    const productToRemove = trackedProducts.find(p => p.id === productId);
    const confirmed = await confirm({
      title: 'Stop Tracking Product?',
      message: `Are you sure you want to stop tracking "${productToRemove?.name}"? You won't receive price alerts for this product anymore.`,
      confirmText: 'Remove',
      cancelText: 'Keep Tracking',
      confirmButtonColor: 'bg-red-500',
      confirmButtonHoverColor: 'hover:bg-red-600'
    });
    
    if (confirmed) {
      const updatedProducts = trackedProducts.filter(p => p.id !== productId);
      setTrackedProducts(updatedProducts);
      localStorage.setItem('trackedProducts', JSON.stringify(updatedProducts));
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
      showSuccessToast(`${productToRemove?.name || 'Product'} removed from tracking`);
    }
  };

  // Edit alert price
  const handleEditAlert = (product) => {
    setSelectedProduct(product);
    setEditingAlertPrice(product.alertPrice);
    setShowEditModal(true);
  };

  // Save updated alert price
  const handleSaveAlertPrice = () => {
    const updatedProducts = trackedProducts.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, alertPrice: parseFloat(editingAlertPrice) }
        : p
    );
    setTrackedProducts(updatedProducts);
    localStorage.setItem('trackedProducts', JSON.stringify(updatedProducts));
    setShowEditModal(false);
    showSuccessToast(`Price alert updated to ₹${parseFloat(editingAlertPrice).toLocaleString()} for ${selectedProduct.name}`);
    setSelectedProduct(null);
  };

  // Toggle active status
  const handleToggleActive = (productId) => {
    const product = trackedProducts.find(p => p.id === productId);
    const updatedProducts = trackedProducts.map(p => 
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    );
    setTrackedProducts(updatedProducts);
    localStorage.setItem('trackedProducts', JSON.stringify(updatedProducts));
    
    if (product?.isActive) {
      showInfoToast(`${product.name} tracking paused`);
    } else {
      showSuccessToast(`${product.name} tracking activated`);
    }
  };

  // Calculate price drop percentage
  const calculatePriceDrop = (currentPrice, alertPrice) => {
    return ((currentPrice - alertPrice) / currentPrice * 100).toFixed(1);
  };

  // Product placeholder SVG component
  const ProductPlaceholder = ({ className = "w-16 h-16" }) => (
    <svg className={`${className} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  return (
    <DashboardLayout>
      <ConfirmDialogComponent />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Price Trackers</h1>
        <p className="text-xl text-[#6B9B8E] font-semibold">
          Tracking {trackedProducts.length} product{trackedProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Empty State */}
      {trackedProducts.length === 0 && (
        <div className="bg-white border-4 border-black p-12 text-center drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Being Tracked</h3>
          <p className="text-gray-600 mb-6">Start tracking products to get price alerts and never miss a deal!</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors border-2 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      )}

      {/* Tracked Products Grid */}
      {trackedProducts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trackedProducts.map((product) => {
            const isPriceBelow = product.price <= product.alertPrice;
            const priceDrop = calculatePriceDrop(product.price, product.alertPrice);
            
            return (
              <div 
                key={product.id}
                className={`bg-white border-4 ${isPriceBelow ? 'border-green-500' : 'border-black'} p-6 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all relative`}
              >
                {/* Active Status Badge */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleToggleActive(product.id)}
                    className={`px-3 py-1 text-xs font-bold border-2 border-black ${
                      product.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {product.isActive ? '● ACTIVE' : '○ PAUSED'}
                  </button>
                </div>

                {/* Price Alert Badge */}
                {isPriceBelow && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 text-xs font-bold border-2 border-black animate-pulse">
                    🔥 PRICE ALERT!
                  </div>
                )}

                {/* Product Image */}
                <div className="aspect-square bg-gray-100 border-2 border-black mb-4 flex items-center justify-center overflow-hidden mt-8">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <ProductPlaceholder className="w-24 h-24" />
                  )}
                </div>

                {/* Product Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.brand} • {product.platform}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-[#F4A460]' : 'text-gray-300'} fill-current`} 
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-600 ml-1">({product.reviews.toLocaleString()})</span>
                  </div>
                </div>

                {/* Price Information */}
                <div className="border-t-2 border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Price:</span>
                    <span className="text-xl font-bold text-gray-800">₹{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Alert Price:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${isPriceBelow ? 'text-green-600' : 'text-gray-800'}`}>
                        ₹{product.alertPrice.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleEditAlert(product)}
                        className="p-1 hover:bg-gray-100 border border-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {isPriceBelow && (
                    <div className="bg-green-100 border-2 border-green-500 p-2 text-center">
                      <p className="text-green-700 font-bold text-sm">
                        Price is {priceDrop}% below your alert! 🎉
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(product.url || '#', '_blank')}
                    className="flex-1 py-2 px-4 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-colors border-2 border-black"
                  >
                    View Product
                  </button>
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="py-2 px-4 bg-white text-red-600 font-bold hover:bg-red-50 transition-colors border-2 border-red-600"
                  >
                    Remove
                  </button>
                </div>

                {/* Tracking Info */}
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <p className="text-xs text-gray-500">
                    Tracking since: {new Date(product.trackedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Alert Price Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-md w-full drop-shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <div className="bg-[#6B9B8E] border-b-4 border-black p-4">
              <h2 className="text-2xl font-bold text-black">Edit Price Alert</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Set the price at which you want to be alerted for <strong>{selectedProduct?.name}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Alert Price (₹)</label>
                <input
                  type="number"
                  value={editingAlertPrice}
                  onChange={(e) => setEditingAlertPrice(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-black text-gray-800 font-medium focus:outline-none focus:border-[#6B9B8E]"
                  min="0"
                  step="100"
                />
              </div>
              <div className="bg-gray-100 border-2 border-gray-300 p-3 mb-4">
                <p className="text-xs text-gray-600">
                  Current Price: <span className="font-bold">₹{selectedProduct?.price.toLocaleString()}</span>
                </p>
                <p className="text-xs text-gray-600">
                  You'll save: <span className="font-bold text-green-600">
                    ₹{(selectedProduct?.price - editingAlertPrice).toLocaleString()} 
                    ({calculatePriceDrop(selectedProduct?.price, editingAlertPrice)}%)
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAlertPrice}
                  className="flex-1 py-2 px-4 bg-[#6B9B8E] text-white font-bold hover:bg-[#5A8A7D] transition-colors border-2 border-black"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-4 bg-white text-gray-800 font-bold hover:bg-gray-100 transition-colors border-2 border-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Trackers;
