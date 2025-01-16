import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const [taskResponse, groupResponse] = await Promise.all([
          axios.get(`http://localhost:5000/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTask(taskResponse.data);

        const groupId = groupResponse.data.groupId?._id;
        if (groupId) {
          const membersResponse = await axios.get(`http://localhost:5000/groups/${groupId}/members`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGroupMembers(membersResponse.data);
        } else {
          setError('You are not part of any group.');
        }
      } catch (error) {
        setError('Failed to fetch task details or group members');
        console.error(error);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
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

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Task deleted successfully');
        navigate('/tasks');
      } catch (error) {
        setError('Failed to delete task');
        console.error(error);
      }
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
            name="status"
            value={task.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To</label>
          <select
            name="assignedTo"
            value={task.assignedTo || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Unassigned</option>
            {groupMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.username} ({member.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">Attachments</h3>
          {task.attachments && task.attachments.length > 0 ? (
            <ul>
              {task.attachments.map((file, index) => (
                <li key={index}>
                  <a
                    href={`http://localhost:5000${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.split('/').pop()} 
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No attachments</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Task
          </button>
          <button
            onClick={handleDelete}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;
