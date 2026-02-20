// userQueries.js - User DB queries
const pool = require('./dbconn');

async function findUserByEmail(email) {
	const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
	return rows[0];
}

async function findUserById(id) {
	const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
	return rows[0];
}

async function createUser({ username, email, password, role }) {
	const { rows } = await pool.query(
		'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
		[username, email, password, role]
	);
	return rows[0];
}

module.exports = {
	findUserByEmail,
	findUserById,
	createUser,
};
