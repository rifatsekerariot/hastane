require('dotenv').config();
const { Client } = require('pg');

const createDatabase = async () => {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default DB
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();

        const dbName = process.env.DB_NAME || 'hospital_db';
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`Database ${dbName} not found. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
};

createDatabase();
