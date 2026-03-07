# Cross-Platform Product Matching Feature

## 🎯 Overview

This feature enables finding the **same product** across multiple e-commerce platforms by:
1. Extracting product details from a source URL
2. Searching for similar products on other platforms
3. Using image and text similarity matching to identify the same product
4. Returning matched products with confidence scores

## 🏗️ Architecture

```
Input URL (Amazon)
    ↓
[1] Scrape Source Product
    - Title, Image, Brand, Price
    ↓
[2] Extract Search Keywords
    - Brand + Model + Key specifications
    ↓
[3] Search on Target Platforms
    ├─→ Flipkart Search
    ├─→ eBay Search
    └─→ Other platforms
    ↓
[4] Collect Search Results
    - Top N results per platform
    ↓
[5] Match Products
    ├─→ Image Similarity (perceptual hash)
    └─→ Text Similarity (fuzzy match)
    ↓
[6] Filter & Rank
    - Confidence score > threshold
    - Sort by relevance
    ↓
Return Matched Products
```

## 📦 Required Dependencies

```bash
npm install sharp image-hash string-similarity natural leven
```

### Libraries Explained:
- **sharp**: Fast image processing
- **image-hash**: Perceptual image hashing for comparison
- **string-similarity**: Text similarity (Dice's coefficient)
- **natural**: NLP for keyword extraction
- **leven**: Levenshtein distance for string comparison

## 🧩 Implementation Components

### 1. **Image Comparison Utility** (`utils/imageComparison.js`)
- Downloads images from URLs
- Generates perceptual hashes
- Compares image similarity (0-100% match)
- Handles different image sizes/formats

### 2. **Text Similarity Utility** (`utils/textSimilarity.js`)
- Fuzzy string matching
- Keyword extraction
- Brand/model detection
- Title normalization

### 3. **Search Scrapers** (`utils/scrapers/*SearchScraper.js`)
- Platform-specific search page scrapers
- Extract product listings from search results
- Handle pagination
- Parse product cards

### 4. **Product Matcher Service** (`services/productMatcher.service.js`)
- Orchestrates the matching workflow
- Calculates confidence scores
- Filters and ranks results

### 5. **API Endpoint** (`/api/v1/scraper/find-similar`)
- Takes source product URL
- Returns matched products from all platforms

## 🔍 Matching Algorithm

### Confidence Score Calculation:
```
Confidence = (Image Similarity × 0.6) + (Text Similarity × 0.4)

Where:
- Image Similarity: 0-100 (perceptual hash comparison)
- Text Similarity: 0-100 (fuzzy string matching)
- Threshold: 70% (configurable)
```

### Matching Criteria:
✅ **High Match (85-100%)**: Very likely the same product  
⚠️ **Medium Match (70-84%)**: Probably the same product  
❌ **Low Match (<70%)**: Different product (filtered out)

## 🚀 API Usage

### Request:
```http
POST /api/v1/scraper/find-similar
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://www.amazon.in/dp/B08N5WRWNW",
  "platforms": ["Flipkart", "eBay"],  // optional
  "limit": 5,  // results per platform
  "minConfidence": 70  // minimum match confidence
}
```

### Response:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "sourceProduct": {
      "platform": "Amazon",
      "title": "Apple iPhone 13 (128GB) - Blue",
      "price": 59999,
      "imageUrl": "https://...",
      "url": "https://www.amazon.in/..."
    },
    "matches": [
      {
        "platform": "Flipkart",
        "title": "Apple iPhone 13 (Blue, 128 GB)",
        "price": 58999,
        "imageUrl": "https://...",
        "url": "https://www.flipkart.com/...",
        "confidence": 92.5,
        "matchDetails": {
          "imageScore": 95,
          "textScore": 88
        }
      },
      {
        "platform": "eBay",
        "title": "Apple iPhone 13 128GB Blue",
        "price": 60500,
        "imageUrl": "https://...",
        "url": "https://www.ebay.com/...",
        "confidence": 87.3,
        "matchDetails": {
          "imageScore": 90,
          "textScore": 82
        }
      }
    ],
    "totalMatches": 2,
    "platformsSearched": ["Flipkart", "eBay"],
    "searchDuration": "4.2s"
  },
  "message": "Found similar products across platforms"
}
```

## 🎨 Frontend Integration

### Add "Find Similar" Button to Product Card:
```jsx
<button 
  onClick={() => findSimilarProducts(product.url)}
  className="btn-secondary"
>
  🔍 Find on Other Sites
</button>
```

### Display Results in Modal:
- Side-by-side comparison
- Price difference highlighting
- Confidence badges
- Direct purchase links

## 🔧 Configuration

### Environment Variables:
```env
# Image Comparison
IMAGE_SIMILARITY_THRESHOLD=70
IMAGE_DOWNLOAD_TIMEOUT=10000

# Text Matching
TEXT_SIMILARITY_THRESHOLD=65
MATCH_CONFIDENCE_THRESHOLD=70

# Search Settings
MAX_SEARCH_RESULTS_PER_PLATFORM=5
SEARCH_TIMEOUT=30000
```

## ⚠️ Limitations & Considerations

### Current Limitations:
1. **Product Variants**: May not distinguish color/size variants
2. **Performance**: Image comparison is CPU-intensive
3. **Rate Limiting**: Frequent searches may trigger platform blocks
4. **Accuracy**: Not 100% guaranteed match

### Best Practices:
- Cache image hashes to avoid reprocessing
- Implement request throttling
- Use proxy rotation for heavy scraping
- Store search results in database

## 🧪 Testing

Test cases to implement:
- ✅ Same product, different platforms
- ✅ Similar but different products (iPhone 13 vs 13 Pro)
- ✅ Completely different products
- ✅ Missing images
- ✅ Platform unavailability
- ✅ Invalid URLs

## 📈 Future Enhancements

1. **Machine Learning**: Train model on product attributes
2. **Barcode/UPC Matching**: Use product identifiers
3. **Spec Comparison**: Match technical specifications
4. **User Feedback**: Improve matching with user corrections
5. **Batch Processing**: Match multiple products at once
6. **Real-time Updates**: WebSocket for live matching

## 🔐 Security

- Sanitize all URLs
- Rate limit API endpoint
- Validate image sources
- Prevent SSRF attacks
- Timeout long-running operations
