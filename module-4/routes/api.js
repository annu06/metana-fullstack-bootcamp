
// API Routes for Task Management
const express = require('express');
const router = express.Router();

// Use shared tasks store
const store = require('../data/tasksStore');

// GET /api/tasks - Get all tasks
router.get('/tasks', (req, res) => {
    res.json({
        success: true,
        data: store.getAll(),
        message: 'Tasks retrieved successfully'
    });
});

// POST /api/tasks - Create a new task
router.post('/tasks', (req, res) => {
    const { title, duration, time } = req.body;
    if (!title || !duration || !time) {
        return res.status(400).json({ success: false, message: 'Title, duration, and time are required' });
    }
    const newTask = store.addTask({ title, duration, time, status: 'backlog' });
    res.status(201).json({ success: true, data: newTask, message: 'Task created successfully' });
});

// PUT /api/tasks/:id - Update a task
router.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, duration, time, status } = req.body;
    const updated = store.updateTask(taskId, { title, duration, time, status });
    if (!updated) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: updated, message: 'Task updated successfully' });
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const deleted = store.deleteTask(taskId);
    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: deleted, message: 'Task deleted successfully' });
});

module.exports = router;