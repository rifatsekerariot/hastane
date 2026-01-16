const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// @route   GET api/settings
// @desc    Get system settings
// @access  Admin
router.get('/', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Erişim reddedildi' });
        }
        const result = await db.query('SELECT hospital_name, hl7_port, socket_port FROM system_settings WHERE id = 1');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/settings
// @desc    Update system settings
// @access  Admin
router.put('/', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Erişim reddedildi' });
        }

        const { hospitalName, hl7Port } = req.body;

        await db.query(
            'UPDATE system_settings SET hospital_name = $1, hl7_port = $2, updated_at = NOW() WHERE id = 1',
            [hospitalName, hl7Port]
        );

        res.json({ msg: 'Ayarlar güncellendi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
