# Backend Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Frontend)                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTP/HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXPRESS.JS SERVER                             │
│                         (app.js / index.js)                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     MIDDLEWARES         │
                    ├─────────────────────────┤
                    │ • CORS                  │
                    │ • JSON Parser           │
                    │ • Cookie Parser         │
                    │ • Auth (JWT)            │
                    │ • Validation (Zod)      │
                    │ • Error Handler         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────────────────────────┐
                    │              ROUTES                         │
                    ├─────────────────────────────────────────────┤
                    │  /api/v1/auth      (Authentication)         │
                    │  /api/v1/products  (Product Management)     │
                    │  /api/v1/scraper   (Web Scraping)           │
                    │  /api/v1/alerts    (Price Alerts)           │
                    └────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────────────────────────┐
                    │           CONTROLLERS                       │
                    ├─────────────────────────────────────────────┤
                    │ • auth.controller.js                        │
                    │ • product.controller.js                     │
                    │ • scraper.controller.js                     │
                    │ • alert.controller.js                       │
                    └────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────────────────────────┐
                    │            SERVICES                         │
                    ├─────────────────────────────────────────────┤
                    │ • product.service.js                        │
                    │ • scraper.service.js                        │
                    │ • alert.service.js                          │
                    └─────┬──────────────────────┬────────────────┘
                          │                      │
         ┌────────────────┴────────┐   ┌────────┴──────────────┐
         │   SCRAPING ENGINE       │   │   DATABASE LAYER      │
         │   (Playwright)          │   │   (Prisma ORM)        │
         ├─────────────────────────┤   ├───────────────────────┤
         │ ScraperFactory          │   │ User Model            │
         │ ├─ AmazonScraper        │   │ Product Model         │
         │ ├─ FlipkartScraper      │   │ PriceHistory Model    │
         │ └─ EbayScraper          │   │ Alert Model           │
         │                         │   │                       │
         │ BaseScraper             │   │                       │
         │ ├─ Browser Init         │   │                       │
         │ ├─ Page Navigation      │   │                       │
         │ ├─ Element Extraction   │   │                       │
         │ ├─ Price Parsing        │   │                       │
         │ └─ Screenshot Debug     │   │                       │
         └──────────┬──────────────┘   └───────────┬───────────┘
                    │                              │
         ┌──────────┴──────────────┐   ┌───────────┴────────────┐
         │   E-COMMERCE SITES      │   │    PostgreSQL          │
         ├─────────────────────────┤   │    DATABASE            │
         │ • Amazon                │   │                        │
         │ • Flipkart              │   │  Tables:               │
         │ • eBay                  │   │  ├─ users              │
         │ • (More platforms...)   │   │  ├─ products           │
         └─────────────────────────┘   │  ├─ price_history      │
                                       │  └─ alerts             │
                                       └────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    AUTOMATED SCHEDULER                               │
│                      (node-cron)                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Every 30 min  → Update 30 products                                 │
│  Every 2 hours → Update 100 products                                │
│  Daily 2 AM    → Update 500 products                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. POST /api/v1/scraper/scrape
     │    { url: "https://amazon.com/..." }
     ▼
┌─────────────────┐
│   Express App   │
└────┬────────────┘
     │ 2. Middleware Chain
     ▼
┌──────────────────┐
│  Auth Middleware │  → Verify JWT Token
└────┬─────────────┘
     │ 3. req.user = { id, email, ... }
     ▼
┌────────────────────┐
│ Validation Middleware │ → Validate URL format
└────┬───────────────────┘
     │ 4. URL validated
     ▼
┌───────────────────────┐
│ scraper.controller.js │
└────┬──────────────────┘
     │ 5. Call scrapeProduct()
     ▼
┌───────────────────────┐
│ scraper.service.js    │
└────┬──────────────────┘
     │ 6. ScraperFactory.scrapeProduct(url)
     ▼
┌────────────────────────┐
│  ScraperFactory        │ → Detect platform (Amazon/Flipkart/eBay)
└────┬───────────────────┘
     │ 7. Return AmazonScraper instance
     ▼
