import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        setError('Failed to fetch tasks');
        console.error(error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Your Tasks</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold">{task.title}</h3>
            <p className="text-gray-700">{task.description}</p>
            <p className="text-gray-500">Status: {task.status}</p>
            {task.dueDate && (
              <p className="text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>
      <Link
        to="/tasks/new"
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Task
      </Link>
    </div>
  );
}

export default TaskList;
