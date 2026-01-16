const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const seedData = require('./scripts/seed');

// Initialize App
const app = express();

// Security Middleware
app.use(helmet()); // Secure Headers
app.use(cookieParser()); // Parse Cookies

// Rate Limiting (Prevent DDoS/Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Trust Proxy (Required for Nginx + Rate Limit)
app.set('trust proxy', 1);

// CORS Config (Allow Credentials for Cookies)
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'https://hastane.fikirbizden.com',
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.fikirbizden.com')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Important for Cookies
};

app.use(cors(corsOptions));
app.use(express.json());

// Run Seeds
seedData();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Socket.io handles own CORS, keep lenient or match express
        methods: ["GET", "POST"]
    }
});

// Routes
app.use('/api/setup', require('./routes/setup'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
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
