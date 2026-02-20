const mongoose = require('mongoose');

const TaskIntegrationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: {
      values: ['happy', 'sad', 'excited', 'calm', 'anxious', 'angry', 'motivated', 'tired'],
      message: 'Mood must be one of: happy, sad, excited, calm, anxious, angry, motivated, tired'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'social', 'learning', 'other'],
    default: 'personal'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  completedAt: {
    type: Date
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [1, 'Estimated duration must be at least 1 minute'],
    max: [1440, 'Estimated duration cannot exceed 24 hours']
  },
  actualDuration: {
    type: Number // in minutes
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    datetime: {
      type: Date
    },
    sent: {
      type: Boolean,
      default: false
    }
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Subtask title cannot exceed 100 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    createdFrom: {
      type: String,
      enum: ['web', 'mobile', 'api', 'import'],
      default: 'web'
    },
    source: String,
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
TaskIntegrationSchema.index({ user: 1, status: 1 });
TaskIntegrationSchema.index({ user: 1, mood: 1 });
TaskIntegrationSchema.index({ user: 1, createdAt: -1 });
TaskIntegrationSchema.index({ dueDate: 1, status: 1 });
TaskIntegrationSchema.index({ 'reminder.enabled': 1, 'reminder.datetime': 1, 'reminder.sent': 1 });

// Virtual for completion percentage of subtasks
TaskIntegrationSchema.virtual('completionPercentage').get(function() {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for overdue status
TaskIntegrationSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for time remaining
TaskIntegrationSchema.virtual('timeRemaining').get(function() {
  if (!this.dueDate) return null;
  
  const now = new Date();
  const timeDiff = this.dueDate.getTime() - now.getTime();
  
  if (timeDiff <= 0) return 'Overdue';
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
});

// Pre-save middleware
TaskIntegrationSchema.pre('save', function(next) {
  // Set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Clear completedAt when status changes from completed
  if (this.isModified('status') && this.status !== 'completed' && this.completedAt) {
    this.completedAt = undefined;
  }
  
  // Increment version on updates
  if (!this.isNew) {
    this.metadata.version += 1;
  }
  
  next();
});

// Static methods
TaskIntegrationSchema.statics.getTasksByMood = function(userId, mood) {
  return this.find({ user: userId, mood: mood, status: { $ne: 'completed' } })
             .sort({ createdAt: -1 });
};

TaskIntegrationSchema.statics.getOverdueTasks = function(userId) {
  return this.find({
    user: userId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  }).sort({ dueDate: 1 });
};

TaskIntegrationSchema.statics.getTaskStats = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

TaskIntegrationSchema.statics.getMoodDistribution = function(userId, startDate, endDate) {
  const matchCondition = { user: new mongoose.Types.ObjectId(userId) };
  
  if (startDate && endDate) {
    matchCondition.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$mood',
        count: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        mood: '$_id',
        totalTasks: '$count',
        completedTasks: '$completedCount',
        completionRate: {
          $multiply: [
            { $divide: ['$completedCount', '$count'] },
            100
          ]
        }
      }
    }
  ]);
};

// Instance methods
TaskIntegrationSchema.methods.addSubtask = function(title) {
  this.subtasks.push({ title });
  return this.save();
};

TaskIntegrationSchema.methods.completeSubtask = function(subtaskId) {
  const subtask = this.subtasks.id(subtaskId);
  if (subtask) {
    subtask.completed = true;
    subtask.completedAt = new Date();
    return this.save();
  }
  throw new Error('Subtask not found');
};

TaskIntegrationSchema.methods.addCollaborator = function(userId, role = 'viewer') {
  const existingCollaborator = this.collaborators.find(
    collab => collab.user.toString() === userId.toString()
  );
  
  if (existingCollaborator) {
    existingCollaborator.role = role;
  } else {
    this.collaborators.push({ user: userId, role });
  }
  
  return this.save();
};

module.exports = mongoose.model('Task', TaskIntegrationSchema);