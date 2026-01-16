const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const auth = require('../middleware/auth');

// All routes here require Authorization
router.use(auth);

// @route   GET api/users
// @desc    Get all users
// @access  Admin only
router.get('/', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Erişim reddedildi' });
        }
        const result = await db.query('SELECT id, username, role, full_name, last_login, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users
// @desc    Create a new user
// @access  Admin only
router.post('/', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Erişim reddedildi' });
    }

    const { username, password, role, fullName } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Kullanıcı adı ve şifre gereklidir' });
    }

    try {
        // Check existing
        const userCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ msg: 'Bu kullanıcı adı zaten alınmış' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO users (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, role, full_name',
            [username, hash, role || 'viewer', fullName]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/:id', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Erişim reddedildi' });
    }

    // Prevent deleting self or the main admin if wanted (optional safeguard)
    if (req.params.id === req.user.id) {
        return res.status(400).json({ msg: 'Kendinizi silemezsiniz' });
    }

    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ msg: 'Kullanıcı silindi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
