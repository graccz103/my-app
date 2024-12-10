import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Tasks from './components/Tasks';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    alert('Logged out successfully');
  };

  const renderLayout = (Component) => (
    <div className="App">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="content-wrapper">
        <Component />
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={renderLayout(Register)} />
        <Route path="/login" element={renderLayout(Login)} />
        {isAuthenticated && <Route path="/tasks" element={renderLayout(Tasks)} />}
      </Routes>
    </Router>
  );
}

export default App;