import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasksAndGroup = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const userResponse = await axios.get('http://localhost:5000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(userResponse.data.groupId);

        if (!userResponse.data.groupId) {
          throw new Error('You are not part of any group');
        }

        const taskResponse = await axios.get('http://localhost:5000/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(taskResponse.data);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        console.error('Error fetching data:', error);
      }
    };

    fetchTasksAndGroup();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Group Tasks</h2>
      {error && <div className="text-red-600">{error}</div>}
      {group ? (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-lg">
              Current Group: <strong>{group.name}</strong>
            </p>
            <Link
              to="/groups"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Manage Groups
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-xl font-semibold">{task.title}</h3>
                <p className="text-gray-700">{task.description}</p>
                <p className="text-gray-500">Status: {task.status}</p>
                {task.dueDate && (
                  <p className="text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                )}
                {task.createdBy && (
                  <p className="text-gray-500">
                    Created by: {task.createdBy.username} ({task.createdBy.email})
                  </p>
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
        </>
      ) : (
        <div className="mb-4">
          <p>You are not part of any group. Join a group to view tasks.</p>
          <Link
            to="/groups"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Manage Groups
          </Link>
        </div>
      )}
    </div>
  );
}

export default TaskList;
