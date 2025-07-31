const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URI:', config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    // Set a connection timeout
    const conn = await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('📝 Error Details:', error.message);
    console.log('\n🔧 Setup Instructions:');
    console.log('1. 🌐 For MongoDB Atlas (Recommended):');
    console.log('   - Create account at https://www.mongodb.com/atlas');
    console.log('   - Create a cluster and get connection string');
    console.log('   - Update MONGODB_URI in .env file');
    console.log('\n2. 💻 For Local MongoDB:');
    console.log('   - Install MongoDB Community Server');
    console.log('   - Start MongoDB service');
    console.log('   - Use: mongodb://localhost:27017/module5_db');
    console.log('\n3. 🧪 For Testing:');
    console.log('   - You can test API endpoints without database');
    console.log('   - Some operations will fail but structure is complete');
    
    // Don't exit in development mode, just warn
    if (config.NODE_ENV === 'development') {
      console.log('\n⚠️  Continuing without database connection for development...');
      return null;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;