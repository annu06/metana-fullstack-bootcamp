const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Module 6 Setup...');
console.log('================================');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'config.js',
  '.env',
  'example.env',
  '.gitignore',
  'index.js',
  'README.md',
  'db/dbconn.js',
  'db/userQueries.js',
  'db/blogQueries.js',
  'routes/userRouter.js',
  'routes/blogsRouter.js',
  'scripts/setup-db.sql',
  'scripts/initDb.js',
  'scripts/seedDb.js'
];

let allFilesExist = true;

console.log('📁 Checking file structure:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n📦 Checking dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'pg', 'cors', 'dotenv'];
  
  requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
  });
} catch (error) {
  console.log('  ❌ Error reading package.json');
}

console.log('\n🔧 Checking configuration:');
try {
  require('dotenv').config();
  const config = require('./config');
  console.log('  ✅ Configuration loaded successfully');
  console.log(`  📍 Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
  console.log(`  🌐 Server port: ${config.server.port}`);
} catch (error) {
  console.log('  ❌ Configuration error:', error.message);
}

console.log('\n📋 Setup Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('✅ Project structure is correct');
  console.log('\n🚀 Next steps:');
  console.log('1. Install PostgreSQL if not already installed');
  console.log('2. Create a database named "module6_db"');
  console.log('3. Update .env file with your PostgreSQL credentials');
  console.log('4. Run: npm run db:init');
  console.log('5. Run: npm run db:seed (optional)');
  console.log('6. Run: npm start');
} else {
  console.log('❌ Some files are missing. Please check the setup.');
}

console.log('\n📚 For detailed instructions, see README.md');
console.log('================================');