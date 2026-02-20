const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth';

export const login = async (credentials) => {
	const res = await fetch(`${API_URL}/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});
	if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
	return res.json();
};

export const register = async (userData) => {
	const res = await fetch(`${API_URL}/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(userData),
	});
	if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
	return res.json();
};
