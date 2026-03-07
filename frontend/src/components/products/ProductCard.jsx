import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updatePrice } from '../../store/scraperSlice';
import { fetchProducts } from '../../store/productSlice';
import { showSuccessToast, showErrorToast, showInfoToast } from '../ui/Toast';

function ProductCard({ product, onSetAlert, onViewDetails, onRemove, onFindSimilar }) {
    const dispatch = useDispatch();
    const [updating, setUpdating] = useState(false);

    const handleUpdatePrice = async () => {
        setUpdating(true);
        showInfoToast('Updating price...');
        try {
            await dispatch(updatePrice(product.id)).unwrap();
            await dispatch(fetchProducts()).unwrap();
            showSuccessToast('Price updated successfully!');
        } catch (error) {
            showErrorToast(error || 'Failed to update price');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="bg-white border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all overflow-hidden flex flex-col">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden border-b-3 border-black">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-contain p-4"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                )}
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-red-500 border-3 border-white px-4 py-2">
                            <span className="text-white font-bold uppercase tracking-wide text-sm">
                                Out of Stock
                            </span>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 left-2">
                    <span className="bg-[#6B9B8E] text-white text-xs px-2 py-1 border-2 border-black font-bold uppercase tracking-wide">
                        {product.platform}
                    </span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 text-base">
                    {product.title}
                </h3>

                {/* Price */}
                <div className="mb-4">
                    <div className="bg-[#E8DCC4] border-2 border-black p-3 mb-2">
                        <div className="text-2xl font-bold text-gray-900">
                            {product.currency}{product.currentPrice?.toLocaleString() || 'N/A'}
                        </div>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                        Updated {formatDate(product.lastChecked)}
                    </div>
                </div>

                {/* Metadata */}
                {product.metadata && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        {product.metadata.rating && (
                            <div className="bg-[#F4A460] border-2 border-black px-2 py-1 flex items-center gap-1">
                                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                <span className="text-white font-bold text-xs">{product.metadata.rating}</span>
                            </div>
                        )}
                        {product.metadata.reviewCount && (
                            <div className="bg-white border-2 border-black px-2 py-1">
                                <span className="font-bold text-gray-700 text-xs">{product.metadata.reviewCount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-auto space-y-2">
                    {/* Find Similar Button - Prominent */}
                    <button
                        onClick={() => onFindSimilar && onFindSimilar(product)}
                        className="w-full px-3 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white text-xs font-bold border-2 border-black hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                    >
                        <span>🔍</span>
                        <span>Find on Other Sites</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onSetAlert(product)}
                            className="px-3 py-2 bg-[#6B9B8E] text-white text-xs font-bold border-2 border-black hover:bg-[#5A8A7D] transition-all"
                        >
                            Set Alert
                        </button>
                        <button
                            onClick={handleUpdatePrice}
                            disabled={updating}
                            className="px-3 py-2 border-2 border-black bg-white text-gray-700 text-xs font-bold hover:bg-[#E8DCC4] transition-all disabled:opacity-50"
                            title="Update price"
                        >
                            {updating ? (
                                <div className="w-4 h-4 border-2 border-black border-t-[#6B9B8E] rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'Update'
                            )}
                        </button>
                    </div>

                    {/* Secondary actions */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => window.open(product.url, '_blank')}
                            className="px-2 py-1.5 text-xs border-2 border-black bg-white text-gray-700 font-bold hover:bg-[#E8DCC4]"
                        >
                            View
                        </button>
                        <button
                            onClick={() => onViewDetails(product)}
                            className="px-2 py-1.5 text-xs border-2 border-black bg-white text-gray-700 font-bold hover:bg-[#E8DCC4]"
                        >
                            Details
                        </button>
                        <button
                            onClick={() => onRemove(product.id)}
                            className="px-2 py-1.5 text-xs border-2 border-red-600 bg-white text-red-600 font-bold hover:bg-red-50"
                            title="Remove"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
