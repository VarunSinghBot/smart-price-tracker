import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPriceHistory } from '../../store/productSlice';

function PriceHistoryChart({ productId, days = 30 }) {
    const dispatch = useDispatch();
    const priceHistory = useSelector((state) => state.products.priceHistory[productId] || []);
    const [chartDimensions, setChartDimensions] = useState({ width: 600, height: 300 });

    useEffect(() => {
        if (productId) {
            dispatch(fetchPriceHistory({ productId, days }));
        }
    }, [dispatch, productId, days]);

    if (!priceHistory || priceHistory.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">No price history available yet</p>
                <p className="text-sm text-gray-400 mt-1">Price data will appear after the first update</p>
            </div>
        );
    }

    // Calculate chart parameters
    const prices = priceHistory.map(h => h.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = chartDimensions.width - padding.left - padding.right;
    const chartHeight = chartDimensions.height - padding.top - padding.bottom;

    // Create SVG path for line chart
    const createPath = () => {
        if (priceHistory.length === 0) return '';

        const points = priceHistory.map((item, index) => {
            const x = (index / (priceHistory.length - 1 || 1)) * chartWidth;
            const y = chartHeight - ((item.price - minPrice) / priceRange) * chartHeight;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    // Create area path for gradient fill
    const createAreaPath = () => {
        if (priceHistory.length === 0) return '';

        const linePath = createPath();
        return `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Calculate price change
    const priceChange = priceHistory.length >= 2
        ? ((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) / priceHistory[0].price) * 100
        : 0;

    return (
        <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold">Price History</h3>
                    <p className="text-sm text-gray-500">Last {days} days</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">
                        ₹{priceHistory[priceHistory.length - 1]?.price.toLocaleString()}
                    </div>
                    <div className={`text-sm ${priceChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="relative">
                <svg
                    width={chartDimensions.width}
                    height={chartDimensions.height}
                    className="overflow-visible"
                >
                    <defs>
                        <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <g transform={`translate(${padding.left}, ${padding.top})`}>
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => {
                            const y = (i / 4) * chartHeight;
                            const price = maxPrice - (i / 4) * priceRange;
                            return (
                                <g key={i}>
                                    <line
                                        x1="0"
                                        y1={y}
                                        x2={chartWidth}
                                        y2={y}
                                        stroke="#E5E7EB"
                                        strokeDasharray="4 4"
                                    />
                                    <text
                                        x="-10"
                                        y={y + 4}
                                        textAnchor="end"
                                        fontSize="12"
                                        fill="#6B7280"
                                    >
                                        ₹{price.toFixed(0)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Area fill */}
                        <path
                            d={createAreaPath()}
                            fill="url(#priceGradient)"
                        />

                        {/* Line */}
                        <path
                            d={createPath()}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Points */}
                        {priceHistory.map((item, index) => {
                            const x = (index / (priceHistory.length - 1 || 1)) * chartWidth;
                            const y = chartHeight - ((item.price - minPrice) / priceRange) * chartHeight;
                            return (
                                <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#3B82F6"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="cursor-pointer hover:r-6 transition-all"
                                >
                                    <title>{`${formatDate(item.scrapedAt)}: ₹${item.price.toLocaleString()}`}</title>
                                </circle>
                            );
                        })}

                        {/* X-axis labels */}
                        {priceHistory.length > 0 && (
                            <>
                                <text
                                    x="0"
                                    y={chartHeight + 25}
                                    fontSize="12"
                                    fill="#6B7280"
                                    textAnchor="start"
                                >
                                    {formatDate(priceHistory[0].scrapedAt)}
                                </text>
                                <text
                                    x={chartWidth}
                                    y={chartHeight + 25}
                                    fontSize="12"
                                    fill="#6B7280"
                                    textAnchor="end"
                                >
                                    {formatDate(priceHistory[priceHistory.length - 1].scrapedAt)}
                                </text>
                            </>
                        )}
                    </g>
                </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Highest</p>
                    <p className="text-lg font-semibold text-red-600">₹{maxPrice.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Lowest</p>
                    <p className="text-lg font-semibold text-green-600">₹{minPrice.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="text-lg font-semibold text-blue-600">
                        ₹{(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0)}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PriceHistoryChart;
