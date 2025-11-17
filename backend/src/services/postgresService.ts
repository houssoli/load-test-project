/**
 * 📚 TYPESCRIPT LEARNING: PostgreSQL Service with Sequelize
 * 
 * Service layer for Product operations using Sequelize ORM.
 * 
 * KEY CONCEPTS:
 * - Sequelize ORM with TypeScript
 * - Type-safe database operations
 * - Complex queries and aggregations
 */

import Product from '../models/postgres/Product';
import { Op } from 'sequelize';
import type { 
  IProduct, 
  CreateProductDTO, 
  UpdateProductDTO 
} from '../types';

/**
 * 💡 LEARNING: Service-specific Interfaces
 */
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PaginatedProducts {
  products: IProduct[];
  pagination: PaginationInfo;
}

interface ProductFilter {
  category?: string;
  status?: 'available' | 'out_of_stock' | 'discontinued';
  minPrice?: number;
  maxPrice?: number;
}

// interface ProductStats {
//   category: string;
//   count: number;
//   avgPrice: number;
//   totalQuantity: number;
// }

/**
 * 💡 LEARNING: PostgreSQL Service Class
 * 
 * Handles all Product database operations
 */
class PostgresService {
  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductDTO): Promise<IProduct> {
    return await Product.create(productData as any);
  }

  /**
   * Get all products with pagination and filtering
   */
  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    filter: ProductFilter = {}
  ): Promise<PaginatedProducts> {
    const offset: number = (page - 1) * limit;
    
    /**
     * 💡 LEARNING: Building WHERE Clause Dynamically
     * 
     * Only add filters that are provided
     */
    const where: any = {};
    if (filter.category) {
      where.category = filter.category;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    /**
     * 💡 LEARNING: findAndCountAll
     * 
     * Returns both data and total count in one query
     */
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],  // Newest first
    });

    return {
      products: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get product by primary key (ID)
   */
  async getProductById(id: string): Promise<IProduct | null> {
    return await Product.findByPk(id);
  }

  /**
   * Update a product
   */
  async updateProduct(
    id: string,
    updateData: UpdateProductDTO
  ): Promise<IProduct | null> {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    return await product.update(updateData);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<IProduct | null> {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    await product.destroy();
    return product;
  }

  /**
   * Bulk create products
   */
  async bulkCreateProducts(productsData: CreateProductDTO[]): Promise<IProduct[]> {
    return await Product.bulkCreate(productsData as any[]);
  }

  /**
   * 💡 LEARNING: Search with ILIKE (case-insensitive)
   * 
   * Op.iLike is PostgreSQL-specific (case-insensitive LIKE)
   * Op.or allows multiple conditions
   */
  async searchProducts(query: string): Promise<IProduct[]> {
    return await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 50,
    });
  }

  /**
   * 💡 LEARNING: Range Queries
   * 
   * Op.between finds values in a range (inclusive)
   */
  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<IProduct[]> {
    return await Product.findAll({
      where: {
        price: {
          [Op.between]: [minPrice, maxPrice],
        },
      },
    });
  }

  /**
   * 💡 LEARNING: Aggregation with Sequelize
   * 
   * Uses SQL functions: COUNT, AVG, SUM
   * Groups results by category
   */
  async getProductStats(): Promise<any[]> {
    return await Product.findAll({
      attributes: [
        'category',
        [Product.sequelize!.fn('COUNT', Product.sequelize!.col('id')), 'count'],
        [Product.sequelize!.fn('AVG', Product.sequelize!.col('price')), 'avgPrice'],
        [Product.sequelize!.fn('SUM', Product.sequelize!.col('quantity')), 'totalQuantity'],
      ],
      group: ['category'],
      raw: true,
    }) as any[];
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts(threshold: number = 10): Promise<IProduct[]> {
    return await Product.findAll({
      where: {
        quantity: {
          [Op.lte]: threshold,  // Less than or equal to
        },
        status: 'available',
      },
    });
  }

  /**
   * Count products
   */
  async countProducts(filter: ProductFilter = {}): Promise<number> {
    const where: any = {};
    if (filter.category) {
      where.category = filter.category;
    }
    if (filter.status) {
      where.status = filter.status;
    }
    return await Product.count({ where });
  }
}

/**
 * 💡 LEARNING: Singleton Export
 */
export default new PostgresService();

export { PostgresService };
