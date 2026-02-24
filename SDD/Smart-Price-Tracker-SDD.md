# Software Design Document (SDD)

## Smart Price Tracker

**Version:** 1.1
**Date:** February 24, 2026
**Project Type:** Web Application
**Document Status:** Draft

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [Frontend Design](#7-frontend-design)
8. [Security Design](#8-security-design)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Testing Strategy](#10-testing-strategy)
11. [Future Enhancements](#11-future-enhancements)

---

## 1. Introduction

### 1.1 Purpose

This Software Design Document (SDD) describes the architecture and design of the Smart Price Tracker application. The document provides a comprehensive architectural overview of the system, using views to depict different aspects of the system.

### 1.2 Scope

Smart Price Tracker is a web application that enables users to:

- Monitor product prices across multiple e-commerce platforms (Amazon, eBay, Walmart, etc.)
- Track price history and trends over time
- Set price alerts and receive notifications when prices drop
- Compare prices across different retailers
- Make informed purchasing decisions based on historical data

### 1.3 Definitions and Acronyms

- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **OAuth**: Open Authorization
- **ORM**: Object-Relational Mapping
- **SPA**: Single Page Application
- **REST**: Representational State Transfer
- **CORS**: Cross-Origin Resource Sharing

### 1.4 References

- React Documentation: https://react.dev
- Express.js Documentation: https://expressjs.com
- Prisma Documentation: https://www.prisma.io/docs
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2

---

## 2. System Overview

### 2.1 System Description

Smart Price Tracker is a full-stack web application built with a modern tech stack that provides real-time price tracking capabilities for online shoppers. The system follows a client-server architecture with a React-based frontend and Node.js/Express backend.

### 2.2 System Context Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Smart Price Tracker Frontend   │
│  (React SPA)                     │
└────────────┬────────────────────┘
             │ HTTPS/REST API
             ▼
┌─────────────────────────────────┐
│  Backend API Server              │
│  (Express.js + Node.js)          │
└────────┬───────────┬────────────┘
         │           │
         │           ▼
         │    ┌──────────────┐
         │    │   Google     │
         │    │   OAuth API  │
         │    └──────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  PostgreSQL Database             │
│  (Managed via Prisma ORM)        │
└─────────────────────────────────┘
```

### 2.3 User Roles

1. **Guest User**: Can view landing page and features
2. **Registered User**: Can track products, set alerts, view price history
3. **OAuth User**: Can sign in using Google credentials

---

## 3. System Architecture

### 3.1 Overall Architecture

The system follows a **three-tier architecture**:

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 40, 'rankSpacing': 50}}}%%
graph TB
    subgraph "Presentation Layer"
        React["React Components"]
        Redux["Redux State Management"]
        Router["React Router"]
    end

    subgraph "Application Layer"
        Express["Express.js REST API"]
        Auth["Authentication Middleware"]
        Controllers["Business Logic Controllers"]
        Validation["Request Validation (Zod)"]
    end

    subgraph "Data Layer"
        Prisma["Prisma ORM"]
        DB[("PostgreSQL Database")]
    end

    React --> Express
    Redux --> Express
    Router --> Express
    Express --> Auth
    Auth --> Controllers
    Controllers --> Validation
    Validation --> Prisma
    Prisma --> DB
```

### 3.2 Component Architecture

#### 3.2.1 Frontend Components

```
src/
├── components/
│   ├── auth/
│   │   ├── AuthLayout.jsx        # Wrapper for auth pages
│   │   ├── Login.jsx             # Login form component
│   │   ├── Signup.jsx            # Registration form
│   │   ├── GoogleSignInButton.jsx
│   │   └── AuthCallback.jsx      # OAuth redirect handler
│   ├── ui/
│   │   ├── Toast.jsx             # Notification system
│   │   ├── ToastContainer.jsx
│   │   └── ConfirmDialog.jsx     # Confirmation modals
│   ├── Navbar.jsx                # Main navigation
│   ├── Footer.jsx                # Footer component
│   ├── DashboardNavbar.jsx       # Dashboard-specific nav
│   └── ProtectedRoute.jsx        # Route guards
├── pages/
│   ├── LandingPage.jsx           # Marketing homepage
│   ├── Dashboard.jsx             # User dashboard
│   ├── Trackers.jsx              # Price tracking interface
│   ├── Chat.jsx                  # Support/chat feature
│   ├── Library.jsx               # Saved products library
│   ├── Terms.jsx                 # Terms of service
│   ├── Privacy.jsx               # Privacy policy
│   └── Contact.jsx               # Contact page
├── layouts/
│   └── DashboardLayout.jsx       # Dashboard wrapper
└── utils/
    └── auth.js                   # Authentication utilities
```

#### 3.2.2 Backend Components

```
src/
├── controllers/
│   └── auth.controller.js        # Authentication logic
├── middlewares/
│   └── auth.middleware.js        # JWT verification
├── routes/
│   └── auth.route.js             # API route definitions
├── utils/
│   ├── prisma.js                 # Prisma client instance
│   └── tokenGenerator.js         # JWT token generation
├── app.js                        # Express app configuration
├── index.js                      # Server entry point
└── constants.js                  # Application constants
```

#### 3.2.3 Backend Architecture Flow

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 40, 'rankSpacing': 50}}}%%
graph LR
    Client["Client (React)"] -->|HTTP| App["Express App"]

    subgraph "Middleware"
        CORS["CORS"] --> JSON["JSON Parser"] --> Cookie["Cookie Parser"] --> Auth["JWT Auth"] --> Validate["Zod Validation"]
    end

    App --> CORS

    subgraph "API Layer"
        Routes["Routes"] --> Controllers["Controllers"] --> Services["Services"]
    end

    Validate --> Routes

    subgraph "Data Access"
        Services --> Prisma["Prisma ORM"] --> DB[("PostgreSQL")]
    end
