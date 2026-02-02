import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import AuthLayout from './components/auth/AuthLayout'
import AuthCallback from './components/auth/AuthCallback'
import Dashboard from './pages/Dashboard'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'
import ErrPage from './ErrPage';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes wrapped in AuthLayout and PublicRoute */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        </Route>
        
        {/* OAuth Callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Dashboard - Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Legal Pages */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* 404 Error page */}
        <Route path="*" element={<ErrPage />} />
      </Routes>
    </Router>
  )
}

export default App
