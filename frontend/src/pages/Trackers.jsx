import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from "../layouts/DashboardLayout";
import { showSuccessToast, showWarningToast, showInfoToast, showErrorToast } from "../components/ui/Toast";
import { useConfirmDialog } from "../components/ui/ConfirmDialog";
import { fetchProducts, removeProduct } from '../store/productSlice';
import { fetchAlerts, modifyAlert, removeAlert, toggleAlert } from '../store/alertSlice';
import AddProductModal from '../components/products/AddProductModal';
import SetAlertModal from '../components/products/SetAlertModal';
import FindSimilarProductsModal from '../components/products/FindSimilarProductsModal';
import { updatePrice, addToSearchHistory } from '../store/scraperSlice';

function Trackers() {
  const dispatch = useDispatch();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  
  // Redux state
  const { products, loading } = useSelector((state) => state.products);
  const { alerts } = useSelector((state) => state.alerts);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSetAlertModal, setShowSetAlertModal] = useState(false);
  const [productForAlert, setProductForAlert] = useState(null);
  const [editingAlertPrice, setEditingAlertPrice] = useState(0);
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [showFindSimilarModal, setShowFindSimilarModal] = useState(false);
  const [productForSimilar, setProductForSimilar] = useState(null);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Get alert for a product
  const getProductAlert = (productId) => {
    return alerts.find(alert => alert.productId === productId && alert.active);
  };

  // Remove product from tracking
  const handleRemoveProduct = async (productId) => {
    const productToRemove = products.find(p => p.id === productId);
    const confirmed = await confirm({
      title: 'Stop Tracking Product?',
      message: `Are you sure you want to stop tracking "${productToRemove?.title}"? You won't receive price alerts for this product anymore.`,
      confirmText: 'Remove',
      cancelText: 'Keep Tracking',
      confirmButtonColor: 'bg-red-500',
      confirmButtonHoverColor: 'hover:bg-red-600'
    });
    
    if (confirmed) {
      try {
        // Add to search history before removing from tracker
        if (productToRemove) {
          dispatch(addToSearchHistory(productToRemove));
        }
        
        await dispatch(removeProduct(productId)).unwrap();
        if (selectedProduct?.id === productId) {
          setSelectedProduct(null);
        }
        showSuccessToast(`${productToRemove?.title || 'Product'} removed from tracking`);
        dispatch(fetchProducts()); // Refresh list
      } catch (error) {
        showErrorToast(error || 'Failed to remove product');
      }
    }
  };

  // Edit alert price
  const handleEditAlert = (product) => {
    const existingAlert = getProductAlert(product.id);
    if (existingAlert) {
      setSelectedProduct(product);
      setEditingAlertPrice(existingAlert.targetPrice);
      setEditingAlertId(existingAlert.id);
      setShowEditModal(true);
    } else {
      // No alert exists, open set alert modal
      setProductForAlert(product);
      setShowSetAlertModal(true);
    }
  };

  // Save updated alert price
  const handleSaveAlertPrice = async () => {
    try {
      await dispatch(modifyAlert({ 
        id: editingAlertId, 
        updates: { targetPrice: parseFloat(editingAlertPrice) } 
      })).unwrap();
      setShowEditModal(false);
      showSuccessToast(`Price alert updated to ₹${parseFloat(editingAlertPrice).toLocaleString()} for ${selectedProduct.title}`);
      setSelectedProduct(null);
      dispatch(fetchAlerts()); // Refresh alerts
    } catch (error) {
      showErrorToast(error || 'Failed to update alert');
    }
  };

  // Toggle active status
  const handleToggleActive = async (alert) => {
    try {
      await dispatch(toggleAlert(alert.id)).unwrap();
      if (alert.active) {
        showInfoToast(`Alert paused`);
      } else {
        showSuccessToast(`Alert activated`);
      }
      dispatch(fetchAlerts()); // Refresh
    } catch (error) {
      showErrorToast(error || 'Failed to toggle alert');
    }
  };

  // Update product price manually
  const handleUpdatePrice = async (productId) => {
    try {
      showInfoToast('Updating price...');
      await dispatch(updatePrice(productId)).unwrap();
      showSuccessToast('Price updated successfully!');
      dispatch(fetchProducts()); // Refresh products
    } catch (error) {
      showErrorToast(error || 'Failed to update price');
    }
  };

  // Calculate price drop percentage
  const calculatePriceDrop = (currentPrice, alertPrice) => {
    

  // Handle find similar products
  const handleFindSimilar = (product) => {
    setProductForSimilar(product);
    setShowFindSimilarModal(true);
  };if (!currentPrice || !alertPrice) return 0;
    return ((currentPrice - alertPrice) / currentPrice * 100).toFixed(1);
  };

  // Combine products with their alerts
  const productsWithAlerts = products.map(product => ({
    ...product,
    alert: getProductAlert(product.id)
  }));

  return (
    <DashboardLayout>
      <ConfirmDialogComponent />
      
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white border-3 border-black p-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Manage Products
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {products.length} {products.length === 1 ? 'product' : 'products'} being tracked
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#F4A460] text-white text-sm font-bold border-3 border-black hover:bg-[#E89450] transition-all drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
            >
              + Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-8 gap-3">
          <div className="w-12 h-12 border-4 border-black border-t-[#6B9B8E] rounded-full animate-spin"></div>
          <div className="bg-[#E8DCC4] border-2 border-black px-4 py-2">
            <p className="text-gray-800 text-sm font-bold uppercase tracking-wide">Loading Products...</p>
          </div>
        </div>
      )}

      {/* No products */}
      {!loading && products.length === 0 && (
        <div className="bg-white border-3 border-black p-12 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="bg-[#E8DCC4] border-3 border-black p-8 w-24 h-24 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-2xl mb-2 uppercase tracking-wide">No Products Yet</h3>
            <p className="text-gray-600 font-medium text-sm mb-6">Start tracking products to monitor price changes and get alerts</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#F4A460] text-white text-sm font-bold border-3 border-black hover:bg-[#E89450] transition-all drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
            >
              + Add First Product
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsWithAlerts.map((product) => {
            const isPriceBelow = product.alert && product.currentPrice <= product.alert.targetPrice;
            const priceDrop = product.alert ? calculatePriceDrop(product.currentPrice, product.alert.targetPrice) : 0;

            return (
              <div key={product.id} className="bg-white border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 border-b-3 border-black flex items-center justify-center relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain p-4" />
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                  
                  {/* Alert Status Badge */}
                  {product.alert && (
                    <div className={`absolute top-3 right-3 px-3 py-1.5 text-xs font-bold border-2 border-black ${product.alert.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                      {product.alert.active ? '🔔 ON' : '🔕 OFF'}
                    </div>
                  )}
                  
                  {/* Price Drop Badge */}
                  {isPriceBelow && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-green-500 border-2 border-black">
                      <span className="text-white text-xs font-bold">{priceDrop}% OFF</span>
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-3">{product.platform}</p>
                  
                  {/* Price Information */}
                  <div className="bg-[#E8DCC4] border-2 border-black p-3 mb-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">Current</p>
                        <p className="text-xl font-bold text-gray-900">₹{product.currentPrice?.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleUpdatePrice(product.id)}
                        className="p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors"
                        title="Update price"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    
                    {product.alert && (
                      <div className="pt-2 border-t-2 border-black">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">Target</p>
                            <p className={`text-lg font-bold ${isPriceBelow ? 'text-green-600' : 'text-gray-800'}`}>
                              ₹{product.alert.targetPrice.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleEditAlert(product)}
                            className="p-1.5 bg-white border-2 border-black hover:bg-gray-100 transition-colors"
                            title="Edit alert"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {!product.alert && (
                      <button
                        onClick={() => handleEditAlert(product)}
                        className="w-full px-3 py-2 bg-[#6B9B8E] text-white text-xs font-bold border-2 border-black hover:bg-[#5A8A7D] transition-colors mt-2"
                      >
                        Set Alert
                      </button>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-4 pt-0 space-y-2">
                    <button
                      onClick={() => handleFindSimilar(product)}
                      className="w-full py-2 px-3 bg-linear-to-r from-blue-500 to-purple-500 text-white text-xs font-bold hover:from-blue-600 hover:to-purple-600 transition-all border-2 border-black flex items-center justify-center gap-1"
                    >
                      <span>🔍</span>
                      <span>Find on Other Sites</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => window.open(product.url, '_blank')}
                        className="py-2 px-3 bg-[#F4A460] text-white text-xs font-bold hover:bg-[#E89450] transition-colors border-2 border-black"
                      >
                        View Product
                      </button>
                      {product.alert && (
                        <button
                          onClick={() => handleToggleActive(product.alert)}
                          className="py-2 px-3 bg-white text-gray-800 text-xs font-bold hover:bg-gray-100 transition-colors border-2 border-black"
                        >
                          {product.alert.active ? 'Pause' : 'Activate'}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className={`py-2 px-3 bg-white text-red-600 text-xs font-bold hover:bg-red-50 transition-colors border-2 border-red-600 ${product.alert ? '' : 'col-span-2'}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Alert Price Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-md w-full drop-shadow-[12px_12px_0px_rgba(0,0,0,1)]">
            <div className="bg-[#6B9B8E] border-b-4 border-black p-4">
              <h2 className="text-2xl font-bold text-white">Edit Price Alert</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Set the price at which you want to be alerted for <strong>{selectedProduct?.title}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Alert Price ({selectedProduct.currency})</label>
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
                  Current Price: <span className="font-bold">{selectedProduct.currency}{selectedProduct.currentPrice?.toLocaleString()}</span>
                </p>
                <p className="text-xs text-gray-600">
                  You'll save: <span className="font-bold text-green-600">
                    {selectedProduct.currency}{(selectedProduct.currentPrice - editingAlertPrice).toLocaleString()} 
                    ({calculatePriceDrop(selectedProduct.currentPrice, editingAlertPrice)}%)
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
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="py-2 px-4 bg-white text-gray-800 font-bold hover:bg-gray-100 transition-colors border-2 border-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddProductModal 
          onClose={() => setShowAddModal(false)}
        />
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

      {showSetAlertModal && productForAlert && (
        <SetAlertModal
          isOpen={showSetAlertModal}
          product={productForAlert}
          onClose={() => {
            setShowSetAlertModal(false);
            setProductForAlert(null);
            // Refresh alerts to show the newly created alert
            dispatch(fetchAlerts());
          }}
        />
      )}
    </DashboardLayout>
  );
}

export default Trackers;
