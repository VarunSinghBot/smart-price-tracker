# Quick Setup Guide - Smart Price Tracker Backend

This guide will help you set up and run the backend with Playwright web scraping in under 5 minutes.

## Prerequisites

✅ Node.js 18+ and pnpm installed  
✅ PostgreSQL 14+ running  
✅ Basic knowledge of REST APIs

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

This will install all required packages including Playwright.

### 2. Install Playwright Browsers

```bash
pnpm exec playwright install
```

This downloads the necessary browser binaries (Chromium, Firefox, WebKit).

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/smart_price_tracker"
JWT_SECRET="your-super-secret-jwt-key-change-this"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
ENABLE_SCHEDULER="true"
```

**Important**: Replace `username`, `password`, and `JWT_SECRET` with your values.

### 4. Set Up Database

Create the database (if it doesn't exist):

```bash
# Using psql
createdb smart_price_tracker
```

Run Prisma migrations:

```bash
pnpm exec prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client
- Set up the schema

### 5. Start the Development Server

```bash
pnpm dev
```

You should see:

```
Server is running on http://localhost:5000
Starting automated price update scheduler...
Price scheduler started successfully
```

### 6. Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2026-02-23T...",
  "uptime": 5.123,
  "environment": "development"
}
```

## Quick Test - Track Your First Product

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Save the `accessToken` from the response.

### 3. Check Supported Platforms

```bash
curl http://localhost:5000/api/v1/scraper/supported-platforms
```

### 4. Track a Product

Replace `YOUR_TOKEN` with your access token:

```bash
# Example with Amazon
curl -X POST http://localhost:5000/api/v1/scraper/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://www.amazon.com/dp/B08N5WRWNW"
  }'
```

The API will:
1. Scrape the product page using Playwright
2. Extract product details and price
3. Save to database
4. Return the product data

### 5. View Your Products

```bash
curl http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Set a Price Alert

Replace `PRODUCT_ID` with the ID from step 4:

```bash
curl -X POST http://localhost:5000/api/v1/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "targetPrice": 99.99
  }'
```

## Project Features

### ✅ What You Just Set Up

- **Web Scraping**: Playwright-based scrapers for Amazon, Flipkart, eBay
- **Price Tracking**: Automatic price history recording
- **Alerts**: Price drop notifications
- **Scheduler**: Automated updates (every 30 min, 2 hours, daily)
- **REST API**: Complete CRUD operations
- **Authentication**: JWT + Google OAuth
- **Database**: PostgreSQL with Prisma ORM

### 🔄 Automated Updates

The scheduler automatically:
- Updates 30 products every 30 minutes
- Updates 100 products every 2 hours
- Updates 500 products daily at 2 AM

To disable, set `ENABLE_SCHEDULER=false` in `.env`.

## Common Issues & Solutions

### Issue: Playwright browsers not installed

**Solution**:
```bash
pnpm exec playwright install
```

### Issue: Database connection failed

**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify `DATABASE_URL` in `.env`
3. Test connection: `psql $DATABASE_URL`

### Issue: Migration failed

**Solution**:
```bash
# Reset database
pnpm exec prisma migrate reset

# Rerun migrations
pnpm exec prisma migrate dev
```

### Issue: Port already in use

**Solution**: Change `PORT` in `.env` or kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

### Issue: Scraping fails for specific site

**Solution**:
- Check if the site has changed its HTML structure
- The selectors in platform scrapers may need updating
- Some sites have anti-scraping measures
- Enable screenshots for debugging: See scraper logs

## Development Tools

### Prisma Studio

Visual database browser:

```bash
pnpm exec prisma studio
```

Opens at `http://localhost:5555`

### View Logs

Logs include scraping operations, price updates, alerts:

```bash
pnpm dev
```

All logs are formatted with timestamps and context.

## Next Steps

1. ✅ Test all API endpoints (see [API_TESTING.md](./API_TESTING.md))
2. ✅ Set up Google OAuth (optional)
3. ✅ Add more platform scrapers
4. ✅ Integrate with frontend
5. ✅ Deploy to production

## API Documentation

- Full endpoint list: [README.md](./README.md)
- Testing examples: [API_TESTING.md](./API_TESTING.md)
- Database schema: [DATABASE_DESIGN.md](../DATABASE_DESIGN.md)

## Production Deployment

Before deploying:

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use a production PostgreSQL instance
6. Consider rate limiting
7. Set up proper logging/monitoring

## Support

For issues or questions:
- Check existing documentation
- Review error logs
- Test individual components
- Verify environment configuration

---

**Ready to build?** Start tracking prices and building your frontend! 🚀
