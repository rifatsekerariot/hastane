import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../utils/apiConfig';
import { Loader2 } from 'lucide-react';

const RequireAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await api.get('/api/auth/user'); // Will throw 401 if cookie missing/invalid
                setIsAuthenticated(true);
            } catch (err) {
                setIsAuthenticated(false);
            }
        };
        verifyAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
