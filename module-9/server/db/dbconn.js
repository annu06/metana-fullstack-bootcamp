// dbconn.js - DB connection setup
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
	connectionString: process.env.DB_URL || config.DB_URL,
});

module.exports = pool;
