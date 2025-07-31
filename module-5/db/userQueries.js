const User = require('../models/User');

// Create a new user
const createUser = async (userData) => {
  try {
    const user = new User(userData);
    const savedUser = await user.save();
    return savedUser;
  } catch (error) {
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return users;
  } catch (error) {
    throw error;
  }
};

// Get user by ID
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Update user by ID
const updateUserById = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Delete user by ID
const deleteUserById = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Get user by email
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserByEmail
};