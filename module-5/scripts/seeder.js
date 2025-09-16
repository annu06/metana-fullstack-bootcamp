const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const Task = require('./models/Task');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mood-todo-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Sample data
const users = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
        preferences: {
            defaultMood: 'focused',
            timezone: 'UTC'
        }
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: '123456',
        preferences: {
            defaultMood: 'energetic',
            timezone: 'UTC'
        }
    }
];

const tasks = [
    {
        title: 'Morning Run',
        description: 'Start the day with a refreshing 5km run',
        duration: '30 mins',
        time: '06:00 AM',
        status: 'backlog',
        priority: 'high',
        mood: 'energetic',
        tags: ['exercise', 'morning', 'cardio']
    },
    {
        title: 'Meditation',
        description: 'Mindfulness practice to center thoughts',
        duration: '15 mins',
        time: '07:00 AM',
        status: 'backlog',
        priority: 'medium',
        mood: 'calm',
        tags: ['wellness', 'mindfulness']
    },
    {
        title: 'Read Programming Book',
        description: 'Continue reading JavaScript: The Good Parts',
        duration: '45 mins',
        time: '08:00 PM',
        status: 'in-progress',
        priority: 'medium',
        mood: 'focused',
        tags: ['learning', 'programming', 'books']
    },
    {
        title: 'Write Blog Post',
        description: 'Draft article about React hooks',
        duration: '60 mins',
        time: '02:00 PM',
        status: 'backlog',
        priority: 'high',
        mood: 'focused',
        tags: ['writing', 'tech', 'blog']
    },
    {
        title: 'Call Family',
        description: 'Weekly catch-up call with parents',
        duration: '20 mins',
        time: '07:00 PM',
        status: 'completed',
        priority: 'high',
        mood: 'happy',
        tags: ['family', 'social']
    }
];

// Import into DB
const importData = async () => {
    try {
        await Task.deleteMany();
        await User.deleteMany();

        const createdUsers = await User.create(users);
        console.log('Users imported...'.green.inverse);

        // Add user reference to tasks
        const tasksWithUser = tasks.map(task => ({
            ...task,
            user: createdUsers[0]._id // Assign to first user
        }));

        await Task.create(tasksWithUser);
        console.log('Tasks imported...'.green.inverse);

        process.exit();
    } catch (err) {
        console.error(err);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await Task.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}