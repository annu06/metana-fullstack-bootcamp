const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'module6_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing PostgreSQL database...');
        
        // Read the setup SQL file
        const setupSqlPath = path.join(__dirname, 'setup-db.sql');
        const setupSql = fs.readFileSync(setupSqlPath, 'utf8');
        
        // Execute the setup SQL
        await pool.query(setupSql);
        
        console.log('✅ Database initialized successfully!');
        console.log('📊 Created tables: users, blogs');
        console.log('🔗 Established foreign key relationships');
        console.log('📈 Added indexes for performance');
        console.log('⚡ Set up automatic timestamp triggers');
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;