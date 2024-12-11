import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/available-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch available users', error);
      }
    };

    fetchAvailableUsers();
  }, []);

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName) {
      setError('Group name is required');
      return;
    }
    if (selectedUsers.length === 0) {
      setError('Select at least one user to create a group');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/groups',
        { name: groupName, memberIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/tasks'); // Przekierowanie po sukcesie
    } catch (error) {
      setError('Failed to create group');
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Create a New Group</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
            placeholder="Enter group name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Select Users</label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {availableUsers.map((user) => (
              <div key={user._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={user._id}
                  onChange={() => handleUserSelection(user._id)}
                  className="mr-2"
                />
                <label>
                  {user.username} ({user.email})
                </label>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Group
        </button>
      </form>
    </div>
  );
}

export default CreateGroup;
