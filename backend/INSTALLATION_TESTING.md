# Installation & Testing Guide - Cross-Platform Product Matching

## 🚀 Quick Start

### 1. Install Dependencies

Navigate to the backend directory and install the new packages:

```bash
cd backend
npm install sharp image-hash string-similarity natural leven axios
```

### 2. Verify Installation

Check that all packages are installed:

```bash
npm list sharp image-hash string-similarity natural leven
```

Expected output:
```
backend@1.0.0
├── axios@1.7.9
├── image-hash@5.4.0
├── leven@4.0.0
├── natural@8.1.1
├── sharp@0.33.5
└── string-similarity@4.0.4
```

### 3. Restart the Server

```bash
npm run dev
```

## 🧪 Testing the Feature

### Test 1: Find Similar Products (Basic)

```bash
curl -X POST http://localhost:4000/api/v1/scraper/find-similar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://www.amazon.in/dp/B0CX23V2ZK"
  }'
```

### Test 2: Find Similar Products (With Options)

```bash
curl -X POST http://localhost:4000/api/v1/scraper/find-similar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://www.flipkart.com/product/xyz",
    "platforms": ["Amazon", "eBay"],
    "limit": 5,
    "minConfidence": 75
  }'
```

### Test 3: Get Supported Platforms

```bash
curl http://localhost:4000/api/v1/scraper/supported-platforms-search
```

Expected response:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "platforms": [
      {
        "name": "Amazon",
        "key": "amazon",
        "baseUrl": "https://www.amazon.in",
        "searchSupported": true
      },
      {
        "name": "Flipkart",
        "key": "flipkart",
        "baseUrl": "https://www.flipkart.com",
        "searchSupported": true
      },
      {
        "name": "eBay",
        "key": "ebay",
        "baseUrl": "https://www.ebay.com",
        "searchSupported": true
      }
    ]
  },
  "message": "Platforms with search support"
}
```

## 📊 Understanding the Response

### Successful Match Response

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
        "matchQuality": "high",
        "imageSimilarity": 95,
        "textSimilarity": 88,
        "brandMatch": true
      }
    ],
    "matchesByPlatform": {
      "flipkart": [...],
      "ebay": [...]
    },
    "searchQuery": "apple iphone 13 128gb blue",
    "platformsSearched": ["Flipkart", "eBay"],
    "totalMatches": 2,
    "searchDuration": "4.2s"
  },
  "message": "Found 2 similar products across 2 platforms"
}
```

### Match Quality Levels

- **high** (85-100%): Very likely the same product
- **medium** (70-84%): Probably the same product
- **low** (<70%): Different product (filtered out)

## 🔍 Testing Different Scenarios

### Scenario 1: Popular Product (iPhone)

```bash
# Should find multiple matches across platforms
curl -X POST http://localhost:4000/api/v1/scraper/find-similar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY"
  }'
```

### Scenario 2: Specific Product (Laptop)

```bash
# Dell Laptop - specific model
curl -X POST http://localhost:4000/api/v1/scraper/find-similar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://www.flipkart.com/dell-inspiron-core-i5-laptop/p/itm..."
  }'
```

### Scenario 3: Generic Product (Headphones)

```bash
# Wireless headphones - may have variations
curl -X POST http://localhost:4000/api/v1/scraper/find-similar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://www.amazon.in/boAt-Airdopes-131-Headset/dp/B...",
    "minConfidence": 80
  }'
```

## 🐛 Troubleshooting

### Issue: "Module not found" Error

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Sharp Installation Fails

**Windows:**
```bash
npm install --platform=win32 --arch=x64 sharp
```

**Linux:**
```bash
sudo apt-get install libvips-dev
npm install sharp
```

**macOS:**
```bash
brew install vips
npm install sharp
```

### Issue: Image Download Timeouts

**Solution:** Increase timeout in `.env`:
```env
IMAGE_DOWNLOAD_TIMEOUT=15000
```

### Issue: Low Match Confidence

**Possible causes:**
1. Product images are very different (different angles)
2. Product titles are too generic
3. Color/size variants being compared

**Solution:** Lower confidence threshold:
```json
{
  "url": "...",
  "minConfidence": 65
}
```

## 📈 Performance Benchmarks

Expected performance on typical hardware:

| Operation | Time | Notes |
|-----------|------|-------|
| Image Download | 0.5-2s | Per image |
| Image Hashing | 0.1-0.3s | Per image |
| Text Similarity | <0.01s | Per comparison |
| Search Scraping | 2-5s | Per platform |
| **Total (3 platforms)** | **8-15s** | End-to-end |

## 🔐 Security Notes

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Image Source**: Only download images from trusted platforms
3. **SSRF Protection**: URL validation is built-in
4. **Timeout Protection**: All operations have timeouts

## 📝 Logging

Check logs for detailed execution:

```bash
# View logs in real-time
tail -f logs/app.log

# Search for match operations
grep "ProductMatcher" logs/app.log

# Check image comparison logs
grep "ImageComparison" logs/app.log
```

## 🎯 Next Steps

1. **Test with real products** from your database
2. **Adjust confidence thresholds** based on results
3. **Monitor performance** and optimize if needed
4. **Add frontend UI** for "Find Similar" button
5. **Cache image hashes** to improve speed
6. **Implement request queuing** for bulk operations

## 💡 Tips

1. **Start with popular products** (iPhone, Samsung, etc.) for reliable matches
2. **Lower confidence for generic items** (cables, accessories)
3. **Higher confidence for specific models** (laptops, phones)
4. **Test different platforms** as source to ensure consistency
5. **Monitor API rate limits** on target platforms

## 📚 Additional Resources

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Perceptual Hashing](https://en.wikipedia.org/wiki/Perceptual_hashing)
- [Image Similarity Algorithms](https://pyimagesearch.com/2014/09/15/python-compare-two-images/)
- [Fuzzy String Matching](https://www.datacamp.com/tutorial/fuzzy-string-python)
