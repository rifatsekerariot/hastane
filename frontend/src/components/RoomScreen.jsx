import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Activity, XCircle, Baby, CheckCircle } from 'lucide-react';

import { getApiUrl } from '../utils/apiConfig';

const socket = io(getApiUrl());

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
            <div className="absolute top-6 md:top-10 text-xl md:text-4xl font-bold uppercase tracking-widest opacity-80 text-center px-4">
                {roomData.status === 'Normal' ? 'Oda Bilgisi' : roomData.status}
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center gap-4 md:gap-8 w-full px-4">
                {roomData.status === 'Bebek' && <Baby className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-lg" />}
                {roomData.status === 'Ameliyatta' && <Activity className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-lg" />}

                <h1 className="text-4xl md:text-7xl font-black drop-shadow-xl p-4 md:p-6 bg-black/20 rounded-xl backdrop-blur-sm text-center w-full max-w-4xl break-words">
                    {roomData.patientName || 'BOŞ'}
                </h1>

                <div className="text-lg md:text-2xl mt-4 font-light opacity-90 text-center">
                    {roomData.doctorName}
                </div>
            </div>

            {/* Footer / Connection Status */}
            <div className={`absolute bottom-5 right-5 w-4 h-4 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} title={connected ? "Online" : "Offline"} />
        </div>
    );
};

export default RoomScreen;
