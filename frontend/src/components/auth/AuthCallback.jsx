import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Processing authentication...');

    useEffect(() => {
        const success = searchParams.get('success');
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (success === 'true' && token) {
            // Store token
            localStorage.setItem('accessToken', token);
            
            // Store user data if provided
            if (userParam) {
                try {
                    const userData = JSON.parse(decodeURIComponent(userParam));
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (err) {
                    console.error('Error parsing user data:', err);
                }
            }
            
            setStatus('Authentication successful! Redirecting...');
            
            // Immediate redirect without delay
            navigate('/dashboard', { replace: true });
        } else {
            const errorMessage = error || 'Authentication failed';
            setStatus(`Error: ${errorMessage}`);
            console.error('OAuth error:', errorMessage);
            
            setTimeout(() => {
                navigate('/login?error=' + encodeURIComponent(errorMessage), { replace: true });
            }, 2000);
        }
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg">{status}</p>
            </div>
        </div>
    );
}
