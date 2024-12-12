import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function GroupsPage() {
  const [user, setUser] = useState(null); // Dane użytkownika
  const [groups, setGroups] = useState([]); // Lista istniejących grup
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Pobranie danych użytkownika
        const userResponse = await axios.get('http://localhost:5000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);

        // Pobranie dostępnych grup
        const groupsResponse = await axios.get('http://localhost:5000/groups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(groupsResponse.data);
      } catch (error) {
        setError('Failed to fetch data');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const joinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Successfully joined the group');
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to join group', error);
      setError('Failed to join group');
    }
  };

  const leaveGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/leave-group',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, groupId: null });
      alert('You have left the group');
    } catch (error) {
      console.error('Failed to leave group', error);
      setError('Failed to leave group');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Groups Management</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {user.groupId ? (
        <div className="mb-6">
          <p className="text-lg">
            You are currently in group: <strong>{user.groupId.name}</strong>
          </p>
          <div className="mt-4">
            <button
              onClick={leaveGroup}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2"
            >
              Leave Group
            </button>
            <Link
              to={`/groups/edit/${user.groupId._id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Group
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <p>You are not in any group.</p>
          <Link
            to="/groups/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Group
          </Link>
        </div>
      )}

      {!user.groupId && (
        <div>
          <h3 className="text-xl font-bold mb-4">Available Groups</h3>
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group._id} className="bg-white shadow-md rounded-lg p-4">
                  <h4 className="text-lg font-semibold">{group.name}</h4>
                  <p className="text-gray-600">Members: {group.members.length}</p>
                  <button
                    onClick={() => joinGroup(group._id)}
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Join Group
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No groups available to join.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default GroupsPage;
