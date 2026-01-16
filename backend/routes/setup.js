const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Need to install this

// Check if setup is completed
router.get('/status', async (req, res) => {
    try {
        const result = await db.query('SELECT is_setup_completed FROM system_settings WHERE id = 1');
        if (result.rows.length > 0) {
            res.json({ isSetupCompleted: result.rows[0].is_setup_completed });
        } else {
            res.json({ isSetupCompleted: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Perform Initial Setup
router.post('/initialize', async (req, res) => {
    const { hospitalName, adminPassword, hl7Port } = req.body;

    if (!adminPassword) {
        return res.status(400).json({ error: 'Admin password is required' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(adminPassword, salt);

        await db.query(`
            UPDATE system_settings 
            SET hospital_name = $1, admin_password_hash = $2, hl7_port = $3, is_setup_completed = TRUE
            WHERE id = 1
        `, [hospitalName, hash, hl7Port || 2575]);

        res.json({ success: true, message: 'System setup completed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Setup failed' });
    }
});

module.exports = router;
