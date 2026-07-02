import app from './server.js';
import config from './config/env.js';
import connectDatabase from './config/database.js';

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      console.log(`✓ Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
