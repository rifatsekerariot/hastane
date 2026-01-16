import { getApiUrl } from '../utils/apiConfig';

const fetchData = async () => {
    try {
        const apiUrl = getApiUrl();
        const [roomsRes, devicesRes] = await Promise.all([
            axios.get(`${apiUrl}/api/admin/rooms`),
            axios.get(`${apiUrl}/api/admin/devices`)
        ]);
        setRooms(roomsRes.data);
        setDevices(devicesRes.data);
    } catch (error) {
        console.error('Error fetching data', error);
    }
};

const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
        const apiUrl = getApiUrl();
        await axios.post(`${apiUrl}/api/admin/rooms`, newRoom);
        setNewRoom({ roomNumber: '', department: '' });
        fetchData();
    } catch (error) {
        alert('Hata oluştu');
    }
};

const handleCreateDevice = async (roomNumber) => {
    const name = prompt('Cihaz Adı Girin (Örn: iPad 1):');
    if (!name) return;
    try {
        const apiUrl = getApiUrl();
        await axios.post(`${apiUrl}/api/admin/devices`, {
            deviceName: name,
            roomNumber
        });
        fetchData();
    } catch (error) {
        alert('Cihaz eklenemedi');
    }
};

return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Monitor /> Yönetim Paneli
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Room List */}
            <div className="bg-slate-800 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Odalar</h2>

                {/* New Room Form */}
                <form onSubmit={handleCreateRoom} className="flex gap-2 mb-6">
                    <input
                        placeholder="Oda No (101)"
                        className="bg-slate-700 p-2 rounded w-1/3 outline-none"
                        value={newRoom.roomNumber}
                        onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    />
                    <input
                        placeholder="Bölüm"
                        className="bg-slate-700 p-2 rounded w-1/3 outline-none"
                        value={newRoom.department}
                        onChange={e => setNewRoom({ ...newRoom, department: e.target.value })}
                    />
                    <button className="bg-green-600 hover:bg-green-700 p-2 rounded text-white flex-1 flex justify-center items-center">
                        <Plus size={20} /> Ekle
                    </button>
                </form>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {rooms.map(room => (
                        <div key={room.id} className="bg-slate-700/50 p-4 rounded flex justify-between items-center group hover:bg-slate-700 transition">
                            <div>
                                <div className="font-bold text-lg">{room.room_number}</div>
                                <div className="text-sm text-slate-400">{room.department}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCreateDevice(room.room_number)}
                                    className="text-blue-400 hover:bg-blue-400/20 p-2 rounded-full"
                                    title="Tablet Ekle"
                                >
                                    <Monitor size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Device List & Links */}
            <div className="bg-slate-800 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Aktif Cihazlar</h2>
                <div className="space-y-3">
                    {devices.map(device => (
                        <div key={device.id} className="bg-slate-700 p-4 rounded flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Monitor className="text-green-500" />
                                <div>
                                    <div className="font-medium">{device.device_name}</div>
                                    <div className="text-xs text-slate-400">Oda: {device.room_number}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/room/${device.token}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs bg-slate-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-500"
                                >
                                    <LinkIcon size={12} /> Ekranı Aç
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
};

export default AdminPanel;
