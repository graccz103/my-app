import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import CreateGroup from './components/CreateGroup';
import EditGroup from './components/EditGroup';
import GroupsPage from './components/GroupsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    alert('Logged out successfully');
  };

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/tasks"
            element={isAuthenticated ? <TaskList /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tasks/new"
            element={isAuthenticated ? <AddTask /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/groups/new"
            element={isAuthenticated ? <CreateGroup /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/groups/edit/:groupId"
            element={isAuthenticated ? <EditGroup /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/groups"
            element={isAuthenticated ? <GroupsPage /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
