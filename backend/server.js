require('dotenv').config();
const app = require('./src/app');
const { connectMongoDB } = require('./src/config/database');
const { sequelize } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Initialize databases and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ MongoDB connected successfully');

    // Test PostgreSQL connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Sync PostgreSQL models (use { force: false } in production)
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL models synced');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 MongoDB endpoints: http://localhost:${PORT}/api/mongo`);
      console.log(`🔌 PostgreSQL endpoints: http://localhost:${PORT}/api/postgres`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();
