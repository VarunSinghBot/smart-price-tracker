// Authentication utility functions

export const isAuthenticated = () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
};

export const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

export const setAuthData = (token, user) => {
    localStorage.setItem('accessToken', token);
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

export const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
};
