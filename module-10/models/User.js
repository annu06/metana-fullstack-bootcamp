const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    avatar: String,
    preferences: {
      defaultMood: {
        type: String,
        enum: ['happy', 'sad', 'excited', 'calm', 'anxious', 'angry', 'motivated', 'tired'],
        default: 'motivated'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });

// Virtual for user's task count
UserSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET || 'fallback-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Update last login
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static methods
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true }).select('-password');
};

module.exports = mongoose.model('User', UserSchema);