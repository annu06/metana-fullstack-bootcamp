// PostgreSQL seeder for module-6
// Replaces the previous MongoDB seeder and provides -i (import) and -d (delete) modes.
const { pool } = require('../db/dbconn');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Sample data (users, tasks simplified for postgres schema)
const users = [
    { name: 'John Doe', email: 'john@example.com', password: '123456' },
    { name: 'Jane Smith', email: 'jane@example.com', password: '123456' },
];

const tasks = [
    { title: 'Morning Run', description: 'Start the day with a refreshing 5km run', duration: '30 mins', time: '06:00 AM', status: 'backlog', priority: 'high', mood: 'energetic' },
    { title: 'Meditation', description: 'Mindfulness practice to center thoughts', duration: '15 mins', time: '07:00 AM', status: 'backlog', priority: 'medium', mood: 'calm' },
    { title: 'Read Programming Book', description: 'Continue reading a programming book', duration: '45 mins', time: '08:00 PM', status: 'in-progress', priority: 'medium', mood: 'focused' },
];

async function importData() {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding PostgreSQL database (module-6)');

        await client.query('BEGIN');

        // Ensure tables exist by running setup SQL if present
        const setupPath = path.join(__dirname, 'setup-db.sql');
        if (fs.existsSync(setupPath)) {
            const setupSql = fs.readFileSync(setupPath, 'utf8');
            await client.query(setupSql);
            console.log('🔧 Executed setup-db.sql');
        }

        // Delete existing rows
        await client.query('DELETE FROM tasks');
        await client.query('DELETE FROM users');

        // Reset sequences if present
        try {
            await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
            await client.query("ALTER SEQUENCE tasks_id_seq RESTART WITH 1");
        } catch (e) {
            // sequences may not exist depending on schema naming, ignore safely
        }

        // Insert users with hashed passwords
        const createdUsers = [];
        for (const u of users) {
            const hashed = await bcrypt.hash(u.password, 12);
            const res = await client.query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
                [u.name, u.email, hashed]
            );
            createdUsers.push(res.rows[0]);
        }

        // Insert tasks associated to first user by default
        for (const t of tasks) {
            const userId = createdUsers[0].id;
            await client.query(
                'INSERT INTO tasks (title, description, duration, time, status, priority, mood, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
                [t.title, t.description, t.duration, t.time, t.status, t.priority, t.mood, userId]
            );
        }

        await client.query('COMMIT');
        console.log('✅ Seeding completed');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', err.message || err);
        throw err;
    } finally {
        client.release();
    }
}

async function deleteData() {
    const client = await pool.connect();
    try {
        console.log('🗑️  Removing seeded data from PostgreSQL (module-6)');
        await client.query('BEGIN');
        await client.query('DELETE FROM tasks');
        await client.query('DELETE FROM users');
        await client.query('COMMIT');
        console.log('✅ Data removal completed');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Removal failed:', err.message || err);
        throw err;
    } finally {
        client.release();
    }
}

// CLI support to mimic previous behavior: -i to import, -d to delete
if (require.main === module) {
    const cmd = process.argv[2];
    if (cmd === '-i') {
        importData().catch((err) => { console.error(err); process.exit(1); });
    } else if (cmd === '-d') {
        deleteData().catch((err) => { console.error(err); process.exit(1); });
    } else {
        console.log('Usage: node seeder.js -i  # import data\n       node seeder.js -d  # delete data');
    }
}

module.exports = { importData, deleteData };