```

### 3.3 Design Patterns

#### 3.3.1 MVC Pattern (Backend)

- **Model**: Prisma schema defines data models
- **View**: JSON responses (REST API)
- **Controller**: Business logic in controller files

#### 3.3.2 Repository Pattern

- Prisma ORM acts as repository layer
- Abstracts database operations
- Provides type-safe query interface

#### 3.3.3 Middleware Chain Pattern

```javascript
Request → CORS → JSON Parser → Cookie Parser → 
Auth Middleware → Route Controller → Response
```

---

## 4. Technology Stack

### 4.1 Frontend Technologies

| Technology       | Version | Purpose                   |
| ---------------- | ------- | ------------------------- |
| React            | 19.2.0  | UI framework              |
| React Router DOM | 7.12.0  | Client-side routing       |
| Redux Toolkit    | 2.11.2  | State management          |
| Axios            | 1.13.2  | HTTP client               |
| Tailwind CSS     | 4.1.18  | Styling framework         |
| Vite             | 7.2.4   | Build tool and dev server |
| React Hot Toast  | 2.6.0   | Toast notifications       |
| SimpleBar React  | 3.3.2   | Custom scrollbars         |

### 4.2 Backend Technologies

| Technology          | Version    | Purpose                  |
| ------------------- | ---------- | ------------------------ |
| Node.js             | Latest LTS | Runtime environment      |
| Express             | 5.2.1      | Web framework            |
| Prisma              | 7.2.0      | ORM and database toolkit |
| PostgreSQL          | -          | Relational database      |
| bcrypt              | 6.0.0      | Password hashing         |
| jsonwebtoken        | 9.0.3      | JWT authentication       |
| google-auth-library | 10.5.0     | Google OAuth integration |
| Zod                 | 4.3.5      | Schema validation        |
| dotenv              | 17.2.3     | Environment variables    |
| cors                | 2.8.5      | CORS handling            |
| cookie-parser       | 1.4.7      | Cookie parsing           |

### 4.3 Development Tools

| Tool    | Purpose                         |
| ------- | ------------------------------- |
| nodemon | Auto-restart backend on changes |
| ESLint  | Code linting                    |
| Git     | Version control                 |

---

## 5. Database Design

### 5.1 Current Schema (Phase 1)

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String?  // nullable for OAuth users
  googleId   String?  @unique
  username   String?  @unique
  name       String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Relationships**: Currently standalone user model

**Indexes**:

- Primary key on `id`
- Unique index on `email`
- Unique index on `googleId`
- Unique index on `username`

### 5.2 Planned Schema (Phase 2)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  products  Product[]
  alerts    Alert[]
}

model Product {
  id        String   @id @default(uuid())
  url       String
  title     String
  platform  String   // Amazon, eBay, Walmart, etc.
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  prices    PriceHistory[]
  alerts    Alert[]
}

model PriceHistory {
  id        String   @id @default(uuid())
  price     Float
  scrapedAt DateTime @default(now())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
}

model Alert {
  id        String   @id @default(uuid())
  target    Float    // Target price
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
}
```

