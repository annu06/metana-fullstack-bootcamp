import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
    calculateStats();
  }, [tasks, filter, searchTerm]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by completion status
    if (filter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (filter === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    } else if (filter === 'high' || filter === 'medium' || filter === 'low') {
      filtered = filtered.filter(task => task.priority === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const high = tasks.filter(task => task.priority === 'high').length;
    const medium = tasks.filter(task => task.priority === 'medium').length;
    const low = tasks.filter(task => task.priority === 'low').length;

    setStats({ total, completed, pending, high, medium, low });
  };

  const createTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        const task = await response.json();
        setTasks(prev => [task, ...prev]);
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
        setShowCreateForm(false);
      } else {
        setError('Failed to create task');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const editTask = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => task._id === id ? updatedTask : task));
      } else {
        setError('Failed to update task');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setTasks(prev => prev.filter(task => task._id !== id));
        } else {
          setError('Failed to delete task');
        }
      } catch (error) {
        setError('Network error');
      }
    }
  };

  const toggleComplete = async (id, completed) => {
    await editTask(id, { completed });
  };

  if (isLoading) {
    return (
      <div className="loading-container" data-testid="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard" data-testid="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title" data-testid="dashboard-title">
          Welcome back, {user?.name}!
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
          data-testid="add-task-button"
        >
          {showCreateForm ? 'Cancel' : 'Add New Task'}
        </button>
      </div>

      {error && (
        <div className="error-message" data-testid="error-message">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="stats-section" data-testid="stats-section">
        <div className="stats-grid">
          <div className="stat-card" data-testid="stat-total">
            <h3>Total Tasks</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card" data-testid="stat-completed">
            <h3>Completed</h3>
            <p>{stats.completed}</p>
          </div>
          <div className="stat-card" data-testid="stat-pending">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-card" data-testid="stat-high">
            <h3>High Priority</h3>
            <p>{stats.high}</p>
          </div>
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="create-task-form" data-testid="create-task-form">
          <h3>Create New Task</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="form-input"
              data-testid="new-task-title"
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className="form-input"
              data-testid="new-task-description"
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                className="form-input"
                data-testid="new-task-priority"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                className="form-input"
                data-testid="new-task-due-date"
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              onClick={createTask}
              className="btn btn-primary"
              data-testid="create-task-button"
              disabled={!newTask.title.trim()}
            >
              Create Task
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="controls-section" data-testid="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            data-testid="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            data-testid="filter-all"
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            data-testid="filter-pending"
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            data-testid="filter-completed"
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            data-testid="filter-high"
          >
            High Priority
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-section" data-testid="tasks-section">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks" data-testid="no-tasks">
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={editTask}
                onDelete={deleteTask}
                onComplete={toggleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;