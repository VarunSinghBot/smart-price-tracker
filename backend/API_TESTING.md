# API Testing Examples

This document provides example requests for testing the Smart Price Tracker API.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

### Register New User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Response**: Save the `accessToken` for authenticated requests.

## Scraper Operations

### Get Supported Platforms

```bash
curl http://localhost:5000/api/v1/scraper/supported-platforms
```

### Scrape a Product (Amazon)

```bash
curl -X POST http://localhost:5000/api/v1/scraper/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://www.amazon.com/dp/B08N5WRWNW"
  }'
```

### Scrape a Product (Flipkart)

```bash
curl -X POST http://localhost:5000/api/v1/scraper/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://www.flipkart.com/product/p/itmxxxxxxxxxxxx"
  }'
```

### Scrape a Product (eBay)

```bash
curl -X POST http://localhost:5000/api/v1/scraper/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://www.ebay.com/itm/123456789012"
  }'
```

### Manually Update Product Price

```bash
curl -X POST http://localhost:5000/api/v1/scraper/update/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Product Management

### Get All Products

```bash
curl http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Products with Pagination

```bash
curl "http://localhost:5000/api/v1/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Filter Products by Platform

```bash
curl "http://localhost:5000/api/v1/products?platform=Amazon" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Product Details

```bash
curl http://localhost:5000/api/v1/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Price History

```bash
# Last 30 days (default)
curl http://localhost:5000/api/v1/products/PRODUCT_ID/price-history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Last 7 days
curl "http://localhost:5000/api/v1/products/PRODUCT_ID/price-history?days=7" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Product Statistics

```bash
curl http://localhost:5000/api/v1/products/stats/by-platform \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Delete Product

```bash
curl -X DELETE http://localhost:5000/api/v1/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Price Alerts

### Create Price Alert

```bash
curl -X POST http://localhost:5000/api/v1/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "targetPrice": 99.99
  }'
```

### Get All Alerts

```bash
# Active alerts only
curl http://localhost:5000/api/v1/alerts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# All alerts (including inactive)
curl "http://localhost:5000/api/v1/alerts?activeOnly=false" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Alert

```bash
curl -X PATCH http://localhost:5000/api/v1/alerts/ALERT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "targetPrice": 79.99
  }'
```

### Deactivate Alert

```bash
curl -X POST http://localhost:5000/api/v1/alerts/ALERT_ID/deactivate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Delete Alert

```bash
curl -X DELETE http://localhost:5000/api/v1/alerts/ALERT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## System Endpoints

### Health Check

```bash
curl http://localhost:5000/health
```

### API Info

```bash
curl http://localhost:5000/
```

## Complete Workflow Example

### 1. Register and Login

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }' | jq -r '.data.accessToken')
```

### 2. Track a Product

```bash
# Scrape Amazon product
PRODUCT=$(curl -X POST http://localhost:5000/api/v1/scraper/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "url": "https://www.amazon.com/dp/B08N5WRWNW"
  }')

PRODUCT_ID=$(echo $PRODUCT | jq -r '.data.id')
```

### 3. Set Price Alert

```bash
curl -X POST http://localhost:5000/api/v1/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"targetPrice\": 100.00
  }"
```

### 4. Check Product and Price History

```bash
# Get product details
curl http://localhost:5000/api/v1/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"

# Get price history
curl http://localhost:5000/api/v1/products/$PRODUCT_ID/price-history \
  -H "Authorization: Bearer $TOKEN"
```

## Using Postman

Import these as a Postman collection:

1. Create environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `token`: (set after login)

2. For authenticated requests, add header:
   - `Authorization`: `Bearer {{token}}`

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "url",
      "message": "Must be a valid URL"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "message": "Unauthorized request - No token provided"
}
```

### Not Found Error

```json
{
  "success": false,
  "message": "Product not found"
}
```

## Notes

- Replace `YOUR_ACCESS_TOKEN`, `PRODUCT_ID`, and `ALERT_ID` with actual values
- All authenticated endpoints require the `Authorization` header
- Scraping operations may take 5-15 seconds depending on the website
- Price updates happen automatically via scheduler (every 30 minutes, 2 hours, and daily)
