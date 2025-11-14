const Product = require('../models/postgres/Product');
const { Op } = require('sequelize');

class PostgresService {
  // Create a new product
  async createProduct(productData) {
    return await Product.create(productData);
  }

  // Get all products with pagination
  async getAllProducts(page = 1, limit = 10, filter = {}) {
    const offset = (page - 1) * limit;
    
    const where = {};
    if (filter.category) {
      where.category = filter.category;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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

  // Get product by ID
  async getProductById(id) {
    return await Product.findByPk(id);
  }

  // Update product
  async updateProduct(id, updateData) {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    return await product.update(updateData);
  }

  // Delete product
  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    await product.destroy();
    return product;
  }

  // Bulk create products
  async bulkCreateProducts(productsData) {
    return await Product.bulkCreate(productsData);
  }

  // Search products
  async searchProducts(query) {
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

  // Get products by price range
  async getProductsByPriceRange(minPrice, maxPrice) {
    return await Product.findAll({
      where: {
        price: {
          [Op.between]: [minPrice, maxPrice],
        },
      },
    });
  }

  // Get product stats by category
  async getProductStats() {
    return await Product.findAll({
      attributes: [
        'category',
        [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'count'],
        [Product.sequelize.fn('AVG', Product.sequelize.col('price')), 'avgPrice'],
        [Product.sequelize.fn('SUM', Product.sequelize.col('quantity')), 'totalQuantity'],
      ],
      group: ['category'],
    });
  }

  // Count products
  async countProducts(filter = {}) {
    return await Product.count({ where: filter });
  }

  // Update stock quantity
  async updateStock(id, quantity) {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    
    const newQuantity = product.quantity + quantity;
    const newStatus = newQuantity > 0 ? 'available' : 'out_of_stock';
    
    return await product.update({
      quantity: newQuantity,
      status: newStatus,
    });
  }
}

module.exports = new PostgresService();
