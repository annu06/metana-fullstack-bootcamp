// PostgreSQL connection using pg
const { Pool } = require('pg');
const { 
    DB_USER, 
    DB_HOST, 
    DB_NAME, 
    DB_PASSWORD, 
    DB_PORT 
} = require('../config');

// Create a connection pool
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
    max: 20, // Maximum number of clients in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
});

// Test the connection
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully');
        
        // Test query to verify connection
        const result = await client.query('SELECT NOW()');
        console.log('📅 Database time:', result.rows[0].now);
        
        client.release();
    } catch (err) {
        console.error('❌ PostgreSQL connection error:', err.message);
        process.exit(1);
    }
};

// Export both the pool and connection function
module.exports = {
    pool,
    connectDB
};
