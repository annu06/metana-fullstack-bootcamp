const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    // Connect to postgres database first to create our target database
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default postgres database
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Check if database exists
        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME]
        );

        if (result.rows.length === 0) {
            // Create database
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`✅ Database "${process.env.DB_NAME}" created successfully!`);
        } else {
            console.log(`ℹ️  Database "${process.env.DB_NAME}" already exists`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createDatabase();