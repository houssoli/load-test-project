/**
 * 📚 TYPESCRIPT LEARNING: Mongoose Model with TypeScript
 * 
 * This defines a MongoDB User model using Mongoose with full type safety.
 * 
 * KEY CONCEPTS:
 * - Schema defines the structure
 * - Interface defines the TypeScript type
 * - Model provides database methods (find, save, etc.)
 */

import mongoose, { Schema } from 'mongoose';
import type { IUser } from '../../types';

/**
 * 💡 LEARNING: Mongoose Schema Definition
 * 
 * Schema<IUser> tells TypeScript:
 * - What fields this schema has
 * - What types those fields are
 * - Provides autocomplete for schema methods
 */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],    // Custom error message
      trim: true,                               // Remove whitespace
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                             // Create unique index
      lowercase: true,                          // Convert to lowercase
      trim: true,
      /**
       * 💡 LEARNING: Custom Validation
       * 
       * match: [regex, error message]
       * Validates email format
       */
      match: [
        /^\S+@\S+\.\S+$/,
        'Please enter a valid email address',
      ],
    },
    
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age seems unrealistic'],
      required: false,                          // Optional field
    },
    
    status: {
      type: String,
      /**
       * 💡 LEARNING: Enum Validation
       * 
       * Only these exact strings are allowed
       * TypeScript also enforces this at compile time!
       */
      enum: {
        values: ['active', 'inactive', 'pending'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    
    metadata: {
      /**
       * 💡 LEARNING: Mixed Type
       * 
       * Allows any structure (like JSON)
       * Use sparingly as it bypasses type checking
       */
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    /**
     * 💡 LEARNING: Schema Options
     * 
     * timestamps: Automatically adds createdAt & updatedAt
     * collection: Specifies MongoDB collection name
     */
    timestamps: true,
    collection: 'users',
  }
);

/**
 * 💡 LEARNING: Indexes for Performance
 * 
 * Indexes speed up queries but slow down writes
 * - email: Unique index (automatic from schema)
 * - status: For filtering by status
 * - createdAt: For sorting by date
 */
userSchema.index({ email: 1 });               // 1 = ascending
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });          // -1 = descending

/**
 * 💡 LEARNING: Virtual Properties (Optional)
 * 
 * Computed properties that don't exist in the database
 * Example: fullName from firstName + lastName
 */
// userSchema.virtual('emailDomain').get(function() {
//   return this.email.split('@')[1];
// });

/**
 * 💡 LEARNING: Instance Methods (Optional)
 * 
 * Methods available on document instances
 * Example: user.isActive()
 */
// userSchema.methods.isActive = function(): boolean {
//   return this.status === 'active';
// };

/**
 * 💡 LEARNING: Static Methods (Optional)
 * 
 * Methods available on the Model itself
 * Example: User.findByEmail(email)
 */
// userSchema.statics.findByEmail = function(email: string) {
//   return this.findOne({ email });
// };

/**
 * 💡 LEARNING: Creating the Model
 * 
 * Model<IUser> creates a typed model:
 * - TypeScript knows about all User fields
 * - Autocomplete works for queries
 * - Type checking for create/update operations
 */
const User = mongoose.model<IUser>('User', userSchema);

/**
 * 💡 LEARNING: Default Export
 * 
 * import User from './User'
 */
export default User;

/**
 * 💡 LEARNING: Named Export (Alternative)
 * 
 * import { User } from './User'
 */
export { User };
