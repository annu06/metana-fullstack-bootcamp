const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');

// Sample users
const users = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    profile: {
      bio: 'A motivated individual who loves organizing tasks',
      preferences: {
        defaultMood: 'motivated',
        notifications: true,
        theme: 'light'
      }
    }
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    profile: {
      bio: 'Creative professional balancing work and life',
      preferences: {
        defaultMood: 'calm',
        notifications: false,
        theme: 'dark'
      }
    }
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      bio: 'System administrator',
      preferences: {
        defaultMood: 'focused',
        notifications: true,
        theme: 'system'
      }
    }
  }
];

// Sample tasks
const generateTasks = (userIds) => {
  const moods = ['happy', 'sad', 'excited', 'calm', 'anxious', 'angry', 'motivated', 'tired'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const categories = ['work', 'personal', 'health', 'social', 'learning', 'other'];
  const statuses = ['pending', 'in-progress', 'completed'];

  const tasks = [];

  // Create tasks for each user
  userIds.forEach((userId, userIndex) => {
    // Create 15-20 tasks per user
    const taskCount = 15 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < taskCount; i++) {
      const daysFromNow = Math.floor(Math.random() * 30) - 10; // -10 to +20 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysFromNow);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isCompleted = status === 'completed';
      
      const task = {
        _id: new mongoose.Types.ObjectId(),
        title: `Task ${i + 1} for ${userIndex === 0 ? 'John' : userIndex === 1 ? 'Jane' : 'Admin'}`,
        description: `This is a sample task description for task ${i + 1}. It demonstrates various moods and priorities.`,
        mood: moods[Math.floor(Math.random() * moods.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        status: status,
        dueDate: Math.random() > 0.3 ? dueDate : undefined, // 70% chance of having due date
        completedAt: isCompleted ? new Date() : undefined,
        estimatedDuration: 30 + Math.floor(Math.random() * 120), // 30-150 minutes
        actualDuration: isCompleted ? 30 + Math.floor(Math.random() * 150) : undefined,
        tags: generateRandomTags(),
        user: userId,
        reminder: {
          enabled: Math.random() > 0.6, // 40% chance
          datetime: daysFromNow > 0 ? new Date(dueDate.getTime() - 24 * 60 * 60 * 1000) : undefined, // 1 day before due
          sent: false
        },
        subtasks: generateSubtasks(),
        metadata: {
          createdFrom: ['web', 'mobile', 'api'][Math.floor(Math.random() * 3)],
          source: 'seeder',
          version: 1
        }
      };

      tasks.push(task);
    }
  });

  return tasks;
};

const generateRandomTags = () => {
  const allTags = ['urgent', 'important', 'quick', 'research', 'meeting', 'creative', 'routine', 'planning', 'review', 'follow-up'];
  const numTags = Math.floor(Math.random() * 4); // 0-3 tags
  const tags = [];
  
  for (let i = 0; i < numTags; i++) {
    const tag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags;
};

const generateSubtasks = () => {
  const numSubtasks = Math.floor(Math.random() * 4); // 0-3 subtasks
  const subtasks = [];
  
  for (let i = 0; i < numSubtasks; i++) {
    const isCompleted = Math.random() > 0.5;
    subtasks.push({
      title: `Subtask ${i + 1}`,
      completed: isCompleted,
      completedAt: isCompleted ? new Date() : undefined
    });
  }
  
  return subtasks;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mood-todo';
    await mongoose.connect(MONGODB_URI);
    console.log('📊 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Task.deleteMany({});

    // Hash passwords for users
    console.log('🔐 Preparing user data...');
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Insert users
    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Generate and insert tasks
    console.log('📋 Generating tasks...');
    const userIds = createdUsers.map(user => user._id);
    const tasks = generateTasks(userIds);
    
    console.log('📝 Creating tasks...');
    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📋 Tasks: ${createdTasks.length}`);
    
    // Display user details
    console.log('\n👥 Created Users:');
    createdUsers.forEach((user, index) => {
      const userTasks = createdTasks.filter(task => task.user.toString() === user._id.toString());
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${userTasks.length} tasks`);
    });

    // Display task statistics
    console.log('\n📊 Task Statistics:');
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    taskStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    const moodStats = await Task.aggregate([
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n😊 Mood Distribution:');
    moodStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('  📧 john@example.com / password123');
    console.log('  📧 jane@example.com / password123');
    console.log('  📧 admin@example.com / admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  users,
  generateTasks
};