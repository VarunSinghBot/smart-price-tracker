# Smart Price Tracker 🏷️

A comprehensive web application for tracking product prices across multiple e-commerce platforms, helping users make informed purchasing decisions and never miss a deal.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Smart Price Tracker is a full-stack web application that enables users to:
- Monitor product prices in real-time across Amazon, eBay, Walmart, and more
- Track price history and trends
- Set price alerts and receive notifications
- Compare prices across different retailers
- Make data-driven purchasing decisions

## ✨ Features

### Current Features (Phase 1 - MVP)
- ✅ User authentication (Email/Password + Google OAuth)
- ✅ Secure JWT token-based sessions
- ✅ Responsive landing page
- ✅ Protected routes and user dashboard
- ✅ Toast notification system
- ✅ Modern, accessible UI with Tailwind CSS

### Planned Features (Phase 2)
- 🔄 Product URL tracking
- 🔄 Automated price scraping
- 🔄 Price history visualization
- 🔄 Email/Push notifications for price drops
- 🔄 Price comparison dashboard

### Future Enhancements (Phase 3+)
- 📱 Mobile application
- 🧩 Browser extension
- 📊 Advanced analytics
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

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database (or use Neon/Supabase)
- Google OAuth credentials (optional, for OAuth login)

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

# Create .env file from example
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL
# - JWT secrets
# - Google OAuth credentials (optional)
# - CORS origin

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
│   │   ├── middlewares/           # Express middlewares
│   │   ├── routes/                # API routes
│   │   ├── utils/                 # Utility functions
│   │   ├── app.js                 # Express app config
│   │   └── index.js               # Server entry point
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

For detailed API documentation, see the [SDD](./SDD/Smart-Price-Tracker-SDD.md#6-api-design).

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

## 📧 Contact

For questions, suggestions, or issues:
- Create an issue in the GitHub repository
- Contact us via the website contact form

## 🗺️ Roadmap

- [x] **Phase 1**: Authentication & Basic UI (Current)
- [ ] **Phase 2**: Product tracking & price scraping
- [ ] **Phase 3**: Price alerts & notifications
- [ ] **Phase 4**: Advanced features & mobile app
- [ ] **Phase 5**: Premium features & monetization

For detailed roadmap, see [Future Enhancements](./SDD/Smart-Price-Tracker-SDD.md#11-future-enhancements) in the SDD.

## 🙏 Acknowledgments

- React, Express, and Prisma communities
- Tailwind CSS for the amazing utility framework
- Google for OAuth services
- All contributors and users

---

**Built with ❤️ by the Smart Price Tracker Team**

*Last Updated: February 21, 2026*
