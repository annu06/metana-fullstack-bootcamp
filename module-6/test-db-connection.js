const { Pool } = require('pg');
const config = require('./config');

async function testDatabaseConnection() {
  console.log('🔍 Testing PostgreSQL Connection...');
  console.log('=====================================');
  
  console.log('📋 Connection Details:');
  console.log(`  Host: ${config.database.host}`);
  console.log(`  Port: ${config.database.port}`);
  console.log(`  Database: ${config.database.database}`);
  console.log(`  User: ${config.database.user}`);
  console.log(`  Password: ${'*'.repeat(config.database.password.length)}`);
  
  const pool = new Pool(config.database);
  
  try {
    console.log('\n🔌 Attempting to connect...');
    const client = await pool.connect();
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query test successful!');
    console.log(`📅 Current time: ${result.rows[0].current_time}`);
    console.log(`🗄️  PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]}`);
    
    client.release();
    
    console.log('\n🎉 Database connection test PASSED!');
    console.log('✅ You can now run: npm run db:init');
    
  } catch (error) {
    console.log('\n❌ Database connection test FAILED!');
    console.log(`Error: ${error.message}`);
    
    if (error.code === '28P01') {
      console.log('\n💡 Solution: Password authentication failed');
      console.log('   1. Check your PostgreSQL password');
      console.log('   2. Update the DB_PASSWORD in your .env file');
      console.log('   3. Make sure PostgreSQL service is running');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Connection refused');
      console.log('   1. Make sure PostgreSQL is installed and running');
      console.log('   2. Check if the service is started');
      console.log('   3. Verify the host and port settings');
    } else if (error.code === '3D000') {
      console.log('\n💡 Solution: Database does not exist');
      console.log('   1. Create the database: CREATE DATABASE module6_db;');
      console.log('   2. Use pgAdmin or psql command line');
    }
    
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();