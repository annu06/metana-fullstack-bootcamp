// Database seeding script
// This is a placeholder for Module 6 backend integration

const { connectDB } = require('../db/dbconn');

const seedDatabase = async () => {
  try {
    console.log('Seeding database with initial data...');
    
    // Connect to database
    const connected = await connectDB();
    
    if (connected) {
      console.log('Database seeding completed successfully');
      console.log('Note: This is a placeholder. Full database seeding will be integrated from Module 6');
      
      // Sample data that would be inserted
      console.log('Sample data structure:');
      console.log('- Users table with admin user');
      console.log('- Blogs table with sample blog posts');
      console.log('- Categories table with blog categories');
    } else {
      console.error('Failed to seed database');
    }
  } catch (error) {
    console.error('Database seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };