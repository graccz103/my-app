import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditGroup() {
  const { groupId } = useParams();
  const [groupDetails, setGroupDetails] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newMembers, setNewMembers] = useState([]);
  const [removeMembers, setRemoveMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const groupResponse = await axios.get(`http://localhost:5000/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroupDetails(groupResponse.data);
        setGroupName(groupResponse.data.name);

        const usersResponse = await axios.get('http://localhost:5000/users/available', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableUsers(usersResponse.data);
      } catch (error) {
        setError('Failed to fetch group details');
        console.error(error);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/groups/${groupId}`,
        {
          name: groupName,
          addMembers: newMembers,
          removeMembers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Group updated successfully');
      navigate('/tasks');
    } catch (error) {
      setError('Failed to update group');
      console.error(error);
    }
  };

  const handleMemberSelection = (userId, type) => {
    if (type === 'add') {
      setNewMembers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    } else {
      setRemoveMembers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  };

  if (!groupDetails) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Edit Group</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleUpdateGroup} className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-600 mb-1">Current Members</label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {groupDetails.members.map((user) => (
              <div key={user._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={user._id}
                  onChange={() => handleMemberSelection(user._id, 'remove')}
                  className="mr-2"
                />
                <label>
                  {user.username} ({user.email})
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Add New Members</label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {availableUsers.map((user) => (
              <div key={user._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={user._id}
                  onChange={() => handleMemberSelection(user._id, 'add')}
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
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditGroup;
