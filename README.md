# Smart Price Tracker 🏷️

A comprehensive web application for tracking product prices across multiple e-commerce platforms, helping users make informed purchasing decisions and never miss a deal.

## 📋 Table of Contents

- [Overview](#overview)
- [Supported Platforms](#supported-platforms)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Web Scraping & Automation](#web-scraping--automation)
- [Security Features](#security-features)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)

## 🎯 Overview

Smart Price Tracker is a full-stack web application that enables users to:
- Monitor product prices in real-time across Amazon, eBay, Walmart, and more
- Track price history and trends
- Set price alerts and receive notifications
- Compare prices across different retailers
- Make data-driven purchasing decisions

## 🛒 Supported Platforms

Currently supporting automated price tracking from:
- **Amazon** - World's largest online retailer
- **Flipkart** - India's leading e-commerce platform
- **eBay** - Global marketplace for new and used items

*More platforms coming soon!*

## ✨ Features

### Current Features (Phase 1 & 2 - Implemented)
- ✅ User authentication (Email/Password + Google OAuth)
- ✅ Secure JWT token-based sessions
- ✅ Responsive landing page
- ✅ Protected routes and user dashboard
- ✅ Toast notification system
- ✅ Modern, accessible UI with Tailwind CSS
- ✅ **Web scraping with Playwright** - Automated price extraction
- ✅ **Multi-platform support** - Amazon, Flipkart, and eBay
- ✅ **Product price tracking** - Real-time price monitoring
- ✅ **Price history** - Historical price data and trend analysis
- ✅ **Price alerts** - Automated notifications when prices drop below target
- ✅ **Automated updates** - Scheduled price updates using cron jobs
- ✅ **Bulk operations** - Update multiple products efficiently

### Planned Features (Phase 3)
- 🔄 Price history visualization with charts
- 🔄 Advanced price comparison dashboard
- 🔄 Email notifications for price drops
- 🔄 Push notifications
- 🔄 More platform support (Walmart, Best Buy, etc.)

### Future Enhancements (Phase 4+)
- 📱 Mobile application
- 🧩 Browser extension
- 📊 Advanced analytics and insights
- 🤝 Wishlist sharing
- 💼 Premium subscription features

## 🛠️ Technology Stack

### Frontend
- **React** 19.2.0 - UI framework
- **React Router DOM** 7.12.0 - Client-side routing
- **Redux Toolkit** 2.11.2 - State management
- **Tailwind CSS** 4.1.18 - Styling
- **Vite** 7.2.4 - Build tool
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** 5.2.1 - Web framework
- **Prisma** 7.2.0 - ORM and database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Google OAuth** - Third-party authentication
- **Zod** - Schema validation
- **Playwright** - Web scraping and browser automation
- **node-cron** - Scheduled tasks for automated price updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database (or use Neon/Supabase)
- Google OAuth credentials (optional, for OAuth login)
- Playwright browsers (installed automatically with backend setup)

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/smart-price-tracker.git
cd smart-price-tracker
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Install Playwright browsers for web scraping
npx playwright install

# Create .env file from example
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL
# - JWT secrets
# - Google OAuth credentials (optional)
# - CORS origin
# - ENABLE_SCHEDULER (for automated updates)

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

Backend will run on `http://localhost:4000`

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your .env file with:
# - VITE_API_URL=http://localhost:4000
# - VITE_GOOGLE_CLIENT_ID (optional)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Environment Variables

#### Backend `.env`
```env
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://user:password@localhost:5432/price_tracker

CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/auth/google/callback

FRONTEND_URL=http://localhost:5173

# Enable automated price updates
ENABLE_SCHEDULER=true
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📚 Documentation

For detailed technical documentation, please refer to:
- **[Software Design Document (SDD)](./SDD/Smart-Price-Tracker-SDD.md)** - Complete system architecture and design

The SDD includes:
- System architecture diagrams
- Database schema and ERD
- API endpoint documentation
- Security design
- Deployment architecture
- Testing strategy
- Future roadmap

## 📁 Project Structure

```
smart-price-tracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── scraper.controller.js
│   │   │   └── alert.controller.js
│   │   ├── services/              # Business logic
│   │   │   ├── scraper.service.js
│   │   │   ├── product.service.js
│   │   │   └── alert.service.js
│   │   ├── routes/                # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── product.route.js
│   │   │   ├── scraper.route.js
│   │   │   └── alert.route.js
│   │   ├── middlewares/           # Express middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── utils/                 # Utility functions
│   │   │   ├── scrapers/          # Web scraping utilities
│   │   │   │   ├── BaseScraper.js
│   │   │   │   ├── AmazonScraper.js
│   │   │   │   ├── FlipkartScraper.js
│   │   │   │   ├── EbayScraper.js
│   │   │   │   └── ScraperFactory.js
│   │   │   ├── logger.js
│   │   │   ├── scheduler.js       # Automated price updates
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── prisma.js
│   │   ├── app.js                 # Express app config
│   │   ├── index.js               # Server entry point
│   │   └── constants.js
│   ├── .env.example               # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── auth/              # Authentication components
│   │   │   └── ui/                # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   ├── layouts/               # Layout components
│   │   ├── utils/                 # Utility functions
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   ├── public/                    # Static assets
│   ├── .env.example               # Environment template
│   └── package.json
│
├── SDD/
│   ├── Smart-Price-Tracker-SDD.md # Software Design Document
│   └── SDD-ref.pdf                # Reference document
│
└── README.md                      # This file
```

## 🔐 Authentication

The application supports two authentication methods:

### 1. Email/Password Authentication
- Secure password hashing with bcrypt
- JWT token-based sessions
- Remember me functionality

### 2. Google OAuth
- One-click Google Sign-In
- Automatic account creation/linking
- Secure token verification

## 🤖 Web Scraping & Automation

### Scraping Architecture

The application uses **Playwright** for robust, automated web scraping:

- **Platform-Specific Scrapers**: Dedicated scrapers for Amazon, Flipkart, and eBay
- **Base Scraper Class**: Provides common functionality like browser automation, anti-detection, and retry logic
- **Scraper Factory**: Automatically detects platform from URL and routes to appropriate scraper
- **Anti-Detection**: Random user agents, realistic delays, and browser fingerprinting prevention

### Automated Price Updates

Three tiers of automated updates run via cron jobs:

1. **Frequent Updates** (Every 30 minutes): Updates 30 most recent products
2. **Regular Updates** (Every 2 hours): Updates 100 products
3. **Daily Updates** (Daily at 2 AM): Updates 500 products

Products are prioritized by last check time to ensure fresh data.

### Manual Updates

Users can also trigger:
- Single product updates on-demand
- Bulk updates for multiple products
- Immediate price checks before purchasing

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: HttpOnly cookies + secure storage
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: HttpOnly cookies, sanitized inputs

## 🧪 Testing

Testing infrastructure is planned for future phases:

- **Unit Tests**: Jest/Vitest for component and function testing
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: User flow testing with Playwright/Cypress

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/google` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - OAuth callback
- `POST /api/v1/auth/google/token` - Google token verification

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

For detailed API documentation, see the [SDD](./SDD/Smart-Price-Tracker-SDD.md#6-api-design) or [Backend README](./backend/README.md).

## 🚢 Deployment

### Recommended Stack
- **Frontend**: Vercel / Netlify
- **Backend**: Heroku / Render / AWS
- **Database**: Neon / Supabase / AWS RDS

### Build Commands

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
npm install --production
npx prisma migrate deploy
npx prisma generate
npm start
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ES6+ syntax
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License.

## 👥 Team

**Smart Price Tracker Development Team**

- Varun Singh (2547254)
- Ananya M (2547259)
- Prajwal KT (2547239)

## 📧 Contact

For questions, suggestions, or issues:
- Create an issue in the GitHub repository
- Contact us via the website contact form

## 🗺️ Roadmap

- [x] **Phase 1**: Authentication & Basic UI ✅
- [x] **Phase 2**: Product tracking & price scraping ✅
- [ ] **Phase 3**: Advanced visualizations & notifications
- [ ] **Phase 4**: Mobile app & browser extension
- [ ] **Phase 5**: Premium features & monetization

For detailed roadmap, see [Future Enhancements](./SDD/Smart-Price-Tracker-SDD.md#11-future-enhancements) in the SDD.

## 🙏 Acknowledgments

- React, Express, and Prisma communities
- Tailwind CSS for the amazing utility framework
- Google for OAuth services
- All contributors and users

---

**Built with ❤️ by the Smart Price Tracker Team**

*Last Updated: February 26, 2026*
