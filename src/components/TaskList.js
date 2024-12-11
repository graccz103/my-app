import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [group, setGroup] = useState(null); // Przechowywanie danych grupy
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasksAndGroup = async () => {
      try {
        const token = localStorage.getItem('token');
        const taskResponse = await axios.get('http://localhost:5000/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(taskResponse.data);

        const userResponse = await axios.get('http://localhost:5000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(userResponse.data.groupId); // Oczekujemy, że backend zwróci szczegóły grupy użytkownika
      } catch (error) {
        setError('Failed to fetch data');
        console.error(error);
      }
    };

    fetchTasksAndGroup();
  }, []);

  const leaveGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/leave-group',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroup(null); // Usuwamy grupę po jej opuszczeniu
      alert('You have left the group');
    } catch (error) {
      console.error('Failed to leave group', error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Your Tasks</h2>
      {error && <div className="text-red-600">{error}</div>}
      {group ? (
        <div className="mb-4">
          <p className="text-lg">
            Current Group: <strong>{group.name}</strong>
          </p>
          <button
            onClick={leaveGroup}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Leave Group
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <p>You are not in a group.</p>
          <Link
            to="/groups/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Join or Create Group
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold">{task.title}</h3>
            <p className="text-gray-700">{task.description}</p>
            <p className="text-gray-500">Status: {task.status}</p>
            {task.dueDate && (
              <p className="text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            )}
            {task.assignedTo && (
              <p className="text-gray-500">
                Assigned to: {task.assignedTo.username} ({task.assignedTo.email})
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
    </div>
  );
}

export default TaskList;
