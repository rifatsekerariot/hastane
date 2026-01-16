import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Activity, XCircle, Baby, CheckCircle } from 'lucide-react';

const socket = io('http://localhost:3005'); // Backend URL

const RoomScreen = () => {
    const { deviceToken } = useParams(); // URL parameter for device binding
    const [roomData, setRoomData] = useState({
        status: 'Normal', // Normal, Temizlik, Ameliyatta, Bebek, KirmiziKod, MaviKod...
        patientName: '-',
        doctorName: 'Dr. -'
    });
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            setConnected(true);
            socket.emit('join_room', { deviceToken });
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('room_update', (data) => {
            console.log('Update received:', data);
            setRoomData(prev => ({ ...prev, ...data }));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('room_update');
        };
    }, [deviceToken]);

    // Theme Logic
    const getTheme = () => {
        switch (roomData.status?.toLowerCase()) {
            case 'temizlik': return 'bg-yellow-600';
            case 'ameliyatta': return 'bg-red-700 animate-pulse';
            case 'bebek': return 'bg-pink-500';
            case 'mavikod': return 'bg-blue-800 animate-pulse';
            default: return 'bg-slate-900';
        }
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center text-white transition-colors duration-500 ${getTheme()}`}>

            {/* Status Header */}
            <div className="absolute top-10 text-4xl font-bold uppercase tracking-widest opacity-80">
                {roomData.status === 'Normal' ? 'Oda Bilgisi' : roomData.status}
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center gap-8">
                {roomData.status === 'Bebek' && <Baby size={120} className="text-white drop-shadow-lg" />}
                {roomData.status === 'Ameliyatta' && <Activity size={120} className="text-white drop-shadow-lg" />}

                <h1 className="text-7xl font-black drop-shadow-xl p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                    {roomData.patientName || 'BOŞ'}
                </h1>

                <div className="text-2xl mt-4 font-light opacity-90">
                    {roomData.doctorName}
                </div>
            </div>

            {/* Footer / Connection Status */}
            <div className={`absolute bottom-5 right-5 w-4 h-4 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} title={connected ? "Online" : "Offline"} />
        </div>
    );
};

export default RoomScreen;
