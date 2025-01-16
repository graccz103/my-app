import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddTask() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    dueDate: '',
    assignedTo: '',
    attachments: [], 
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [group, setGroup] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupAndUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get('http://localhost:5000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupId = userResponse.data.groupId?._id || userResponse.data.groupId;
        setGroup(groupId);

        if (groupId) {
          const usersResponse = await axios.get(`http://localhost:5000/groups/${groupId}/members`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(usersResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch group and users', error);
        setError('Failed to fetch group and users');
      }
    };

    fetchGroupAndUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!group) {
      setError('You must be part of a group to create a task');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
  
      // 1. Utwórz nowe zadanie
      const taskResponse = await axios.post('http://localhost:5000/tasks', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const taskId = taskResponse.data._id; // ID nowo utworzonego zadania
  
      // Przesyła załączniki do zadania, jeśli dodane
      if (formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          const fileData = new FormData();
          fileData.append('file', file);
  
          await axios.post(`http://localhost:5000/tasks/upload/${taskId}`, fileData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
  
      alert('Task added successfully');
      navigate('/tasks');
    } catch (error) {
      setError('Failed to add task');
      console.error(error);
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, file],
    }));
  };
  
  

  if (!group) {
    return <p className="p-8 text-red-600">You must be part of a group to create tasks.</p>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Add New Task</h2>
      {error && <div className="text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
            placeholder="Task title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
            placeholder="Task description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Assign To</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Attachments</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
          />
{formData.attachments && (
  <ul>
    {formData.attachments.map((file, index) => (
      <li key={index}>
        <a href="#" target="_blank" rel="noopener noreferrer">
          {file.name} {/* Użyj właściwości 'name' obiektu File */}
        </a>
      </li>
    ))}
  </ul>
)}

        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}

export default AddTask;
