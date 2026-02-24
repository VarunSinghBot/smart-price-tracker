# Cross-Platform Product Search Feature

## Overview
This feature allows users to paste a product URL from one platform (e.g., Amazon) and automatically find similar products on other platforms (Flipkart, eBay, etc.).

## Current Implementation Status

### ✅ Completed
- UI components in AddProductModal with "Find on Flipkart, eBay & more" button
- Frontend state management for search status
- Placeholder functionality showing feature concept

### 🚧 To Be Implemented

#### Backend (Required)
1. **Search URL Construction**
   - Create search URL builders for each platform:
     - Amazon: `https://www.amazon.in/s?k={productName}`
     - Flipkart: `https://www.flipkart.com/search?q={productName}`
     - eBay: `https://www.ebay.com/sch/i.html?_nkw={productName}`
   
2. **New API Endpoint**: `/api/v1/scraper/search-cross-platform`
   ```javascript
   POST /api/v1/scraper/search-cross-platform
   Body: {
     "url": "original product URL",
     "platforms": ["amazon", "flipkart", "ebay"] // optional
   }
   
   Response: {
     "mainProduct": { /* scraped product */ },
     "similarProducts": [
       { "platform": "flipkart", /* product data */ },
       { "platform": "ebay", /* product data */ }
     ]
   }
   ```

3. **Search Result Scraping**
   - Each platform scraper needs a `searchProducts(query)` method
   - Extract top 1-3 results per platform
   - Match products by similar titles/specifications

4. **Implementation Steps**
   ```javascript
   // In scraper.service.js
   async searchCrossPlatform(url) {
     // 1. Scrape main product
     const mainProduct = await this.scrapeProductData(url);
     
     // 2. Extract search query from product title
     const searchQuery = this.cleanProductTitle(mainProduct.title);
     
     // 3. Search on other platforms
     const platforms = ['amazon', 'flipkart', 'ebay'];
     const results = await Promise.allSettled(
       platforms.map(platform => this.searchOnPlatform(platform, searchQuery))
     );
     
     // 4. Return combined results
     return {
       mainProduct,
       similarProducts: results
         .filter(r => r.status === 'fulfilled')
         .map(r => r.value)
         .flat()
     };
   }
   ```

#### Frontend (To Update)
1. **New Redux Action** in `scraperSlice.js`:
   ```javascript
   export const searchCrossPlatform = createAsyncThunk(
     'scraper/searchCrossPlatform',
     async (url, { rejectWithValue }) => {
       try {
         const response = await scraperApi.searchCrossPlatform(url);
         return response.data;
       } catch (error) {
         return rejectWithValue(error.response?.data?.message);
       }
     }
   );
   ```

2. **Update AddProductModal.jsx**:
   - Replace placeholder `handleSearchSimilar` with actual API call
   - Update detectedProducts to show all results
   - Add filtering/sorting options

3. **API Method** in `scraperApi.js`:
   ```javascript
   export const searchCrossPlatform = async (url) => {
     return api.post('/scraper/search-cross-platform', { url });
   };
   ```

## Usage Flow
1. User pastes Amazon URL
2. System scrapes Amazon product (✅ Working)
3. User clicks "Find on Flipkart, eBay & more" (✅ UI Ready)
4. Backend searches other platforms (❌ Not implemented)
5. UI displays all found products (✅ UI Ready)
6. User can compare prices and choose which to track

## Challenges
- **Product Matching**: Ensuring products found on different platforms are actually the same item
- **Rate Limiting**: Multiple platform requests may trigger anti-scraping measures
- **Search Accuracy**: Platform search results may not always return the exact product
- **Performance**: Searching multiple platforms takes time

## Recommendations
1. Implement asynchronously - show main product immediately, then stream in results from other platforms
2. Cache search results to avoid repeated scraping
3. Add user feedback for mismatched products
4. Consider using platform APIs instead of scraping for better reliability

## Testing
Once implemented, test with:
- Different product categories
- Products with special characters in names
- Products available on some platforms but not others
- Products with different pricing across platforms