┌────────────────────────┐
│   AmazonScraper        │
└────┬───────────────────┘
     │ 8. Launch Playwright browser
     ▼
┌────────────────────────┐
│   Chromium Browser     │
└────┬───────────────────┘
     │ 9. Navigate to product page
     │ 10. Extract: title, price, image, stock
     ▼
┌────────────────────────┐
│   AmazonScraper        │ → Return product data
└────┬───────────────────┘
     │ 11. Product data object
     ▼
┌───────────────────────┐
│ scraper.service.js    │
└────┬──────────────────┘
     │ 12. Save to database via Prisma
     ▼
┌────────────────────────┐
│   Prisma Client        │
└────┬───────────────────┘
     │ 13. INSERT into products table
     │ 14. INSERT into price_history table
     ▼
┌────────────────────────┐
│   PostgreSQL           │
└────┬───────────────────┘
     │ 15. Return saved product
     ▼
┌────────────────────────┐
│ scraper.controller.js  │ → Format response
└────┬───────────────────┘
     │ 16. ApiResponse(201, product, "Success")
     ▼
┌──────────┐
│  Client  │ ← 200 OK with product data
└──────────┘
```

## Data Flow - Price Update

```
┌─────────────────┐
│   Scheduler     │ (Cron: Every 30 min)
└────┬────────────┘
     │ 1. Trigger bulkUpdateProducts(30)
     ▼
┌─────────────────────┐
│ scraper.service.js  │
└────┬────────────────┘
     │ 2. Query: SELECT 30 products
     │    WHERE lastChecked < 1 hour ago
     │    ORDER BY lastChecked ASC
     ▼
┌─────────────────────┐
│   Prisma/Database   │ → [product1, product2, ...]
└────┬────────────────┘
     │ 3. For each product:
     ▼
     ┌─────────────────────────────┐
     │  Update Loop                │
     │  ┌──────────────────────┐   │
     │  │ 1. Scrape URL        │   │
     │  │ 2. Get current price │   │
     │  │ 3. Compare old price │   │
     │  └────────┬─────────────┘   │
     │           │                 │
     │           ▼                 │
     │  ┌──────────────────────┐   │
     │  │ Price Changed?       │   │
     │  └────────┬─────────────┘   │
     │           │ YES             │
     │           ▼                 │
     │  ┌──────────────────────┐   │
     │  │ Save to price_history│   │
     │  └────────┬─────────────┘   │
     │           │                 │
     │           ▼                 │
     │  ┌──────────────────────┐   │
     │  │ Check Alerts         │   │
     │  │ (targetPrice >= cur) │   │
     │  └────────┬─────────────┘   │
     │           │                 │
     │           ▼                 │
     │  ┌──────────────────────┐   │
     │  │ Trigger Alert        │   │
     │  │ (Mark as notified)   │   │
     │  └──────────────────────┘   │
     └─────────────────────────────┘
```

## Module Dependencies

```
app.js
├── routes/
│   ├── auth.route.js
│   ├── product.route.js
│   │   └── controllers/product.controller.js
│   │       └── services/product.service.js
│   │           └── utils/prisma.js
│   ├── scraper.route.js
│   │   └── controllers/scraper.controller.js
│   │       └── services/scraper.service.js
│   │           ├── utils/scrapers/ScraperFactory.js
│   │           │   ├── AmazonScraper.js → BaseScraper.js
│   │           │   ├── FlipkartScraper.js → BaseScraper.js
│   │           │   └── EbayScraper.js → BaseScraper.js
│   │           └── utils/prisma.js
│   └── alert.route.js
│       └── controllers/alert.controller.js
│           └── services/alert.service.js
│               └── utils/prisma.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── error.middleware.js
└── utils/
    ├── logger.js
    ├── scheduler.js
    ├── ApiError.js
    ├── ApiResponse.js
    └── asyncHandler.js
