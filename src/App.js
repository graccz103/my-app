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
import TaskDetails from './components/TaskDetails';

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
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
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
          <Route
            path="/tasks/:taskId"
            element={isAuthenticated ? <TaskDetails /> : <Navigate to="/login" replace />}
          />
          {/* Obsługa błędów dla ścieżek "/uploads" */}
          <Route
            path="/uploads/*"
            element={<div className="text-red-600 p-4">File not found (404)</div>}
          />
          {/* Obsługa nieznanych ścieżek */}
          <Route
            path="*"
            element={<div className="text-red-600 p-4">404 Not Found</div>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
