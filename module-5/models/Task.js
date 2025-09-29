const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true,
        maxlength: [100, 'Task title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    duration: {
        type: String,
        required: [true, 'Please provide task duration'],
        default: '30 mins'
    },
    time: {
        type: String,
        required: [true, 'Please provide task time']
    },
    status: {
        type: String,
        enum: ['backlog', 'in-progress', 'completed'],
        default: 'backlog'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    mood: {
        type: String,
        enum: ['happy', 'focused', 'relaxed', 'energetic', 'calm'],
        required: false
    },
    weatherBased: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed') {
        this.completedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);