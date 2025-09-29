import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { register as registerApi } from '../api/auth';

const SignUp = () => {
	const { login } = useAuth();
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const res = await registerApi({ username, email, password });
			login(res.user, res.token);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<h2>Sign Up</h2>
			<form onSubmit={handleSubmit}>
				<label htmlFor="username"><i className="fa fa-user-plus"></i> Username</label>
				<input
					type="text"
					id="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
					placeholder="Choose a username"
				/>
				<label htmlFor="email"><i className="fa fa-envelope"></i> Email</label>
				<input
					type="email"
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					placeholder="Enter your email"
				/>
				<label htmlFor="password"><i className="fa fa-lock"></i> Password</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					placeholder="Create a password"
				/>
				{error && <div style={{ color: 'red' }}>{error}</div>}
					 <button type="submit" disabled={loading} style={{ marginBottom: '0.5rem' }}>
							 <i className="fa fa-user-check"></i> {loading ? 'Signing up...' : 'Sign Up'}
							 {loading && <span className="fa fa-spinner fa-spin" style={{ marginLeft: 8 }}></span>}
					 </button>
					 <button
						 type="button"
						 disabled={loading}
						 onClick={async (e) => {
							 e.target.disabled = true;
							 e.target.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Redirecting...';
							 setTimeout(() => { window.location.href = '/login'; }, 700);
						 }}
						 style={{ marginTop: '0.5rem' }}
					 >
						 <i className="fa fa-sign-in-alt"></i> Already have an account? Login
					 </button>
			</form>
		</div>
	);
};

export default SignUp;
