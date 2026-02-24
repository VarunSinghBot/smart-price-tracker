# Smart Price Tracker - Backend API

Backend service for the Smart Price Tracker application, featuring automated web scraping with Playwright, price tracking, and alert notifications.

## Features

- 🔍 **Web Scraping with Playwright**: Automated product price scraping from multiple e-commerce platforms
- 📊 **Price Tracking**: Historical price data and trend analysis
- 🔔 **Price Alerts**: Automated notifications when prices drop below target
- 🔐 **Authentication**: JWT-based auth with Google OAuth support
- ⏰ **Scheduled Updates**: Automated price updates using cron jobs
- 🗃️ **PostgreSQL + Prisma**: Type-safe database operations

## Supported Platforms

- Amazon
- Flipkart
- eBay

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Web Scraping**: Playwright
- **Authentication**: JWT, Google OAuth
- **Validation**: Zod
- **Scheduling**: node-cron

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- Playwright browsers (installed automatically)

## Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Install Playwright browsers**:
   ```bash
   pnpm exec playwright install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/smart_price_tracker"
   JWT_SECRET="your-super-secret-jwt-key"
   CORS_ORIGIN="http://localhost:3000"
   NODE_ENV="development"
   ENABLE_SCHEDULER="true"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Run Prisma migrations**:
   ```bash
   pnpm exec prisma migrate dev
   ```

5. **Start the development server**:
   ```bash
   pnpm dev
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/google` - Google OAuth login

### Scraper

- `GET /api/v1/scraper/supported-platforms` - Get supported platforms (public)
- `POST /api/v1/scraper/scrape` - Scrape and track new product (auth required)
- `POST /api/v1/scraper/update/:productId` - Manually update product price (auth required)
- `POST /api/v1/scraper/bulk-update` - Bulk update products (auth required)

### Products

- `GET /api/v1/products` - Get all tracked products (auth required)
- `GET /api/v1/products/:productId` - Get product details (auth required)
- `GET /api/v1/products/:productId/price-history` - Get price history (auth required)
- `GET /api/v1/products/stats/by-platform` - Get product statistics (auth required)
- `DELETE /api/v1/products/:productId` - Delete product (auth required)

### Alerts

- `POST /api/v1/alerts` - Create price alert (auth required)
- `GET /api/v1/alerts` - Get all alerts (auth required)
- `PATCH /api/v1/alerts/:alertId` - Update alert (auth required)
- `DELETE /api/v1/alerts/:alertId` - Delete alert (auth required)
- `POST /api/v1/alerts/:alertId/deactivate` - Deactivate alert (auth required)

### System

- `GET /` - API information
- `GET /health` - Health check

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── scraper.controller.js
│   │   └── alert.controller.js
│   ├── services/              # Business logic
│   │   ├── scraper.service.js
│   │   ├── product.service.js
│   │   └── alert.service.js
│   ├── routes/                # Route definitions
│   │   ├── auth.route.js
│   │   ├── product.route.js
│   │   ├── scraper.route.js
│   │   └── alert.route.js
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── utils/                 # Utility functions
│   │   ├── scrapers/          # Web scraping utilities
│   │   │   ├── BaseScraper.js
│   │   │   ├── AmazonScraper.js
│   │   │   ├── FlipkartScraper.js
│   │   │   ├── EbayScraper.js
│   │   │   └── ScraperFactory.js
│   │   ├── logger.js
│   │   ├── scheduler.js
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── prisma.js
│   │   └── tokenGenerator.js
│   ├── app.js                 # Express app setup
│   ├── index.js               # Server entry point
│   └── constants.js
└── package.json
```

## Scraping Architecture

### Base Scraper

All platform-specific scrapers extend `BaseScraper` which provides:
- Browser automation with Playwright
- Anti-detection techniques (user agents, delays)
- Retry logic for failed requests
- Screenshot capability for debugging
- Common price extraction utilities

### Platform Scrapers

Each platform has a dedicated scraper:
- **AmazonScraper**: Handles Amazon product pages
- **FlipkartScraper**: Handles Flipkart product pages
- **EbayScraper**: Handles eBay product pages

### Scraper Factory

`ScraperFactory` automatically detects the platform from URL and returns the appropriate scraper.

## Automated Price Updates

The scheduler runs three types of updates:

1. **Frequent Updates** (Every 30 minutes): Updates 30 products
2. **Regular Updates** (Every 2 hours): Updates 100 products  
3. **Daily Updates** (Daily at 2 AM): Updates 500 products

Products are prioritized by last check time.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for JWT signing | - |
| `CORS_ORIGIN` | Allowed CORS origin | - |
| `NODE_ENV` | Environment (development/production) | development |
| `ENABLE_SCHEDULER` | Enable automated updates | true |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - |

## Development

### Running migrations

```bash
# Create new migration
pnpm exec prisma migrate dev --name migration_name

# Reset database
pnpm exec prisma migrate reset

# Generate Prisma client
pnpm exec prisma generate
```

### Prisma Studio

```bash
pnpm exec prisma studio
```

## Error Handling

All errors are handled centrally by the error middleware and return consistent JSON responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [],
  "stack": "..." // Only in development
}
```

## Validation

Request validation uses Zod schemas. Invalid requests return:

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Authors

- Varun Singh (2547254)
- Ananya M (2547259)
- Prajwal KT (2547239)