### 5.3 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Product : tracks
    User ||--o{ Alert : creates
    Product ||--o{ PriceHistory : has
    Product ||--o{ Alert : monitors
    
    User {
        string id PK "cuid()"
        string email UK "unique"
        string password "nullable for OAuth"
        string googleId UK "unique, nullable"
        string username UK "unique, nullable"
        string name "nullable"
        datetime createdAt
        datetime updatedAt
    }
    
    Product {
        string id PK "cuid()"
        string userId FK
        string url "product URL"
        string title
        string platform "Amazon, eBay, Flipkart"
        string imageUrl "nullable"
        float currentPrice "nullable"
        string currency "default: USD"
        boolean inStock "default: true"
        string productId "platform-specific ID"
        json metadata "brand, specs, rating"
        datetime createdAt
        datetime updatedAt
        datetime lastChecked
    }
    
    PriceHistory {
        string id PK "cuid()"
        string productId FK
        float price
        boolean inStock "default: true"
        datetime scrapedAt
    }
    
    Alert {
        string id PK "cuid()"
        string userId FK
        string productId FK
        float targetPrice "price threshold"
        boolean active "default: true"
        boolean notified "default: false"
        datetime notifiedAt "nullable"
        datetime createdAt
        datetime updatedAt
    }
```

### 5.4 Database Migrations Strategy

- Use Prisma Migrate for schema versioning
- Migrations stored in `prisma/migrations/`
- Current migration: `20260112103856_init`
- Migration commands:
  ```bash
  npx prisma migrate dev --name <migration_name>
  npx prisma migrate deploy  # Production
  ```

---

## 6. API Design

### 6.1 API Architecture

- **Style**: RESTful API
- **Protocol**: HTTPS
- **Data Format**: JSON
- **Base URL**: `http://localhost:4000/api/v1` (Development)

### 6.2 Authentication Endpoints

#### 6.2.1 User Registration

```
POST /api/v1/auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "name": "John Doe" // optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "clxy123...",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "createdAt": "2026-02-21T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validation Rules:**

- Email: Valid email format
- Username: 3-30 characters
- Password: Minimum 8 characters
- Passwords must match

#### 6.2.2 User Login

```
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "emailOrUsername": "user@example.com",
  "password": "SecurePass123",
  "rememberMe": false
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxy123...",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Cookies Set:**

- `accessToken`: HttpOnly, 7 days (or 30 with rememberMe)
- `refreshToken`: HttpOnly, 30 days

#### 6.2.3 User Logout

```
POST /api/v1/auth/logout
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 6.2.4 Get Current User

```
GET /api/v1/auth/me
```

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxy123...",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe"
    }
  }
}
```

### 6.3 Google OAuth Endpoints

#### 6.3.1 Initiate Google OAuth

```
GET /api/v1/auth/google
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

#### 6.3.2 Google OAuth Callback

```
GET /api/v1/auth/google/callback?code=<authorization_code>
```

**Behavior:**

- Exchanges code for tokens
- Creates or links user account
- Sets authentication cookies
- Redirects to frontend: `/auth/callback?success=true&token=...`

#### 6.3.3 Google Token Authentication

```
POST /api/v1/auth/google/token
```

**Request Body:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "clxy123...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 6.4 Future Product Endpoints (Planned)

```
GET    /api/v1/products              # List user's tracked products
POST   /api/v1/products              # Add product to track
GET    /api/v1/products/:id          # Get product details
DELETE /api/v1/products/:id          # Remove tracked product
GET    /api/v1/products/:id/history  # Get price history

GET    /api/v1/alerts                # List user's alerts
POST   /api/v1/alerts                # Create price alert
PUT    /api/v1/alerts/:id            # Update alert
DELETE /api/v1/alerts/:id            # Delete alert
```

### 6.5 Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email already registered"
    }
  ]
}
```

**HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 7. Frontend Design

### 7.1 Frontend Architecture

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 40, 'rankSpacing': 50}}}%%
graph LR
    User["User"] -->|Browser| App["Vite + React App"]

    subgraph "Routing & Auth"
        Router["React Router"] --> Protected["Protected Routes"] 
        Router --> Public["Public Routes"]
    end

    App --> Router

    subgraph "Components"
        Pages["Pages"] --> Modal["Modals"] --> Cards["Cards/Forms"]
    end

    Protected --> Pages
    Public --> Pages

    subgraph "State"
        Redux["Redux Toolkit"] --> Slices["Slices (Thunks)"]
    end

    Pages --> Redux

    subgraph "HTTP"
        Axios["Axios"] --> API["API Calls"]
    end

    Slices --> Axios
    API --> Backend["Express API"]
