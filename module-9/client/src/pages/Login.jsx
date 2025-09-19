import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { login as loginApi } from '../api/auth';

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			await loginApi(username, password);
			login(username);
		} catch (err) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h2>Login</h2>
			{error && <div className="error">{error}</div>}
					<form onSubmit={handleSubmit}>
						<label htmlFor="username"><i className="fa fa-user"></i> Username</label>
						<input
							type="text"
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							placeholder="Enter your username"
						/>
						<label htmlFor="password"><i className="fa fa-lock"></i> Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="Enter your password"
						/>
						<button type="submit" disabled={loading}>
							<i className="fa fa-sign-in-alt"></i> {loading ? 'Logging in...' : 'Login'}
						</button>
					</form>
		</>
	);
}

export default Login;
