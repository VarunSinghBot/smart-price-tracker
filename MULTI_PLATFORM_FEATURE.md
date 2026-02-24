# Multi-Platform Price Comparison Feature

## Overview
This feature allows you to compare the same product across different e-commerce platforms (Amazon, Flipkart, eBay) to find the best price.

## How to Use

### Method 1: Single URL Mode (Default)
1. Paste a product URL from any supported platform into the search bar
2. Click "Search" or press Enter
3. View the scraped product details in the modal
4. Click "Track This Product" to add it to your tracker

### Method 2: Multi-Platform Comparison
1. Click the **"🔀 Compare Platforms"** button in the top search bar
2. The interface will switch to multi-platform mode showing 3 input fields:
   - Amazon URL
   - Flipkart URL
   - eBay URL
3. Paste the product URLs from each platform (you can use any combination)
4. Click **"Compare Prices"** button
5. View all products side-by-side in a grid layout with:
   - Platform badge (color-coded)
   - Product image
   - Product name
   - Current price
   - Original price (if available)
   - Discount percentage
   - Rating (if available)
   - Direct link to view on the platform

### Platform Color Codes
- **Amazon**: Orange badge
- **Flipkart**: Blue badge
- **eBay**: Yellow badge

## Backend API

### New Endpoint: `/api/v1/scraper/scrape-multi-platform`
**Method**: POST  
**Authentication**: Required (JWT)

#### Request Body:
```json
{
  "urls": [
    "https://www.amazon.in/product/...",
    "https://www.flipkart.com/product/...",
    "https://www.ebay.com/itm/..."
  ]
}
```

#### Response:
```json
{
  "statusCode": 200,
  "data": {
    "products": [
      {
        "platform": "Amazon",
        "name": "Product Name",
        "currentPrice": 25999,
        "originalPrice": 29999,
        "imageUrl": "https://...",
        "url": "https://www.amazon.in/...",
        "rating": 4.5,
        "brand": "Brand Name"
      },
      // ... more products
    ],
    "failed": [],
    "totalScraped": 3
  },
  "message": "Products scraped from multiple platforms",
  "success": true
}
```

## Features

### Frontend Updates
1. **Toggle Mode Button**: Switch between single URL and multi-platform modes
2. **Multi-Platform Input**: 3 separate inputs for Amazon, Flipkart, and eBay
3. **Grid Display**: Products shown in a responsive grid (1 column on mobile, 2 on tablet, 3 on desktop)
4. **Platform Badges**: Color-coded badges to identify each platform
5. **Direct Links**: "View on [Platform]" buttons to visit the product on that platform

### Backend Updates
1. **New Service Method**: `scrapeMultiplePlatforms()` in `ScraperService`
2. **Parallel Scraping**: All platforms are scraped simultaneously using `Promise.all()`
3. **Error Handling**: Failed scrapes don't block successful ones
4. **Validation**: Invalid URLs are filtered out before scraping

### Redux Updates
1. **New State**: `scrapedProducts` array for multi-platform results
2. **New Action**: `scrapeMultiPlatform` async thunk
3. **State Management**: Handles both single product and multiple products

## Technical Details

### File Changes
- **Backend**:
  - `backend/src/controllers/scraper.controller.js` - Added `scrapeMultiPlatform` controller
  - `backend/src/services/scraper.service.js` - Added `scrapeMultiplePlatforms()` method
  - `backend/src/routes/scraper.route.js` - Added route for multi-platform endpoint

- **Frontend**:
  - `frontend/src/store/scraperSlice.js` - Added `scrapeMultiPlatform` action and `scrapedProducts` state
  - `frontend/src/utils/scraperApi.js` - Added `scrapeMultiPlatform()` API method
  - `frontend/src/layouts/DashboardLayout.jsx` - Added UI for multi-platform mode and grid display

## Usage Example

### Compare iPhone Prices Across Platforms:
1. Click "🔀 Compare Platforms"
2. Paste:
   - Amazon: `https://www.amazon.in/Apple-iPhone-15-128-GB/dp/...`
   - Flipkart: `https://www.flipkart.com/apple-iphone-15-128-gb/p/...`
   - eBay: `https://www.ebay.com/itm/Apple-iPhone-15-128GB/...`
3. Click "Compare Prices"
4. See all three listings side-by-side with prices
5. Choose the best deal and click "View on [Platform]" to purchase

## Benefits
- **Price Discovery**: Find the best price across platforms instantly
- **Time Saving**: No need to manually check each platform
- **Visual Comparison**: Side-by-side comparison makes decision-making easier
- **Discount Awareness**: See which platform offers the best discount
- **Platform Flexibility**: Mix and match any combination of platforms

## Future Enhancements
- Auto-detect similar products across platforms using product name
- Add sorting options (price low-to-high, discount percentage, etc.)
- Track products from specific platforms separately
- Show shipping costs in comparison
- Add more platforms (Snapdeal, Myntra, etc.)
