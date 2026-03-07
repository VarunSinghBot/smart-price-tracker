import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { findSimilarProducts, clearMatches } from '../../store/productMatcherSlice';
import toast from 'react-hot-toast';

/**
 * Component to search for the same product across different platforms
 * Uses image and text similarity matching
 */
const FindSimilarProductsModal = ({ product, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { 
        sourceProduct, 
        matches, 
        loading, 
        error,
        searchDuration,
        totalMatches 
    } = useSelector((state) => state.productMatcher);

    const [selectedPlatforms, setSelectedPlatforms] = useState(['Flipkart', 'eBay', 'Amazon']);
    const [minConfidence, setMinConfidence] = useState(60);

    const handleSearch = async () => {
        if (!product?.url) {
            toast.error('No product URL provided');
            return;
        }

        try {
            await dispatch(findSimilarProducts({
                url: product.url,
                platforms: selectedPlatforms,
                limit: 5,
                minConfidence: minConfidence,
            })).unwrap();

            toast.success(`Found ${totalMatches} similar products!`);
        } catch (err) {
            toast.error(err || 'Failed to find similar products');
        }
    };

    const handleClose = () => {
        dispatch(clearMatches());
        onClose();
    };

    // Calculate price analytics
    const getPriceAnalytics = () => {
        if (!matches || matches.length === 0) return null;

        const allProducts = [
            { ...sourceProduct, platform: sourceProduct?.platform || product?.platform },
            ...matches
        ];

        const productsWithPrices = allProducts.filter(p => p.price);
        if (productsWithPrices.length === 0) return null;

        const lowestPrice = Math.min(...productsWithPrices.map(p => p.price));
        const highestPrice = Math.max(...productsWithPrices.map(p => p.price));
        const avgPrice = productsWithPrices.reduce((sum, p) => sum + p.price, 0) / productsWithPrices.length;

        const bestDeal = productsWithPrices.find(p => p.price === lowestPrice);
        const savings = highestPrice - lowestPrice;
        const savingsPercent = ((savings / highestPrice) * 100).toFixed(1);

        return {
            lowestPrice,
            highestPrice,
            avgPrice: Math.round(avgPrice),
            bestDeal,
            savings,
            savingsPercent,
            totalProducts: productsWithPrices.length
        };
    };

    const analytics = getPriceAnalytics();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-[6px] border-black max-w-6xl w-full max-h-[90vh] flex flex-col drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-dialog-enter">
                {/* Header */}
                <div className="bg-[#6B9B8E] border-b-[6px] border-black p-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black border-3 border-white flex items-center justify-center">
                            <span className="text-3xl">🔍</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Find Similar Products</h2>
                            <p className="text-white/90 text-sm font-medium">
                                Search for the same product on other platforms
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 bg-black text-white hover:bg-red-600 transition-all border-3 border-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.7)] flex items-center justify-center font-bold text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto bg-[#E8DCC4]">
                    {/* Source Product */}
                    <div className="mb-6">
                        <div className="bg-[#6B9B8E] border-3 border-black p-3 mb-4 inline-block drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Source Product</h3>
                        </div>
                        <div className="border-4 border-black p-5 flex items-center gap-4 bg-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                            <div className="w-24 h-24 bg-[#E8DCC4] border-3 border-black flex items-center justify-center p-2 shrink-0">
                                <img
                                    src={product?.imageUrl}
                                    alt={product?.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-lg uppercase mb-2">{product?.title}</p>
                                <div className="bg-[#E8F4F1] border-2 border-black px-3 py-1 inline-block mb-2">
                                    <p className="text-sm font-bold text-[#6B9B8E]">
                                        {product?.platform}
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-[#6B9B8E]">
                                    ₹{product?.currentPrice?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Options */}
                    <div className="mb-6">
                        <div className="bg-[#6B9B8E] border-3 border-black p-3 mb-4 inline-block drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Search Options</h3>
                        </div>
                        <div className="bg-white border-4 border-black p-5 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-5">
                            {/* Platform Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                                    Platforms to Search
                                </label>
                                <div className="flex gap-4">
                                    {['Amazon', 'Flipkart', 'eBay'].map((platform) => (
                                        <label key={platform} className="flex items-center bg-[#E8DCC4] border-3 border-black px-4 py-3 font-bold uppercase tracking-wide hover:bg-[#F4A460] hover:text-white transition-colors cursor-pointer drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                            <input
                                                type="checkbox"
                                                checked={selectedPlatforms.includes(platform)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPlatforms([...selectedPlatforms, platform]);
                                                    } else {
                                                        setSelectedPlatforms(
                                                            selectedPlatforms.filter((p) => p !== platform)
                                                        );
                                                    }
                                                }}
                                                className="mr-3 w-5 h-5 border-2 border-black"
                                            />
                                            {platform}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Confidence Threshold */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                                    Minimum Match Confidence: <span className="text-[#6B9B8E]">{minConfidence}%</span>
                                </label>
                                <div className="bg-[#E8DCC4] border-3 border-black p-4">
                                    <input
                                        type="range"
                                        min="50"
                                        max="90"
                                        step="5"
                                        value={minConfidence}
                                        onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                                        className="w-full h-3 appearance-none bg-white border-2 border-black"
                                        style={{
                                            background: `linear-gradient(to right, #6B9B8E 0%, #6B9B8E ${((minConfidence - 50) / 40) * 100}%, white ${((minConfidence - 50) / 40) * 100}%, white 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs font-bold text-gray-700 mt-2 uppercase">
                                        <span>More Results (50%)</span>
                                        <span>Higher Accuracy (90%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={loading || selectedPlatforms.length === 0}
                        className="w-full bg-[#F4A460] text-white py-4 px-6 font-bold text-lg uppercase hover:bg-[#E89450] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all border-4 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] disabled:drop-shadow-none"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="w-6 h-6 border-4 border-white border-t-black mr-3 animate-spin"></div>
                                Searching...
                            </span>
                        ) : (
                            '🔍 Find Similar Products'
                        )}
                    </button>

                    {/* Results */}
                    {matches && matches.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-[#6B9B8E] border-4 border-black p-4 mb-6 flex justify-between items-center drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
                                    🎯 Found {totalMatches} Matches
                                </h3>
                                <span className="bg-black text-white px-3 py-2 text-sm font-bold uppercase border-2 border-white drop-shadow-[2px_2px_0px_rgba(255,255,255,0.3)]">
                                    ⏱️ {searchDuration}
                                </span>
                            </div>

                            {/* Price Comparison Analytics */}
                            {analytics && (
                                <div className="mb-6 bg-white border-4 border-black p-5 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                                    <h4 className="bg-[#F4A460] border-3 border-black p-3 font-bold text-2xl mb-5 flex items-center gap-2 uppercase tracking-wide drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <span>📊</span>
                                        <span>Price Comparison</span>
                                    </h4>
                                    
                                    {/* Best Deal Highlight */}
                                    <div className="bg-[#E8F4F1] border-4 border-black p-5 mb-5 relative drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                                        <div className="absolute -top-3 -right-3 bg-[#F4A460] text-white px-4 py-2 border-3 border-black font-bold text-sm uppercase rotate-3 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                            🏆 Best Deal
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">🏆 Lowest Price Found</p>
                                                <p className="text-4xl font-black text-[#6B9B8E] mb-2">
                                                    ₹{analytics.lowestPrice.toLocaleString()}
                                                </p>
                                                <p className="bg-black text-white px-3 py-1 inline-block font-bold uppercase text-sm border-2 border-[#6B9B8E]">
                                                    on {analytics.bestDeal.platform}
                                                </p>
                                            </div>
                                            <div className="text-right bg-[#F4A460] border-3 border-black p-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                                <p className="text-sm font-bold text-white mb-1 uppercase">You Save</p>
                                                <p className="text-3xl font-black text-white">
                                                    ₹{analytics.savings.toLocaleString()}
                                                </p>
                                                <p className="text-xl font-bold text-white">
                                                    {analytics.savingsPercent}% OFF
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Statistics Grid */}
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div className="bg-[#E8F4F1] border-3 border-black p-4 text-center drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Lowest Price</p>
                                            <p className="text-2xl font-black text-[#6B9B8E]">
                                                ₹{analytics.lowestPrice.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white border-3 border-black p-4 text-center drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Average Price</p>
                                            <p className="text-2xl font-black text-blue-600">
                                                ₹{analytics.avgPrice.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-[#FFE0E0] border-3 border-black p-4 text-center drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Highest Price</p>
                                            <p className="text-2xl font-black text-red-600">
                                                ₹{analytics.highestPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price Comparison Bar */}
                                    <div className="bg-[#E8DCC4] border-3 border-black p-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Price Range Across {analytics.totalProducts} Sites</p>
                                        <div className="relative h-6 bg-white border-3 border-black overflow-hidden">
                                            <div 
                                                className="absolute h-full bg-linear-to-r from-[#6B9B8E] to-[#F4A460]"
                                                style={{ width: '100%' }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-3">
                                            <span className="bg-[#6B9B8E] text-white px-3 py-1 text-xs font-bold uppercase border-2 border-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                Best: ₹{analytics.lowestPrice.toLocaleString()}
                                            </span>
                                            <span className="bg-[#F4A460] text-white px-3 py-1 text-xs font-bold uppercase border-2 border-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                Worst: ₹{analytics.highestPrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {matches.map((match, index) => {
                                    const isPriceSavings = analytics && match.price > analytics.lowestPrice;
                                    const savingsAmount = analytics ? match.price - analytics.lowestPrice : 0;
                                    const isBestPrice = analytics && match.price === analytics.lowestPrice;
                                    
                                    return (
                                    <div
                                        key={index}
                                        className={`border-4 border-black p-5 relative bg-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all ${
                                            isBestPrice ? 'bg-[#E8F4F1]' : ''
                                        }`}
                                    >
                                        {/* Best Price Badge */}
                                        {isBestPrice && (
                                            <div className="absolute -top-4 -right-4 bg-[#F4A460] text-white px-4 py-2 text-xs font-bold border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] z-10 uppercase rotate-6">
                                                🏆 Best Price
                                            </div>
                                        )}
                                        {/* Platform Badge */}
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-2 text-xs font-bold uppercase border-3 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] ${
                                                match.platform === 'Amazon' ? 'bg-[#FF9900] text-black' :
                                                match.platform === 'Flipkart' ? 'bg-[#2874F0] text-white' :
                                                'bg-[#FFD700] text-black'
                                            }`}>
                                                {match.platform}
                                            </span>
                                            <span className={`px-3 py-2 text-xs font-bold uppercase border-3 border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] ${
                                                match.matchQuality === 'high' ? 'bg-[#6B9B8E] text-white' :
                                                match.matchQuality === 'medium' ? 'bg-[#F4A460] text-white' :
                                                'bg-gray-300 text-gray-800'
                                            }`}>
                                                {match.confidence.toFixed(1)}% Match
                                            </span>
                                        </div>

                                        {/* Product Image */}
                                        <div className="bg-[#E8DCC4] border-3 border-black p-3 mb-4">
                                            <img
                                                src={match.imageUrl}
                                                alt={match.title}
                                                className="w-full h-40 object-contain"
                                            />
                                        </div>

                                        {/* Product Title */}
                                        <p className="font-bold text-sm mb-3 line-clamp-2 uppercase text-gray-900">
                                            {match.title}
                                        </p>

                                        {/* Price */}
                                        <div className="bg-[#6B9B8E] border-3 border-black p-3 mb-3 text-center drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                            <p className="text-2xl font-black text-white">
                                                ₹{match.price?.toLocaleString() || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Price Savings Info */}
                                        {isPriceSavings && (
                                            <div className="bg-[#F4A460] border-3 border-black px-3 py-2 mb-3 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                                <p className="text-xs font-bold text-white uppercase">
                                                    💸 ₹{savingsAmount.toLocaleString()} More than Best
                                                </p>
                                            </div>
                                        )}

                                        {/* Match Details */}
                                        <div className="bg-[#E8DCC4] border-3 border-black p-3 mb-3 space-y-2 text-xs font-bold uppercase">
                                            <div className="flex justify-between">
                                                <span>Image:</span>
                                                <span className="text-[#6B9B8E]">{match.imageSimilarity?.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Text:</span>
                                                <span className="text-[#6B9B8E]">{match.textSimilarity?.toFixed(1)}%</span>
                                            </div>
                                            {match.brandMatch && (
                                                <div className="bg-[#6B9B8E] text-white text-center py-1 px-2 border-2 border-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                    ✓ Brand Match
                                                </div>
                                            )}
                                        </div>

                                        {/* View Button */}
                                        <a
                                            href={match.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`block w-full text-center py-3 font-bold text-sm uppercase border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all ${
                                                isBestPrice 
                                                    ? 'bg-[#6B9B8E] hover:bg-[#5A8A7D] text-white'
                                                    : 'bg-white hover:bg-[#E8DCC4] text-black'
                                            }`}
                                        >
                                            {isBestPrice ? '🏆 Buy Best Deal' : `View on ${match.platform}`} →
                                        </a>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {matches && matches.length === 0 && !loading && (
                        <div className="mt-6 text-center py-12 bg-white border-4 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-xl font-bold mb-2 uppercase text-gray-900">No Similar Products Found</p>
                            <p className="text-sm font-medium text-gray-600">
                                Try lowering the confidence threshold or selecting more platforms
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-6 bg-red-500 border-4 border-black p-5 text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                            <p className="font-bold text-xl mb-2 uppercase tracking-wide">⚠️ Error</p>
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindSimilarProductsModal;
