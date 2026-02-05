import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

function Library() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const libraryItems = [
    {
      id: 1,
      title: "Price Tracking Guide",
      category: "Guides",
      description: "Learn how to effectively track prices and set up alerts for maximum savings.",
      icon: "📖",
      date: "2026-02-01",
      status: "New"
    },
    {
      id: 2,
      title: "Best Shopping Practices",
      category: "Tips",
      description: "Discover the best times to buy and how to identify genuine deals vs marketing tricks.",
      icon: "💡",
      date: "2026-01-28",
      status: null
    },
    {
      id: 3,
      title: "E-commerce Platform Comparison",
      category: "Research",
      description: "Comprehensive analysis of pricing strategies across major e-commerce platforms.",
      icon: "🔍",
      date: "2026-01-25",
      status: null
    },
    {
      id: 4,
      title: "Privacy & Data Policy",
      category: "Policy",
      description: "Understand how we protect your data and ensure your privacy while tracking prices.",
      icon: "🔒",
      date: "2026-01-20",
      status: null
    },
    {
      id: 5,
      title: "API Documentation",
      category: "Technical",
      description: "Complete API reference for developers who want to integrate price tracking.",
      icon: "⚙️",
      date: "2026-01-15",
      status: null
    },
    {
      id: 6,
      title: "Seasonal Shopping Calendar",
      category: "Tips",
      description: "Know when to buy what - a month-by-month guide to the best shopping periods.",
      icon: "📅",
      date: "2026-01-10",
      status: "Popular"
    },
    {
      id: 7,
      title: "Product Categories Explained",
      category: "Guides",
      description: "Understanding different product categories and their typical price patterns.",
      icon: "📦",
      date: "2026-01-05",
      status: null
    },
    {
      id: 8,
      title: "Coupon & Discount Codes",
      category: "Resources",
      description: "How to find and apply discount codes for additional savings on tracked products.",
      icon: "🎟️",
      date: "2025-12-28",
      status: "Popular"
    }
  ];

  const categories = ["All", "Guides", "Tips", "Research", "Policy", "Technical", "Resources"];

  const filteredItems = selectedCategory === "All" 
    ? libraryItems 
    : libraryItems.filter(item => item.category === selectedCategory);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Policy Library</h1>
        <p className="text-xl text-[#6B9B8E] font-semibold">
          Your knowledge hub for smart shopping and price tracking
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-4 border-black p-4 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-bold text-[#F4A460]">{libraryItems.length}</div>
          <div className="text-sm font-medium text-gray-600 mt-1">Total Articles</div>
        </div>
        <div className="bg-white border-4 border-black p-4 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-bold text-[#6B9B8E]">{categories.length - 1}</div>
          <div className="text-sm font-medium text-gray-600 mt-1">Categories</div>
        </div>
        <div className="bg-white border-4 border-black p-4 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-bold text-[#F4A460]">
            {libraryItems.filter(i => i.status === "New").length}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-1">New Items</div>
        </div>
        <div className="bg-white border-4 border-black p-4 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="text-3xl font-bold text-[#6B9B8E]">
            {libraryItems.filter(i => i.status === "Popular").length}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-1">Popular</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 bg-white border-4 border-black p-4 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
        <h3 className="font-bold text-gray-800 mb-3">Filter by Category:</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-2 ${
                selectedCategory === category
                  ? 'bg-[#F4A460] text-white border-black drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#6B9B8E]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Library Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border-4 border-black p-6 hover:bg-[#E8F4F1] transition-all cursor-pointer drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]"
          >
            {/* Icon & Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{item.icon}</div>
              {item.status && (
                <span className={`px-2 py-1 text-xs font-bold border-2 border-black ${
                  item.status === "New" 
                    ? "bg-[#F4A460] text-white" 
                    : "bg-[#6B9B8E] text-white"
                }`}>
                  {item.status}
                </span>
              )}
            </div>

            {/* Category */}
            <div className="inline-block px-2 py-1 bg-[#E8DCC4] border-2 border-black text-xs font-bold mb-3">
              {item.category}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{item.description}</p>

            {/* Date & Action */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
              <span className="text-xs text-gray-500 font-medium">{item.date}</span>
              <button className="px-3 py-1 bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors">
                Read →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white border-4 border-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No items found</h3>
          <p className="text-gray-600">Try selecting a different category</p>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Library;
