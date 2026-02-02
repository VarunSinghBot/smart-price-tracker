import { Navigate } from 'react-router-dom';

// Component to protect routes that require authentication
export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Component to protect auth pages (login/signup) from already logged-in users
export const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};
