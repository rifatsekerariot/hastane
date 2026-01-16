const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const setupDatabase = async () => {
    try {
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema...');
        await db.query(schemaSql);
        console.log('Database schema initialization successful.');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

setupDatabase();
