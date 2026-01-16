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
        <div className={`w-screen h-screen flex flex-col justify-between items-center text-white transition-colors duration-500 overflow-hidden ${getTheme()} p-4 md:p-12`}>

            {/* Header: Room Status */}
            <div className="w-full flex justify-center items-start pt-4">
                <div className="text-2xl md:text-5xl font-bold uppercase tracking-[0.2em] opacity-90 text-center bg-black/20 px-8 py-2 rounded-full backdrop-blur-sm shadow-sm border border-white/10">
                    {roomData.status === 'Normal' ? 'Oda Bilgisi' : roomData.status}
                </div>
            </div>

            {/* Main Content: Icons & Patient Name */}
            <div className="flex-1 flex flex-col items-center justify-center w-full gap-6 md:gap-12 animate-fade-in">
                {/* Dynamic Status Icons */}
                {roomData.status === 'Bebek' && (
                    <div className="bg-white/20 p-6 rounded-full backpack-blur-md animate-bounce">
                        <Baby className="w-24 h-24 md:w-48 md:h-48 text-white drop-shadow-2xl" strokeWidth={1.5} />
                    </div>
                )}
                {roomData.status === 'Ameliyatta' && (
                    <div className="bg-white/20 p-6 rounded-full backpack-blur-md animate-pulse">
                        <Activity className="w-24 h-24 md:w-48 md:h-48 text-white drop-shadow-2xl" strokeWidth={1.5} />
                    </div>
                )}

                {/* Patient Name - Responsive Typography */}
                <h1 className="text-5xl md:text-[8vw] font-black leading-tight text-center drop-shadow-2xl max-w-full break-words px-4">
                    {roomData.patientName || 'BOŞ'}
                </h1>
            </div>

            {/* Footer: Doctor Info */}
            <div className="w-full flex flex-col items-center justify-end pb-4 gap-2">
                <div className="text-xl md:text-4xl font-medium tracking-wide opacity-90 bg-black/20 px-10 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                    {roomData.doctorName}
                </div>

                {/* Visual Connection Indicator (Subtle) */}
                <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${connected ? 'text-green-400 opacity-60' : 'text-red-400 opacity-90'}`}>
                    {connected ? 'Sistem Çevrimiçi' : 'Bağlantı Yok'}
                </div>
            </div>
        </div>
    );
};

export default RoomScreen;
