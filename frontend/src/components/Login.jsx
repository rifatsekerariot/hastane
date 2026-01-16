import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiConfig';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/api/auth/login', credentials);

            // Cookie is set automatically 
            // We just store user info for UI display
            localStorage.setItem('user', JSON.stringify(res.data.user));

            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.msg || 'Giriş başarısız');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Yönetici Girişi</h2>

                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Kullanıcı Adı</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-500" size={20} />
                            <input
                                type="text"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
