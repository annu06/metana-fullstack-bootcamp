const pool = require('../db/dbconn');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read and execute the SQL setup file
    const sqlFilePath = path.join(__dirname, 'setup-db.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL commands by semicolon and execute each one
    const sqlCommands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const command of sqlCommands) {
      if (command.trim()) {
        await pool.query(command);
      }
    }
    
    console.log('Database initialized successfully!');
    console.log('Tables created:');
    console.log('- users');
    console.log('- blogs');
    
  } catch (error) {
    console.error('Error initializing database:', error);
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