import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const Header = () => {
	const { isLoggedIn, isAdmin, logout } = useAuth();
	return (
		<header>
			<nav>
					<NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}><i className="fa fa-home"></i> Home</NavLink>
					<NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}><i className="fa fa-info-circle"></i> About</NavLink>
					<NavLink to="/blogs" className={({ isActive }) => isActive ? 'active' : ''}><i className="fa fa-blog"></i> Blogs</NavLink>
					<NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}><i className="fa fa-envelope"></i> Contact</NavLink>
				   {!isLoggedIn && (
					   <>
						<NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}><i className="fa fa-sign-in-alt"></i> Login</NavLink>
						<NavLink to="/signup" className={({ isActive }) => isActive ? 'active' : ''}><i className="fa fa-user-plus"></i> Sign Up</NavLink>
					   </>
				   )}
				   {isLoggedIn && (
					   <>
						   <Link to="/profile"><i className="fa fa-user"></i> Profile</Link>
					   </>
				   )}
				   {isAdmin && <Link to="/admin"><i className="fa fa-user-shield"></i> Admin</Link>}
				   {isLoggedIn && (
					   <button onClick={logout} style={{ marginLeft: 8 }}><i className="fa fa-sign-out-alt"></i> Logout</button>
				   )}
			</nav>
		</header>
	);
};

export default Header;
