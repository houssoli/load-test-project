const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const config = require('./environment');

// MongoDB Configuration
const connectMongoDB = async () => {
  try {
    const mongoURI = config.isTest() 
      ? config.MONGODB_TEST_URI 
      : config.MONGODB_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

// PostgreSQL Configuration with Sequelize
const sequelize = new Sequelize(
  config.PG_DATABASE,
  config.PG_USER,
  config.PG_PASSWORD,
  {
    host: config.PG_HOST,
    port: config.PG_PORT,
    dialect: 'postgres',
    logging: config.isDevelopment() ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

module.exports = {
  connectMongoDB,
  sequelize,
  mongoose,
};
