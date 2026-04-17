import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LogoutButton.css';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      تسجيل الخروج
    </button>
  );
};

export default LogoutButton;
