/**
 * 📚 TYPESCRIPT LEARNING: Sequelize Model with TypeScript
 * 
 * This defines a PostgreSQL Product model using Sequelize with full type safety.
 * 
 * KEY CONCEPTS:
 * - Model attributes define the table structure
 * - Interface defines TypeScript types
 * - Sequelize provides ORM methods (findAll, create, etc.)
 */

import { DataTypes, ModelAttributes } from 'sequelize';
import { sequelize } from '../../config/database';
import { IProduct } from '../../types';

/**
 * 💡 LEARNING: Model Attributes Definition
 * 
 * ModelAttributes<IProductAttributes> tells TypeScript:
 * - What columns exist in the database
 * - What their types are
 * - What validations apply
 */
const productAttributes: ModelAttributes<IProduct> = {
  id: {
    type: DataTypes.UUID,                       // UUID instead of auto-increment
    defaultValue: DataTypes.UUIDV4,             // Generate UUID automatically
    primaryKey: true,
    /**
     * 💡 LEARNING: UUID Benefits
     * - Globally unique (no collisions)
     * - Better for distributed systems
     * - Can be generated client-side
     */
  },
  
  name: {
    type: DataTypes.STRING(255),                // VARCHAR(255)
    allowNull: false,                           // NOT NULL constraint
    /**
     * 💡 LEARNING: Sequelize Validations
     * 
     * Run before saving to database
     * Different from database constraints
     */
    validate: {
      notEmpty: {
        msg: 'Name cannot be empty',
      },
      len: {
        args: [1, 255],
        msg: 'Name must be between 1 and 255 characters',
      },
    },
  },
  
  description: {
    type: DataTypes.TEXT,                       // TEXT type (unlimited length)
    allowNull: true,                            // Optional field
  },
  
  price: {
    type: DataTypes.DECIMAL(10, 2),            // DECIMAL(10,2) - up to 99999999.99
    allowNull: false,
    /**
     * 💡 LEARNING: Number Validation
     * 
     * min/max validate the value range
     */
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative',
      },
      isDecimal: {
        msg: 'Price must be a valid decimal number',
      },
    },
  },
  
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Quantity cannot be negative',
      },
      isInt: {
        msg: 'Quantity must be an integer',
      },
    },
  },
  
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,                            // Optional categorization
  },
  
  status: {
    /**
     * 💡 LEARNING: ENUM Type
     * 
     * Creates a database enum type
     * Only these exact values are allowed
     * TypeScript enforces this at compile time too!
     */
    type: DataTypes.ENUM('available', 'out_of_stock', 'discontinued'),
    defaultValue: 'available',
    allowNull: false,
  },
};

/**
 * 💡 LEARNING: Model Options
 * 
 * Configuration for the Sequelize model
 */
const productOptions = {
  tableName: 'products',                        // Explicit table name
  timestamps: true,                             // Add createdAt/updatedAt
  underscored: true,                            // Use snake_case columns
  
  /**
   * 💡 LEARNING: Database Indexes
   * 
   * Indexes improve query performance
   * Add them for frequently queried columns
   */
  indexes: [
    {
      name: 'idx_product_name',
      fields: ['name'],
    },
    {
      name: 'idx_product_category',
      fields: ['category'],
    },
    {
      name: 'idx_product_status',
      fields: ['status'],
    },
    {
      name: 'idx_product_price',
      fields: ['price'],
    },
    /**
     * 💡 LEARNING: Composite Index
     * 
     * Index on multiple columns together
     * Good for queries filtering by both
     */
    {
      name: 'idx_product_category_status',
      fields: ['category', 'status'],
    },
  ],
};

/**
 * 💡 LEARNING: Creating the Sequelize Model
 * 
 * sequelize.define<IProduct> creates a typed model
 * IProduct includes both attributes and Sequelize methods
 */
const Product = sequelize.define<IProduct>(
  'Product',
  productAttributes,
  productOptions
);

/**
 * 💡 LEARNING: Model Hooks (Optional)
 * 
 * Hooks run automatically at certain lifecycle points
 * Example: beforeCreate, afterCreate, beforeUpdate, etc.
 */
// Product.beforeCreate((product, options) => {
//   // Do something before creating a product
//   console.log('Creating product:', product.name);
// });

/**
 * 💡 LEARNING: Instance Methods (Optional)
 * 
 * Methods available on model instances
 */
// Product.prototype.isAvailable = function(): boolean {
//   return this.status === 'available' && this.quantity > 0;
// };

/**
 * 💡 LEARNING: Class Methods (Optional)
 * 
 * Static methods available on the Product model
 */
// Product.findAvailable = function() {
//   return this.findAll({ where: { status: 'available' } });
// };

/**
 * 💡 LEARNING: Associations (Optional)
 * 
 * Define relationships with other models
 * Example: Product belongs to Category
 */
// Product.associate = (models) => {
//   Product.belongsTo(models.Category, {
//     foreignKey: 'categoryId',
//     as: 'category',
//   });
// };

/**
 * 💡 LEARNING: Default Export
 */
export default Product;

/**
 * 💡 LEARNING: Named Export (Alternative)
 */
export { Product };
