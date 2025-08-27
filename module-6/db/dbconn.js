const { Pool } = require('pg');
const config = require('../config');

// Create a connection pool
const pool = new Pool(config.database);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Function to test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
}

// Function to execute queries
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
}

// Function to get a client from the pool
async function getClient() {
  return await pool.connect();
}

// Function to close the pool
async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool
};