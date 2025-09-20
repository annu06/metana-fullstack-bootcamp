import React, { useState, useEffect } from 'react';

const TaskCard = ({ task, onEdit, onDelete, onComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);

  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
  }, [task]);

  const handleSave = () => {
    onEdit(task._id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`task-card ${task.completed ? 'completed' : ''} ${getPriorityClass(task.priority)}`}
      data-testid="task-card"
    >
      {isEditing ? (
        <div className="task-edit-form" data-testid="task-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-title"
            data-testid="edit-title-input"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="edit-description"
            data-testid="edit-description-input"
            placeholder="Task description"
            rows="3"
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="edit-priority"
            data-testid="edit-priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="edit-actions">
            <button
              onClick={handleSave}
              className="btn btn-primary"
              data-testid="save-button"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              data-testid="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="task-content" data-testid="task-content">
          <div className="task-header">
            <h3 className="task-title" data-testid="task-title">
              {task.title}
            </h3>
            <div className="task-actions">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-icon"
                data-testid="edit-button"
                aria-label="Edit task"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="btn btn-icon btn-danger"
                data-testid="delete-button"
                aria-label="Delete task"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className="task-description" data-testid="task-description">
              {task.description}
            </p>
          )}
          
          <div className="task-meta">
            <span className={`priority-badge ${getPriorityClass(task.priority)}`} data-testid="priority-badge">
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
            <span className="task-date" data-testid="task-date">
              Created: {formatDate(task.createdAt)}
            </span>
            {task.dueDate && (
              <span className="task-due-date" data-testid="task-due-date">
                Due: {formatDate(task.dueDate)}
              </span>
            )}
          </div>
          
          <div className="task-footer">
            <button
              onClick={() => onComplete(task._id, !task.completed)}
              className={`btn ${task.completed ? 'btn-secondary' : 'btn-success'}`}
              data-testid="complete-button"
            >
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;