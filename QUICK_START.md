# Quick Start Guide - Smart Price Tracker

This guide will help you set up and run the Smart Price Tracker application on your local machine in under 10 minutes.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (or use a cloud service like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/))
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-price-tracker.git
cd smart-price-tracker
```

### 2. Set Up the Database

#### Option A: Using Neon (Recommended for beginners)
1. Go to [Neon](https://neon.tech/) and create a free account
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@host/database`)

#### Option B: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE smart_price_tracker;
   ```
3. Your connection string will be: `postgresql://postgres:yourpassword@localhost:5432/smart_price_tracker`

### 3. Backend Setup (5 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Now open `.env` in your code editor and update:

```env
# Update this line with your database URL from step 2
DATABASE_URL="your-database-connection-string-here"

# Generate secure secrets (or use the defaults for now)
ACCESS_TOKEN_SECRET=my-super-secret-key-12345
REFRESH_TOKEN_SECRET=my-refresh-secret-key-67890

# These can stay as default for local development
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Run database migrations:

```bash
# Create database tables
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start the backend server
npm run dev
```

✅ **Success!** Your backend should now be running on `http://localhost:4000`

### 4. Frontend Setup (3 minutes)

Open a **new terminal window** and:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Open `frontend/.env` and verify:

```env
VITE_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

✅ **Success!** Your frontend should now be running on `http://localhost:5173`

### 5. Test the Application

1. Open your browser and go to `http://localhost:5173`
2. You should see the Smart Price Tracker landing page
3. Click "Sign Up" to create a new account
4. Fill in the form:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
5. Click "Create Account"
6. You should be redirected to the dashboard!

## Optional: Google OAuth Setup

If you want to enable "Sign in with Google":

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Application type: "Web application"
6. Add authorized redirect URI: `http://localhost:4000/api/v1/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### 2. Update Environment Variables

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/auth/google/callback
```

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 3. Restart Both Servers

Press `Ctrl+C` in both terminal windows and run `npm run dev` again.

Now you can use "Sign in with Google" on the login page!

## Troubleshooting

### Backend won't start

**Error: "Environment variable not found: DATABASE_URL"**
- Make sure you created the `.env` file in the `backend/` directory
- Make sure `DATABASE_URL` is set correctly

**Error: "Port 4000 is already in use"**
- Change `PORT=4000` to `PORT=4001` in `backend/.env`
- Update `VITE_API_URL` in `frontend/.env` to match

### Frontend won't start

**Error: "Failed to fetch"**
- Make sure the backend is running
- Check that `VITE_API_URL` in `frontend/.env` matches your backend URL

### Database connection issues

**Error: "Can't reach database server"**
- Verify your `DATABASE_URL` is correct
- If using local PostgreSQL, make sure it's running
- If using Neon/Supabase, check your internet connection

### Login/Signup not working

1. Open browser Developer Tools (F12)
2. Go to the "Network" tab
3. Try to login/signup
4. Check if there's a request to `/api/v1/auth/login` or `/api/v1/auth/signup`
5. If it fails, check the error message in the console

## Common Commands

### Backend
```bash
# Start development server
npm run dev

# Run database migrations
npx prisma migrate dev

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Next Steps

Now that you have the app running:

1. **Explore the Code**
   - Check out `backend/src/controllers/auth.controller.js` for authentication logic
   - Look at `frontend/src/pages/LandingPage.jsx` for the UI

2. **Read the Documentation**
   - [Software Design Document](./SDD/Smart-Price-Tracker-SDD.md) for architecture details
   - [README](./README.md) for project overview

3. **Start Contributing**
   - Check the roadmap for upcoming features
   - Pick a feature to implement
   - Create a pull request!

## Getting Help

- **Documentation**: Check the [SDD](./SDD/Smart-Price-Tracker-SDD.md) for detailed info
- **Issues**: Create an issue on GitHub
- **Community**: Join our Discord/Slack (if available)

## Development Tips

### Recommended VS Code Extensions
- ESLint
- Prisma
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes reflect immediately
- Backend: Nodemon restarts server on file changes

### Database GUI
Use Prisma Studio to view/edit data:
```bash
cd backend
npx prisma studio
```
Opens at `http://localhost:5555`

---

**Happy Coding! 🚀**

If you found this guide helpful, please star the repository!
