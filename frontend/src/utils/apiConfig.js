export const getApiUrl = () => {
    // If VITE_API_URL is set (e.g. in Docker/Production), use it.
    // If not, and we are in dev (localhost), default to localhost:3005.
    // However, if we are behind Nginx (production), relative paths are often best.

    // For this setup:
    // 1. Production (Nginx): we want requests to go to '/api' relative to domain
    // 2. Local Dev: we want requests to 'http://localhost:3005'

    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Default to relative if on HTTPS (Production/Nginx)
    // or if explicitly not localhost and protocol is http (remote dev without SSL)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '';
    }

    // Fallback for local dev
    return 'http://localhost:3005';
};
