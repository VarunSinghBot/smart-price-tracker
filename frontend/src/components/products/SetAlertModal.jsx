import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addAlert } from '../../store/alertSlice';
import { showSuccessToast, showErrorToast } from '../ui/Toast';

function SetAlertModal({ isOpen, onClose, product }) {
    const [targetPrice, setTargetPrice] = useState('');
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const price = parseFloat(targetPrice);
        if (isNaN(price) || price <= 0) {
            showErrorToast('Please enter a valid price');
            return;
        }

        if (product.currentPrice && price >= product.currentPrice) {
            showErrorToast('Alert price should be lower than current price');
            return;
        }

        setLoading(true);
        try {
            await dispatch(addAlert({ 
                productId: product.id, 
                targetPrice: price 
            })).unwrap();

            showSuccessToast(`Alert set! You'll be notified when price drops to ${product.currency} ${price.toLocaleString()}`);
            setTargetPrice('');
            onClose();
        } catch (err) {
            showErrorToast(err || 'Failed to set alert');
        } finally {
            setLoading(false);
        }
    };

    // Calculate savings
    const calculateSavings = () => {
        const price = parseFloat(targetPrice);
        if (isNaN(price) || !product.currentPrice) return null;
        
        const savings = product.currentPrice - price;
        const percentage = ((savings / product.currentPrice) * 100).toFixed(1);
        
        return { amount: savings, percentage };
    };

    const savings = calculateSavings();

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border-3 border-black max-w-md w-full relative drop-shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                {/* Header */}
                <div className="bg-[#6B9B8E] p-6 border-b-3 border-black">
                    <h2 className="text-2xl font-bold text-white">Edit Price Alert</h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                                Set the price at which you want to be alerted for <strong>{product.title}</strong>
                            </p>
                            
                            <label className="block text-sm font-bold text-gray-800 mb-2">
                                Alert Price (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder="22000"
                                className="w-full px-4 py-3 border-3 border-black font-bold text-xl focus:outline-none focus:border-[#6B9B8E] bg-white"
                                disabled={loading}
                            />
                        </div>

                        {/* Savings Display */}
                        {savings && savings.amount > 0 && (
                            <div className="mb-6 p-4 bg-gray-100 border-2 border-gray-300">
                                <p className="text-sm text-gray-600">
                                    Current Price: <strong>₹{product.currentPrice?.toLocaleString()}</strong>
                                </p>
                                <p className="text-sm text-green-600 font-semibold mt-1">
                                    You'll save: ₹{savings.amount.toLocaleString()} ({savings.percentage}%)
                                </p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading || !targetPrice}
                                className="flex-1 px-6 py-3 bg-[#6B9B8E] text-white font-semibold border-3 border-black hover:bg-[#5A8A7D] transition-all disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-3 border-black bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-all drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SetAlertModal;
