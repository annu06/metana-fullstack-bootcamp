// API Routes for Task Management
const express = require('express');
const router = express.Router();

// GET /api/tasks - Get all tasks
router.get('/tasks', (req, res) => {
    res.json({
        success: true,
        data: tasks,
        message: 'Tasks retrieved successfully'
    });
});

// POST /api/tasks - Create a new task
router.post('/tasks', (req, res) => {
    const { title, duration, time } = req.body;
    
    if (!title || !duration || !time) {
        return res.status(400).json({
            success: false,
            message: 'Title, duration, and time are required'
        });
    }
    
    const newTask = {
        id: tasks.length + 1,
        title,
        duration,
        time,
        status: 'backlog',
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    
    res.status(201).json({
        success: true,
        data: newTask,
        message: 'Task created successfully'
    });
});

// PUT /api/tasks/:id - Update a task
router.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, duration, time, status } = req.body;
    
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }
    
    // Update task properties
    if (title) tasks[taskIndex].title = title;
    if (duration) tasks[taskIndex].duration = duration;
    if (time) tasks[taskIndex].time = time;
    if (status) tasks[taskIndex].status = status;
    
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    res.json({
        success: true,
        data: tasks[taskIndex],
        message: 'Task updated successfully'
    });
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    res.json({
        success: true,
        data: deletedTask,
        message: 'Task deleted successfully'
    });
});

module.exports = router;