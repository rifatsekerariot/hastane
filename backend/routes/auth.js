const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_ChangeMeInProd';

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Simple Validation
    if (!username || !password) {
        return res.status(400).json({ msg: 'Lütfen kullanıcı adı ve şifre giriniz' });
    }

    try {
        // Check for existing user
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
        }

        // Create token payload
        const payload = {
            id: user.id,
            role: user.role,
            full_name: user.full_name
        };

        // Sign token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '12h' },
            (err, token) => {
                if (err) throw err;

                // Update last login
                db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

                // Set HttpOnly Cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // true in HTTPS
                    sameSite: 'strict', // Protect against CSRF
                    maxAge: 12 * 60 * 60 * 1000 // 12 hours
                });

                res.json({
                    msg: 'Giriş Başarılı',
                    user: payload
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, role, full_name, created_at, last_login FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/logout
// @desc    Clear auth cookie
// @access  Public
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ msg: 'Çıkış yapıldı' });
});

module.exports = router;
