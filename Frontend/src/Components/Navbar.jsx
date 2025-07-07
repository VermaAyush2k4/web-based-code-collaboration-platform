import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={{ background: '#333', color: '#fff', padding: '10px 20px' }}>
      <span style={{ marginRight: 20 }}>Hello, {user.username}</span>
      <Link to="/" style={{ marginRight: 10, color: 'white' }}>Dashboard</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
