const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config');

async function initializeDatabase() {
  const pool = new Pool(config.database);
  
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Read the SQL setup file
    const sqlFilePath = path.join(__dirname, 'setup-db.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing database setup script...');
    
    // Execute the SQL commands
    await pool.query(sqlContent);
    
    console.log('✅ Database initialized successfully!');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - blogs');
    console.log('Indexes and triggers created successfully.');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;