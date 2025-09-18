const User = require('../models/User');

// Create a new user
async function createUser(data) {
  const user = new User(data);
  return await user.save();
}

// Get all users
async function getAllUsers() {
  return await User.find();
}

// Get user by ID
async function getUserById(id) {
  return await User.findById(id);
}

// Update user by ID
async function updateUser(id, data) {
  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

// Delete user by ID
async function deleteUser(id) {
  return await User.findByIdAndDelete(id);
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
