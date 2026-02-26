import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scrapeNewProduct, searchCrossPlatform } from '../../store/scraperSlice';
import { fetchProducts } from '../../store/productSlice';
import { showSuccessToast, showErrorToast, showInfoToast } from '../ui/Toast';

function AddProductModal({ onClose, prefilledUrl, onProductAdded }) {
    const [url, setUrl] = useState(prefilledUrl || '');
    const [detectedProducts, setDetectedProducts] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [platformResults, setPlatformResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [autoSubmitted, setAutoSubmitted] = useState(false);
    const [searchingSimilar, setSearchingSimilar] = useState(false);
    const dispatch = useDispatch();
    const { scraping, error } = useSelector((state) => state.scraper);
    const { supportedPlatforms } = useSelector((state) => state.scraper);

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!url.trim()) {
            showErrorToast('Please enter a product URL');
            return;
        }

        try {
            // Validate URL format
            new URL(url);
            
            setShowResults(true);
            setSearchingSimilar(true);
            
            // Scrape product and search other platforms simultaneously
            showInfoToast('Searching all platforms...');
            
            const result = await dispatch(searchCrossPlatform({ url })).unwrap();
            
            // Show detected product and similar products
            setDetectedProducts([result.mainProduct]);
            
            // Store platform results (includes search URLs)
            if (result.platformResults) {
                setPlatformResults(result.platformResults);
            }
            
            if (result.similarProducts && result.similarProducts.length > 0) {
                setSimilarProducts(result.similarProducts);
                showSuccessToast(`Found ${result.totalProductsFound} product(s) across ${result.totalSearched + 1} platform(s)!`);
            } else {
                showSuccessToast('Product found!');
            }
            
        } catch (err) {
            showErrorToast(err || 'Failed to add product. Please check the URL and try again.');
            setShowResults(false);
        } finally {
            setSearchingSimilar(false);
        }
    };

    // Auto-submit if URL is pre-filled
    useEffect(() => {
        if (prefilledUrl && !autoSubmitted) {
            setAutoSubmitted(true);
            handleSubmit();
        }
    }, [prefilledUrl, autoSubmitted]);

    const handleSearchSimilar = async () => {
        if (detectedProducts.length === 0 || !url) return;
        
        setSearchingSimilar(true);
        showInfoToast('Searching similar products on other platforms...');
        
        try {
            const result = await dispatch(searchCrossPlatform({ url })).unwrap();
            
            // Set similar products from all platforms
            if (result.similarProducts && result.similarProducts.length > 0) {
                setSimilarProducts(result.similarProducts);
                showSuccessToast(`Found ${result.totalProductsFound} similar product(s) across ${result.totalSearched} platform(s)!`);
            } else {
                showInfoToast('No similar products found on other platforms.');
            }
            
        } catch (err) {
            showErrorToast(err || 'Failed to search on other platforms.');
        } finally {
            setSearchingSimilar(false);
        }
    };

    const handleTrackProduct = async (product) => {
        try {
            showInfoToast('Adding product to tracker...');
            
            // Actually save the product to the database
            const result = await dispatch(scrapeNewProduct(product.url)).unwrap();
            
            if (!result) {
                showErrorToast('Failed to add product. Please try again.');
                return;
            }
            
            showSuccessToast(`${product.title} has been added to your tracker!`);
            
            // Refresh products list
            await dispatch(fetchProducts());
            
            // Notify parent component
            if (onProductAdded) {
                onProductAdded();
            }
            
            // Reset and close
            setUrl('');
            setDetectedProducts([]);
            setSimilarProducts([]);
            setPlatformResults([]);
            setShowResults(false);
            onClose();
        } catch (error) {
            console.error('Error adding product:', error);
            showErrorToast(error || 'Failed to add product. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full relative max-h-[90vh] flex flex-col border-4 border-black drop-shadow-[12px_12px_0px_rgba(0,0,0,0.8)]">
                {/* Header */}
                <div className="bg-[#F4A460] p-4 flex items-center justify-between border-b-4 border-black">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#6B9B8E] border-2 border-black flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Product Tracker</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-900 font-bold text-2xl w-10 h-10 flex items-center justify-center bg-black border-2 border-white hover:bg-gray-800 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* URL Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste product URL here..."
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium border-2 border-gray-300 focus:outline-none focus:border-[#6B9B8E] transition-colors text-sm"
                            disabled={scraping}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !scraping && !searchingSimilar) {
                                    handleSubmit(e);
                                }
                            }}
                        />
                    </div>

                    {/* Search Button */}
                    <div className="mb-6">
                        <button
                            onClick={handleSubmit}
                            disabled={scraping || searchingSimilar || !url.trim()}
                            className="w-full px-6 py-3 bg-[#6B9B8E] text-white font-bold hover:bg-[#5A8A7D] transition-all border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                        >
                            {(scraping || searchingSimilar) ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Searching...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search Product
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Loading State */}
                    {(scraping || searchingSimilar) && (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 border-4 border-black border-t-[#F4A460] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">
                                {searchingSimilar ? 'Searching all platforms...' : 'Loading Product...'}
                            </p>
                        </div>
                    )}

                    {/* Found Products */}
                    {!scraping && !searchingSimilar && detectedProducts.length > 0 && (
                        <div>
                            {/* Success Badge */}
                            <div className="mb-6 inline-block">
                                <div className="bg-white border-3 border-[#6B9B8E] px-4 py-2">
                                    <span className="text-[#6B9B8E] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Product Found
                                    </span>
                                </div>
                            </div>

                            {/* Refresh Search Button (if needed) */}
                            {similarProducts.length === 0 && (
                                <div className="mb-4">
                                    <button
                                        onClick={handleSearchSimilar}
                                        disabled={searchingSimilar}
                                        className="px-4 py-2 bg-white border-2 border-[#6B9B8E] text-[#6B9B8E] font-bold hover:bg-[#E8F4F1] transition-all text-sm disabled:opacity-50"
                                    >
                                        {searchingSimilar ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-[#6B9B8E] border-t-transparent rounded-full animate-spin"></div>
                                                Searching...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Retry Search on Other Platforms
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Product Card */}
                            <div className="border-4 border-black">
                                {detectedProducts.map((product, index) => (
                                    <div key={index} className="flex gap-6 p-6">
                                        {/* Product Image */}
                                        <div className="w-40 h-40 border-3 border-black shrink-0 bg-[#E8DCC4] flex items-center justify-center p-4">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            {/* Platform Badge */}
                                            <div className="mb-4 inline-block">
                                                <div className="border-2 border-[#6B9B8E] px-3 py-1">
                                                    <span className="text-[#6B9B8E] font-bold text-sm">{product.platform || 'Amazon'}</span>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{product.title}</h3>

                                            {/* Price */}
                                            <div className="border-2 border-black p-4 mb-6">
                                                <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">Current Price</p>
                                                <p className="text-[#6B9B8E] text-4xl font-bold">
                                                    {product.currency === 'INR' ? '₹' : '$'}{product.currentPrice?.toLocaleString() || 'N/A'}
                                                </p>
                                            </div>

                                            {/* Buttons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleTrackProduct(product)}
                                                    className="px-6 py-3 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-all border-2 border-black text-sm uppercase tracking-wide"
                                                >
                                                    Track This
                                                </button>
                                                <button
                                                    onClick={() => window.open(product.url, '_blank')}
                                                    className="px-6 py-3 border-2 border-black bg-white text-gray-800 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-wide"
                                                >
                                                    View Original
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Similar Products from Other Platforms */}
                            {similarProducts.length > 0 && (
                                <div className="mt-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Similar Products on Other Platforms</h3>
                                    </div>

                                    <div className="grid gap-4">
                                        {similarProducts.map((product, index) => (
                                            <div key={index} className="border-3 border-black bg-white p-4 hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)] transition-all">
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="w-24 h-24 border-2 border-black shrink-0 bg-[#E8DCC4] flex items-center justify-center p-2">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.title}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Platform Badge */}
                                                        <div className="mb-2 inline-block">
                                                            <div className="border-2 border-[#6B9B8E] px-2 py-1">
                                                                <span className="text-[#6B9B8E] font-bold text-xs">{product.platform}</span>
                                                            </div>
                                                        </div>

                                                        {/* Title */}
                                                        <h4 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">{product.title}</h4>

                                                        {/* Price */}
                                                        <p className="text-[#6B9B8E] text-2xl font-bold mb-3">
                                                            {product.currency === 'INR' ? '₹' : '$'}{product.currentPrice?.toLocaleString() || 'N/A'}
                                                        </p>

                                                        {/* Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleTrackProduct(product)}
                                                                className="px-4 py-2 bg-[#F4A460] text-white font-bold hover:bg-[#E89450] transition-all border-2 border-black text-xs uppercase tracking-wide"
                                                            >
                                                                Track
                                                            </button>
                                                            <button
                                                                onClick={() => window.open(product.url, '_blank')}
                                                                className="px-4 py-2 border-2 border-black bg-white text-gray-800 font-bold hover:bg-gray-50 transition-all text-xs uppercase tracking-wide"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Platform Search Links (for platforms with no scraped products but have search URLs) */}
                            {platformResults.length > 0 && platformResults.some(p => p.searchUrl && (!p.products || p.products.length === 0)) && (
                                <div className="mt-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Search on Other Platforms</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {platformResults
                                            .filter(p => p.searchUrl && (!p.products || p.products.length === 0))
                                            .map((platformResult, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => window.open(platformResult.searchUrl, '_blank')}
                                                    className="px-4 py-3 border-3 border-black bg-white hover:bg-[#E8DCC4] transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#6B9B8E] border-2 border-black flex items-center justify-center shrink-0">
                                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">View on {platformResult.platform}</p>
                                                            <p className="text-xs text-gray-600">Click to search</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-black border-t-4 border-black p-4">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-black text-white font-bold hover:bg-gray-900 transition-all text-sm uppercase tracking-wide"
                    >
                        ✕ Close Window
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddProductModal;