```

### 7.2 Application Structure

```
Smart Price Tracker Frontend
│
├── Public Routes
│   ├── / (Landing Page)
│   ├── /login
│   ├── /signup
│   ├── /auth/callback
│   ├── /terms
│   ├── /privacy
│   └── /contact
│
└── Protected Routes (Requires Authentication)
    ├── /dashboard
    ├── /trackers
    ├── /chat
    └── /library
```

### 7.3 State Management (Redux)

**Store Structure:**

```javascript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  products: {
    items: Product[],
    loading: boolean,
    error: string | null
  },
  alerts: {
    items: Alert[],
    loading: boolean,
    error: string | null
  }
}
```

### 7.4 Route Protection

**ProtectedRoute Component:**

```jsx
// Redirects to /login if not authenticated
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

**PublicRoute Component:**

```jsx
// Redirects to /dashboard if already authenticated
<Route path="/login" element={
  <PublicRoute>
    <Login />
  </PublicRoute>
} />
```

### 7.5 UI/UX Design Principles

#### 7.5.1 Color Scheme

```css
Primary Background: #E8DCC4 (Warm Beige)
Secondary Background: #6B9B8E (Sage Green)
Text Primary: #2D3748 (Dark Gray)
Text Secondary: #718096 (Medium Gray)
Accent: #48BB78 (Success Green)
Error: #F56565 (Error Red)
```

#### 7.5.2 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

#### 7.5.3 Animation Features

- Scroll-based fade-in animations
- Parallax effects on landing page
- Smooth page transitions
- Toast notifications with slide-in animation

### 7.6 Key UI Components

#### 7.6.1 Navbar Component

- **Features:**
  - Sticky navigation
  - Responsive menu (hamburger on mobile)
  - User authentication status display
  - Logo and branding

#### 7.6.2 Toast Notification System

- **Types:** Success, Error, Info, Warning
- **Position:** Top-right corner
- **Duration:** 3-5 seconds (auto-dismiss)
- **Features:** Dismissible, stackable

#### 7.6.3 Authentication Forms

- **Login Form:**

  - Email/Username input
  - Password input (with show/hide toggle)
  - Remember me checkbox
  - Google Sign-In button
  - Link to signup page
- **Signup Form:**

  - Email validation
  - Username availability check
  - Password strength indicator
  - Confirm password matching
  - Terms acceptance checkbox

### 7.7 Accessibility Features

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

---

## 8. Security Design

### 8.1 Authentication & Authorization

#### 8.1.1 JWT Token Strategy

```javascript
// Access Token
{
  "userId": "clxy123...",
  "exp": 1708516800  // 7 days from issue
}

// Refresh Token
{
  "userId": "clxy123...",
  "exp": 1711195200  // 30 days from issue
}
```

**Token Storage:**

- Access Token: HttpOnly cookie + localStorage (for client-side checks)
- Refresh Token: HttpOnly cookie only

#### 8.1.2 Password Security

```javascript
// Password Hashing with bcrypt
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
```

**Password Requirements:**

- Minimum 8 characters
- Hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Never returned in API responses

### 8.2 CORS Configuration

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // Frontend URL
  credentials: true,                 // Allow cookies
}));
```

**Allowed Origins:**

- Development: `http://localhost:5173`
- Production: Configured via environment variable

### 8.3 Cookie Security

```javascript
const cookieOptions = {
  httpOnly: true,                    // Prevent XSS attacks
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',                // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
};
```

### 8.4 Input Validation

**Zod Schema Validation:**

```javascript
// Server-side validation for all inputs
const signupSchema = z.object({
  email: z.email("Invalid email"),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword);
```

