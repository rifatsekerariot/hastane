import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Monitor, Plus, Check, Link as LinkIcon, Users, Settings, LogOut, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/apiConfig';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users, settings
    const [loading, setLoading] = useState(false);

    // Data States
    const [rooms, setRooms] = useState([]);
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);

    // Forms
    const [newRoom, setNewRoom] = useState({ roomNumber: '', department: '' });
    const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'viewer' });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const getAuthHeader = () => ({
        headers: { Authorization: localStorage.getItem('token') }
    });

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const fetchData = async () => {
        setLoading(true);
        const apiUrl = getApiUrl();
        try {
            if (activeTab === 'dashboard') {
                const [roomsRes, devicesRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/admin/rooms`, getAuthHeader()),
                    axios.get(`${apiUrl}/api/admin/devices`, getAuthHeader())
                ]);
                setRooms(roomsRes.data);
                setDevices(devicesRes.data);
            } else if (activeTab === 'users') {
                const usersRes = await axios.get(`${apiUrl}/api/users`, getAuthHeader());
                setUsers(usersRes.data);
            }
        } catch (error) {
            console.error('Error fetching data', error);
            if (error.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    // --- Action Handlers ---

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${getApiUrl()}/api/admin/rooms`, newRoom, getAuthHeader());
            setNewRoom({ roomNumber: '', department: '' });
            fetchData();
        } catch (error) { alert('Oda eklenemedi'); }
    };

    const handleCreateDevice = async (roomNumber) => {
        const name = prompt('Cihaz Adı Girin (Örn: iPad 1):');
        if (!name) return;
        try {
            await axios.post(`${getApiUrl()}/api/admin/devices`, { deviceName: name, roomNumber }, getAuthHeader());
            fetchData();
        } catch (error) { alert('Cihaz eklenemedi'); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${getApiUrl()}/api/users`, newUser, getAuthHeader());
            setNewUser({ username: '', password: '', fullName: '', role: 'viewer' });
            fetchData();
        } catch (error) { alert(error.response?.data?.msg || 'Kullanıcı eklenemedi'); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await axios.delete(`${getApiUrl()}/api/users/${id}`, getAuthHeader());
            fetchData();
        } catch (error) { alert(error.response?.data?.msg || 'Silinemedi'); }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">

            {/* Sidebar */}
            <div className="w-64 bg-slate-800 flex flex-col border-r border-slate-700">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Monitor className="text-blue-500" /> Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                    >
                        <Monitor size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                    >
                        <Users size={20} /> Kullanıcılar
                    </button>
                    {/* Settings Tab Placeholder */}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button onClick={logout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
                        <LogOut size={20} /> Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Rooms */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Monitor size={20} /> Odalar</h2>
                            <form onSubmit={handleCreateRoom} className="flex gap-2 mb-6">
                                <input placeholder="Oda No" className="bg-slate-700 p-2 rounded w-1/3 outline-none focus:ring-2 ring-blue-500" value={newRoom.roomNumber} onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })} required />
                                <input placeholder="Bölüm" className="bg-slate-700 p-2 rounded w-1/3 outline-none focus:ring-2 ring-blue-500" value={newRoom.department} onChange={e => setNewRoom({ ...newRoom, department: e.target.value })} />
                                <button className="bg-green-600 hover:bg-green-700 p-2 rounded text-white flex-1 flex justify-center items-center"><Plus size={20} /> Ekle</button>
                            </form>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {rooms.map(room => (
                                    <div key={room.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center group hover:bg-slate-700 transition-all">
                                        <div><div className="font-bold">{room.room_number}</div><div className="text-sm text-slate-400">{room.department}</div></div>
                                        <button onClick={() => handleCreateDevice(room.room_number)} className="text-blue-400 hover:bg-blue-500/20 p-2 rounded-full" title="Tablet Ekle"><Plus size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Devices */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h2 className="text-xl font-semibold mb-6">Aktif Cihazlar</h2>
                            <div className="space-y-3">
                                {devices.map(device => (
                                    <div key={device.id} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-3"><Monitor className="text-green-500" /><div><div className="font-medium">{device.device_name}</div><div className="text-xs text-slate-400">Oda: {device.room_number}</div></div></div>
                                        <a href={`/room/${device.token}`} target="_blank" rel="noreferrer" className="text-xs bg-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-500 flex items-center gap-1"><LinkIcon size={12} /> Aç</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 mb-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="text-green-400" /> Yeni Kullanıcı Ekle</h2>
                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Kullanıcı Adı" className="bg-slate-700 p-3 rounded outline-none focus:ring-2 ring-blue-500" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required />
                                <input placeholder="Ad Soyad" className="bg-slate-700 p-3 rounded outline-none focus:ring-2 ring-blue-500" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                                <input type="password" placeholder="Şifre" className="bg-slate-700 p-3 rounded outline-none focus:ring-2 ring-blue-500" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                <select className="bg-slate-700 p-3 rounded outline-none" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="viewer">İzleyici (Viewer)</option>
                                    <option value="admin">Yönetici (Admin)</option>
                                </select>
                                <button className="md:col-span-2 bg-blue-600 hover:bg-blue-700 py-3 rounded font-bold transition-colors">Kullanıcı Oluştur</button>
                            </form>
                        </div>

                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-700/50 text-slate-300">
                                    <tr>
                                        <th className="p-4">Kullanıcı</th>
                                        <th className="p-4">Rol</th>
                                        <th className="p-4">Son Giriş</th>
                                        <th className="p-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium">{user.username}</div>
                                                <div className="text-sm text-slate-400">{user.full_name}</div>
                                            </td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'}`}>{user.role}</span></td>
                                            <td className="p-4 text-slate-400 text-sm">{user.last_login ? new Date(user.last_login).toLocaleString('tr-TR') : '-'}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:bg-red-400/20 p-2 rounded-full transition-colors"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
