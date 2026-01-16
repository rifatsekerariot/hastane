import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, Save } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

const SetupWizard = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        hospitalName: '',
        adminPassword: '',
        hl7Port: 2575
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = getApiUrl();
            await axios.post(`${apiUrl}/api/setup/initialize`, formData);
            alert('Kurulum Tamamlandı!');
            navigate('/admin');
        } catch (error) {
            console.error('Setup failed', error);
            alert('Kurulum başarısız oldu: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-center mb-6">
                    <Settings className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">Sistem Kurulumu</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Hastane Adı</label>
                        <input
                            type="text"
                            name="hospitalName"
                            className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:border-blue-500 outline-none"
                            placeholder="Örn: Merkez Hastanesi"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Admin Parolası</label>
                        <input
                            type="password"
                            name="adminPassword"
                            className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:border-blue-500 outline-none"
                            placeholder="Güvenli bir parola belirleyin"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">HL7 Portu</label>
                        <input
                            type="number"
                            name="hl7Port"
                            className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:border-blue-500 outline-none"
                            defaultValue={2575}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2">
                        <Save size={18} />
                        Kaydet ve Başlat
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupWizard;