**Validation Layers:**

1. Frontend validation (immediate feedback)
2. Backend validation (security enforcement)
3. Database constraints (data integrity)

### 8.5 OAuth Security

**Google OAuth Configuration:**

```javascript
{
  access_type: 'offline',   // Get refresh token
  scope: [
    'userinfo.profile',
    'userinfo.email'
  ],
  prompt: 'consent'         // Force consent screen
}
```

**Security Measures:**

- State parameter for CSRF protection
- Token verification before trust
- Secure redirect URI validation
- ID token signature verification

### 8.6 API Security Best Practices

1. **Rate Limiting** (Planned)

   - Prevent brute force attacks
   - Limit requests per IP/user
2. **Request Size Limits**

   ```javascript
   app.use(express.json({ limit: "16kb" }));
   app.use(express.urlencoded({ extended: true, limit: "16kb" }));
   ```
3. **Environment Variables**

   - Sensitive data in `.env` files
   - Never committed to version control
   - Different configs for dev/prod
4. **SQL Injection Prevention**

   - Prisma ORM with parameterized queries
   - No raw SQL with user input
5. **XSS Prevention**

   - HttpOnly cookies
   - Content Security Policy headers (planned)
   - Input sanitization

---

## 9. Deployment Architecture

### 9.1 Development Environment

```
┌─────────────────────┐     ┌─────────────────────┐
│  Frontend Dev       │     │  Backend Dev        │
│  Vite Server        │────>│  Express + Nodemon  │
│  localhost:5173     │     │  localhost:4000     │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  PostgreSQL Local   │
                            │  or Cloud (Neon)    │
                            └─────────────────────┘
```

### 9.2 Production Environment (Recommended)

```
┌──────────────┐
│   Cloudflare │ CDN
│   or AWS S3  │ Static Assets
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Frontend (Static SPA)   │
│  - Vercel / Netlify      │
│  - React Build           │
└──────────┬───────────────┘
           │ HTTPS/API Calls
           ▼
┌──────────────────────────┐
│  Backend API             │
│  - Heroku / AWS / Render │
│  - Node.js Express       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  PostgreSQL Database     │
│  - Neon / Supabase       │
│  - Managed Service       │
└──────────────────────────┘
```

### 9.3 Environment Variables

#### Backend (.env)

```bash
# Server
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# CORS
CORS_ORIGIN=https://yourapp.com

# JWT
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://api.yourapp.com/api/v1/auth/google/callback

# Frontend
FRONTEND_URL=https://yourapp.com
```

#### Frontend (.env)

```bash
VITE_API_URL=https://api.yourapp.com
VITE_GOOGLE_CLIENT_ID=your-client-id
```

### 9.4 Build Process

#### Frontend Build

```bash
npm run build
# Outputs to dist/ directory
# Static files ready for deployment
```

#### Backend Deployment

```bash
# Install dependencies
npm install --production

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Start server
npm start
```

### 9.5 Continuous Integration/Deployment (Recommended)

**GitHub Actions Workflow:**

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - uses: vercel/action@v1
  
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npx prisma generate
      - uses: heroku/action@v1
```

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
        ┌─────────────┐
        │  E2E Tests  │  (Planned - Playwright/Cypress)
        └─────────────┘
      ┌───────────────────┐
      │ Integration Tests │  (Planned - API testing)
      └───────────────────┘
    ┌─────────────────────────┐
    │     Unit Tests          │  (Planned - Jest/Vitest)
    └─────────────────────────┘
```

### 10.2 Unit Testing (Planned)

**Backend Unit Tests:**

- Controller logic testing
- Utility function testing
- Validation schema testing

**Frontend Unit Tests:**

- Component rendering tests
- Redux reducer tests
- Utility function tests

**Testing Framework:** Jest / Vitest

### 10.3 Integration Testing (Planned)

**API Integration Tests:**

- Authentication flow testing
- CRUD operations testing
- Error handling testing

**Tools:** Supertest + Jest

### 10.4 End-to-End Testing (Planned)

**User Flow Tests:**

- Complete signup/login flow
- Product tracking workflow
- Alert creation and notification
- Price comparison journey

**Tools:** Playwright or Cypress

### 10.5 Manual Testing Checklist

**Authentication:**

