import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'TASK';

const getStatusColorClass = (status) => {
  switch (status) {
    case 'To Do':
      return 'bg-red-100 border-red-500';
    case 'In Progress':
      return 'bg-orange-100 border-orange-500';
    case 'In Review':
      return 'bg-blue-100 border-blue-500';
    case 'Done':
      return 'bg-green-100 border-green-500';
    default:
      return 'bg-gray-100 border-gray-500';
  }
};

function Task({ task, onClick, currentUserId }) {
  const [, drag] = useDrag(() => ({
    type: ItemType,
    item: { id: task._id },
  }));

  const isAssignedToCurrentUser = task.assignedTo?._id === currentUserId;

  return (
    <div
      ref={drag}
      onClick={() => onClick(task._id)}
      className={`shadow-md rounded-lg p-4 border-l-4 cursor-pointer ${getStatusColorClass(
        task.status
      )}`}
    >
      <h3 className="text-xl font-semibold">{task.title}</h3>
      <p className="text-sm font-medium text-gray-600 mb-2">Assigned to:</p>
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${isAssignedToCurrentUser
              ? 'bg-red-700 text-white'
              : 'bg-gray-200 text-gray-700'
            }`}
        >
          {task.assignedTo?.username || 'Unassigned'}
        </span>
      </div>
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
  );
}

function Section({ status, tasks, onDropTask, onTaskClick, currentUserId }) {
  const [, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item) => onDropTask(item.id, status),
  }));

  return (
    <div ref={drop} className="mb-8">
      <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">{status}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Task key={task._id} task={task} onClick={onTaskClick} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [filters, setFilters] = useState({ title: '', assignedTo: '', dueDate: '', createdBy: '' });
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasksAndGroup = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const userResponse = await axios.get('http://localhost:5000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(userResponse.data.groupId);
        setCurrentUserId(userResponse.data._id);

        if (!userResponse.data.groupId) {
          throw new Error('You are not part of any group');
        }

        // Pobierz listę członków grupy z backendu
        const groupMembersResponse = await axios.get(
          `http://localhost:5000/groups/${userResponse.data.groupId._id}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGroupMembers(groupMembersResponse.data);

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


  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const matchesTitle = task.title.toLowerCase().includes(filters.title.toLowerCase());
      const matchesAssignedTo = !filters.assignedTo || task.assignedTo?._id === filters.assignedTo;
      const matchesDueDate =
        !filters.dueDate || new Date(task.dueDate) <= new Date(filters.dueDate); // Porównanie dat
      const matchesCreatedBy = !filters.createdBy || task.createdBy?._id === filters.createdBy;
      return matchesTitle && matchesAssignedTo && matchesDueDate && matchesCreatedBy;
    });
  };
  

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const updatedTask = await axios.put(
        `http://localhost:5000/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: updatedTask.data.status } : task
        )
      );
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const navigateToTaskDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const groupedTasks = {
    'To Do': filterTasks(tasks.filter((task) => task.status === 'To Do')),
    'In Progress': filterTasks(tasks.filter((task) => task.status === 'In Progress')),
    'In Review': filterTasks(tasks.filter((task) => task.status === 'In Review')),
    'Done': filterTasks(tasks.filter((task) => task.status === 'Done')),
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <input
                type="text"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                placeholder="Search by Title"
                className="border rounded p-2"
              />
              <select
                name="assignedTo"
                value={filters.assignedTo}
                onChange={handleFilterChange}
                className="border rounded p-2"
              >
                <option value="">Filter by Assigned To</option>
                {groupMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.username || member.email}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="dueDate"
                value={filters.dueDate}
                onChange={handleFilterChange}
                className="border rounded p-2"
              />
              <select
                name="createdBy"
                value={filters.createdBy}
                onChange={handleFilterChange}
                className="border rounded p-2"
              >
                <option value="">Filter by Created By</option>
                {groupMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.username || member.email}
                  </option>
                ))}
              </select>
            </div>

            {Object.keys(groupedTasks).map((status) => (
              <Section
                key={status}
                status={status}
                tasks={groupedTasks[status]}
                onDropTask={updateTaskStatus}
                onTaskClick={navigateToTaskDetails}
                currentUserId={currentUserId}
              />
            ))}
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
    </DndProvider>
  );
}

export default TaskList;
