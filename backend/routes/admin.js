const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

// Secure all admin routes
router.use(auth);

// --- Rooms ---
router.get('/rooms', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM rooms ORDER BY room_number');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/rooms', async (req, res) => {
    const { roomNumber, department, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO rooms (room_number, department, description) VALUES ($1, $2, $3) RETURNING *',
            [roomNumber, department, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Devices ---
router.get('/devices', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT d.*, r.room_number 
            FROM devices d 
            LEFT JOIN rooms r ON d.room_id = r.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/devices', async (req, res) => {
    const { deviceName, roomNumber } = req.body; // roomNumber used to bind
    try {
        // Find room
        const roomRes = await db.query('SELECT id FROM rooms WHERE room_number = $1', [roomNumber]);
        if (roomRes.rowCount === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const token = uuidv4();
        const result = await db.query(
            'INSERT INTO devices (device_name, room_id, token) VALUES ($1, $2, $3) RETURNING *',
            [deviceName, roomRes.rows[0].id, token]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
