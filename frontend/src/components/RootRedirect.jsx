import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import { Loader2 } from 'lucide-react';

const RootRedirect = () => {
    const [status, setStatus] = useState(null); // null, 'setup', 'login'

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get(`${getApiUrl()}/api/setup/status`);
                if (res.data.isSetupCompleted) {
                    setStatus('login');
                } else {
                    setStatus('setup');
                }
            } catch (error) {
                console.error('Status check failed', error);
                // Fallback to setup if API fails? or show error?
                // For now, let's assume if we can't reach backend, we might need setup or debug
                setStatus('setup');
            }
        };
        checkStatus();
    }, []);

    if (!status) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (status === 'setup') {
        return <Navigate to="/setup" replace />;
    }

    return <Navigate to="/login" replace />;
};

export default RootRedirect;
