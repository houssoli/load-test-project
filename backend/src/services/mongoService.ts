/**
 * 📚 TYPESCRIPT LEARNING: Service Layer with Type Safety
 * 
 * Service classes encapsulate business logic and database operations.
 * 
 * KEY CONCEPTS:
 * - Classes in TypeScript
 * - Return type annotations
 * - Generic types for flexible code
 * - Type-safe database queries
 */

import User from '../models/mongo/User';
import type { 
  IUser, 
  CreateUserDTO, 
  UpdateUserDTO 
} from '../types';

/**
 * 💡 LEARNING: Pagination Result Interface
 * 
 * Defines the structure of paginated responses
 */
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PaginatedUsers {
  users: IUser[];
  pagination: PaginationInfo;
}

/**
 * 💡 LEARNING: User Stats Interface
 * 
 * For aggregation results
 */
interface UserStats {
  _id: string;
  count: number;
  avgAge: number | null;
}

/**
 * 💡 LEARNING: Service Class
 * 
 * A class groups related methods together
 * This service handles all MongoDB User operations
 */
class MongoService {
  /**
   * 💡 LEARNING: Method with Return Type
   * 
   * Promise<IUser> means:
   * - This is an async method (returns Promise)
   * - It resolves to an IUser document
   * 
   * @param userData - Data for creating a new user
   * @returns Promise resolving to the created user
   */
  async createUser(userData: CreateUserDTO): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * 💡 LEARNING: Method with Multiple Parameters
   * 
   * Parameters can have default values
   * filter uses Partial<> to make all fields optional
   * 
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @param filter - Optional filter criteria
   * @returns Promise resolving to paginated users
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filter: Partial<Pick<IUser, 'status'>> = {}
  ): Promise<PaginatedUsers> {
    const skip: number = (page - 1) * limit;
    
    /**
     * 💡 LEARNING: Promise.all with Typed Results
     * 
     * Runs multiple async operations in parallel
     * Results are tuple-typed [IUser[], number]
     */
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })    // Newest first
        .skip(skip)
        .limit(limit)
        .lean<IUser[]>(),            // .lean() returns plain objects (faster)
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

  /**
   * 💡 LEARNING: Method Returning Nullable Type
   * 
   * Promise<IUser | null> means:
   * - Returns IUser if found
   * - Returns null if not found
   * 
   * @param id - MongoDB ObjectId as string
   * @returns Promise resolving to user or null
   */
  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).lean<IUser>();
  }

  /**
   * 💡 LEARNING: Query by Specific Field
   * 
   * @param email - User email address
   * @returns Promise resolving to user or null
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).lean<IUser>();
  }

  /**
   * 💡 LEARNING: Update Operation
   * 
   * Uses UpdateUserDTO which has optional fields
   * 
   * @param id - MongoDB ObjectId as string
   * @param updateData - Fields to update
   * @returns Promise resolving to updated user or null
   */
  async updateUser(
    id: string,
    updateData: UpdateUserDTO
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true,           // Return updated document
        runValidators: true  // Run schema validations
      }
    ).lean<IUser>();
  }

  /**
   * 💡 LEARNING: Delete Operation
   * 
   * @param id - MongoDB ObjectId as string
   * @returns Promise resolving to deleted user or null
   */
  async deleteUser(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id).lean<IUser>();
  }

  /**
   * 💡 LEARNING: Bulk Operations
   * 
   * insertMany creates multiple documents at once
   * Useful for testing or data seeding
   * 
   * @param usersData - Array of user data
   * @returns Promise resolving to created users
   */
  async bulkCreateUsers(usersData: CreateUserDTO[]): Promise<IUser[]> {
    return await User.insertMany(usersData);
  }

  /**
   * 💡 LEARNING: Search with Regex
   * 
   * MongoDB $regex for pattern matching
   * $options: 'i' makes it case-insensitive
   * 
   * @param query - Search term
   * @returns Promise resolving to matching users
   */
  async searchUsers(query: string): Promise<IUser[]> {
    return await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(50)
      .lean<IUser[]>();
  }

  /**
   * 💡 LEARNING: Aggregation Pipeline
   * 
   * MongoDB aggregation for complex queries
   * Groups users by status and calculates stats
   * 
   * @returns Promise resolving to user statistics
   */
  async getUserStats(): Promise<UserStats[]> {
    return await User.aggregate<UserStats>([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
        },
      },
    ]);
  }

  /**
   * 💡 LEARNING: Count Documents
   * 
   * @param filter - Optional filter criteria
   * @returns Promise resolving to document count
   */
  async countUsers(filter: Partial<Pick<IUser, 'status'>> = {}): Promise<number> {
    return await User.countDocuments(filter);
  }
}

/**
 * 💡 LEARNING: Singleton Pattern
 * 
 * Export a single instance of the service
 * All parts of the app use the same instance
 */
export default new MongoService();

/**
 * 💡 LEARNING: Named Export (Alternative)
 * 
 * Allows: import { MongoService } from './mongoService'
 */
export { MongoService };
