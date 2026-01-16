import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoomScreen from './components/RoomScreen';
import SetupWizard from './components/SetupWizard';
import AdminPanel from './components/AdminPanel';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/setup" replace />} />
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/room/:deviceToken" element={<RoomScreen />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
