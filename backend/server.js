require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const seedData = require('./scripts/seed');

// Initialize App
const app = express();

// Run Seeds
seedData();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all for now, tighten in production
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: '*', // Allow all origins to rule out CORS issues
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/setup', require('./routes/setup'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
    res.send('Hospital Info Screen Backend Running');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Socket.io Connection Logic
require('./services/socketService')(io);

// HL7 Listener Initialization
const hl7Listener = require('./services/hl7Listener');
hl7Listener.start(io);

const PORT = process.env.PORT || 3005;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
