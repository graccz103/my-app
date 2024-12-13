import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(response.data);
      } catch (error) {
        setError('Failed to fetch task details');
        console.error(error);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (e) => {
    setTask({ ...task, status: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/tasks/${taskId}`, task, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task updated successfully');
      navigate('/tasks');
    } catch (error) {
      setError('Failed to save task');
      console.error(error);
    }
  };

  if (!task) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Task Details</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Task
        </button>
      </div>
    </div>
  );
}

export default TaskDetails;