- [ ] User registration with valid data
- [ ] User registration with invalid data
- [ ] Login with email
- [ ] Login with username
- [ ] Login with Google OAuth
- [ ] Remember me functionality
- [ ] Logout functionality
- [ ] Protected route access without auth
- [ ] Token expiration handling

**UI/UX:**

- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Toast notifications display correctly
- [ ] Form validation messages
- [ ] Loading states
- [ ] Error states

---

## 11. Future Enhancements

### 11.1 Phase 2 Features (Product Tracking)

**Priority: High**

1. **Product URL Scraper**

   - Parse product URLs from major retailers
   - Extract product details (title, price, image)
   - Support for Amazon, eBay, Walmart, Target
2. **Price History Tracking**

   - Scheduled scraping jobs (cron)
   - Store price snapshots
   - Generate price trend charts
3. **Price Alert System**

   - Email notifications
   - Push notifications (browser)
   - SMS alerts (premium feature)
4. **Dashboard Analytics**

   - Savings tracker
   - Price drop statistics
   - Best deal recommendations

### 11.2 Phase 3 Features (Advanced Features)

**Priority: Medium**

1. **Price Comparison**

   - Side-by-side comparison of same product across platforms
   - Best price highlightingUniversal product search
2. **Wishlist Management**

   - Organize products into collections
   - Share wishlists with friends
   - Collaborative wishlists
3. **Browser Extension**

   - One-click product tracking
   - Price overlay on shopping sites
   - Deal notifications while browsing
4. **Mobile Application**

   - React Native mobile app
   - Barcode scanning
   - Location-based deals

### 11.3 Phase 4 Features (Monetization)

**Priority: Low**

1. **Premium Subscription**

   - Unlimited product tracking
   - Advanced analytics
   - Priority notifications
   - Ad-free experience
2. **Affiliate Integration**

   - Amazon Associates
   - eBay Partner Network
   - Commission on purchases
3. **Business Features**

   - Competitor price monitoring
   - Bulk product tracking
   - API access for businesses

### 11.4 Technical Improvements

1. **Performance Optimization**

   - Redis caching layer
   - Database query optimization
   - CDN for static assets
   - Image optimization
2. **Scalability**

   - Microservices architecture
   - Message queue (RabbitMQ/Redis)
   - Horizontal scaling
   - Load balancing
3. **Monitoring & Analytics**

   - Application performance monitoring (APM)
   - Error tracking (Sentry)
   - User analytics (Google Analytics)
   - Server monitoring (New Relic)
4. **DevOps**

   - Docker containerization
   - Kubernetes orchestration
   - Automated testing pipeline
   - Blue-green deployments

---

## Appendices

### Appendix A: API Request/Response Examples

See Section 6 for detailed API documentation.

### Appendix B: Database Schema Visual

See Section 5.3 for ERD diagram.

### Appendix C: Development Setup

**Backend Setup:**

```bash
cd backend
npm install
cp .env.example .env
# Configure .env file
npx prisma migrate dev
npm run dev
```

**Frontend Setup:**

```bash
cd frontend
npm install
cp .env.example .env
# Configure .env file
npm run dev
```

### Appendix D: Project Dependencies

See `package.json` files in `/backend` and `/frontend` directories.

### Appendix E: Coding Standards

**JavaScript/React:**

- Use ES6+ syntax
- Functional components with hooks
- PropTypes for type checking (or TypeScript migration planned)
- Consistent naming conventions (camelCase for variables, PascalCase for components)

**CSS:**

- Tailwind utility classes preferred
- Custom CSS in separate modules when needed
- Mobile-first responsive design

**Git Workflow:**

- Feature branch workflow
- Conventional commit messages
- Pull request reviews before merge

---

## Document Revision History

| Version | Date         | Author           | Description                                                                 |
| ------- | ------------ | ---------------- | --------------------------------------------------------------------------- |
| 1.1     | Feb 24, 2026 | Varun Singh      | Documentation improvements and diagram updates                              |
| 1.0     | Feb 21, 2026 | Development Team | Initial SDD creation                                                        |

---

## Sign-off

**Prepared by:** Smart Price Tracker Development Team  
**Last Updated:** February 24, 2026  
**Status:** Active Development

---

*This document is subject to change as the project evolves. All stakeholders will be notified of major revisions.*
