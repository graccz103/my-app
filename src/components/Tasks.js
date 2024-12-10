import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, onLogout }) {
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link to="/" className="text-lg font-bold hover:text-gray-200">
            Task Manager
          </Link>
        </div>
        <div>
          {isAuthenticated ? (
            <>
              <Link to="/tasks" className="mx-2 hover:text-gray-200">
                Tasks
              </Link>
              <button
                onClick={onLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mx-2 hover:text-gray-200">
                Login
              </Link>
              <Link to="/register" className="mx-2 hover:text-gray-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
