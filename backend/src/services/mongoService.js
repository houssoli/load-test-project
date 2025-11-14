const User = require('../models/mongo/User');

class MongoService {
  // Create a new user
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Get all users with pagination
  async getAllUsers(page = 1, limit = 10, filter = {}) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by ID
  async getUserById(id) {
    return await User.findById(id).lean();
  }

  // Get user by email
  async getUserByEmail(email) {
    return await User.findOne({ email }).lean();
  }

  // Update user
  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  // Delete user
  async deleteUser(id) {
    return await User.findByIdAndDelete(id).lean();
  }

  // Bulk operations for testing
  async bulkCreateUsers(usersData) {
    return await User.insertMany(usersData);
  }

  // Search users
  async searchUsers(query) {
    return await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(50)
      .lean();
  }

  // Aggregate users by status
  async getUserStats() {
    return await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
        },
      },
    ]);
  }

  // Count users
  async countUsers(filter = {}) {
    return await User.countDocuments(filter);
  }
}

module.exports = new MongoService();
