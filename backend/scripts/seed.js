const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('--- Checking Database Seeds ---');

        // 1. Ensure System Settings exist and Setup is Complete
        const settingsCheck = await db.query('SELECT * FROM system_settings WHERE id = 1');
        if (settingsCheck.rows.length === 0) {
            await db.query(`
                INSERT INTO system_settings (id, is_setup_completed, hospital_name, hl7_port)
                VALUES (1, TRUE, 'Akıllı Hastane', 2575)
            `);
            console.log('✔ System Settings created (Setup Completed).');
        } else {
            // Force setup completed if it was false
            if (!settingsCheck.rows[0].is_setup_completed) {
                await db.query('UPDATE system_settings SET is_setup_completed = TRUE WHERE id = 1');
                console.log('✔ System Settings updated to COMPLETED.');
            }
        }

        // 2. Ensure Admin User Exists
        const userCheck = await db.query("SELECT * FROM users WHERE username = 'admin'");
        if (userCheck.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt); // Default Password: admin123

            await db.query(`
                INSERT INTO users (username, password_hash, role, full_name)
                VALUES ($1, $2, $3, $4)
            `, ['admin', hash, 'admin', 'System Administrator']);
            console.log('✔ Default Admin user created (Pass: admin123).');
        } else {
            console.log('✔ Admin user already exists.');
        }

        console.log('--- Seeding Completed ---');
    } catch (err) {
        console.error('Seeding Error:', err);
    }
};

module.exports = seedData;
