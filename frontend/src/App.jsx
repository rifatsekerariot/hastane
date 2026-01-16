import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoomScreen from './components/RoomScreen';
import SetupWizard from './components/SetupWizard';
import AdminPanel from './components/AdminPanel';

import Login from './components/Login';
import RequireAuth from './components/RequireAuth';

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/" element={<Navigate to="/setup" replace />} />
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/room/:deviceToken" element={<RoomScreen />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Admin Routes */}
                <Route element={<RequireAuth />}>
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
