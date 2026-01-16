// Basic URL export (Legacy - replace usage with api.js over time)
export const getApiUrl = () => {
    // If VITE_API_URL is set (e.g. in Docker/Production), use it.
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // Default to relative if on HTTPS (Production/Nginx)
    // or if explicitly not localhost and protocol is http (remote dev without SSL)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '';
    }

    // Fallback for local dev
    return 'http://localhost:3005';
};

// New Axios Instance Helper
import axios from 'axios';

export const api = axios.create({
    baseURL: getApiUrl(),
    withCredentials: true // Important: Send cookies
});