```

## Technology Stack Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  ─────────────────────────────────  │
│  Express Routes & Controllers       │
│  REST API Endpoints                 │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│         Business Logic Layer        │
│  ─────────────────────────────────  │
│  Services (Product, Scraper, Alert) │
│  Validation & Authorization         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│        Data Access Layer            │
│  ─────────────────────────────────  │
│  Prisma ORM                         │
│  Database Queries                   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│         Data Storage Layer          │
│  ─────────────────────────────────  │
│  PostgreSQL Database                │
│  Tables: User, Product, Price, Alert│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      External Integration Layer     │
│  ─────────────────────────────────  │
│  Playwright Web Scraping            │
│  E-commerce Platforms               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Automation Layer            │
│  ─────────────────────────────────  │
│  node-cron Scheduler                │
│  Automated Price Updates            │
└─────────────────────────────────────┘
```

## Security Architecture

```
┌────────────────────────────────────────┐
│          CLIENT REQUEST                │
└──────────────┬─────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   CORS Middleware    │ → Validate origin
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │   Auth Middleware    │ → Verify JWT token
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Validation Middleware│ → Validate input (Zod)
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │    Controller        │ → Business logic
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Prisma (Params)     │ → SQL injection safe
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │    PostgreSQL        │
    └──────────────────────┘
```

## Scraping Flow Detail

```
                    ┌───────────────┐
                    │  Scrape Job   │
                    └───────┬───────┘
                            │
                    ┌───────▼───────────┐
                    │ Launch Browser    │
                    │ (Headless Chrome) │
                    └───────┬───────────┘
                            │
                    ┌───────▼───────────┐
                    │ Set User Agent    │
                    │ Set Viewport      │
                    └───────┬───────────┘
                            │
                    ┌───────▼───────────┐
                    │ Navigate to URL   │
                    │ (with retries)    │
                    └───────┬───────────┘
                            │
                    ┌───────▼───────────┐
                    │ Wait for Selector │
                    │ (product loaded)  │
                    └───────┬───────────┘
                            │
                    ┌───────▼───────────┐
                    │  Random Delay     │
                    │  (human-like)     │
                    └───────┬───────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌──────▼─────┐    ┌──────▼──────┐
    │ Extract │      │  Extract   │    │   Extract   │
    │  Title  │      │   Price    │    │    Image    │
    └────┬────┘      └──────┬─────┘    └──────┬──────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                    ┌───────▼───────────┐
                    │ Extract Metadata  │
                    │ (rating, reviews) │
                    └───────┬───────────┘
                            │
                    ┌───────▼───────────┐
                    │  Close Browser    │
                    └───────┬───────────┘
                            │
                    ┌───────▼───────────┐
                    │  Return Data      │
                    └───────────────────┘
```

## Database Schema Relationships

```
┌─────────────────────┐
│       User          │
│ ─────────────────── │
│ id (PK)             │
│ email               │
│ password            │
│ googleId            │
└──────┬──────────────┘
       │ 1
       │
       │ has many
       │
       │ N
   ┌───▼──────────────────┐        ┌────────────────────┐
   │     Product          │        │    Alert           │
   │ ──────────────────── │        │ ────────────────── │
   │ id (PK)              │◄───┐   │ id (PK)            │
   │ url                  │    │   │ targetPrice        │
   │ title                │    │   │ active             │
   │ platform             │    │   │ notified           │
   │ currentPrice         │    │   │ userId (FK)        │
   │ imageUrl             │    └───┤ productId (FK)     │
   │ inStock              │        │ createdAt          │
   │ userId (FK)          │        └────────────────────┘
   │ lastChecked          │
   │ createdAt            │
   └──────┬───────────────┘
          │ 1
          │
          │ has many
          │
          │ N
   ┌──────▼───────────────┐
   │   PriceHistory       │
   │ ──────────────────── │
   │ id (PK)              │
   │ price                │
   │ inStock              │
   │ productId (FK)       │
   │ scrapedAt            │
   └──────────────────────┘
```

This architecture provides a scalable, maintainable, and secure foundation for the Smart Price Tracker backend!
