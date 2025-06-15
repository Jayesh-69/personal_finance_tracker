// Load environment variables first
require("dotenv").config({
  override: true
});

// Imports
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sync = require("./models/sync");
const loadRoutes = require("./middleware/loadRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Global middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('[ ERROR ] Unhandled error:', error);

  // Don't send stack trace in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Internal Server Error',
      ...(isDevelopment && { stack: error.stack })
    }
  });
});

async function main() {
  try {
    const load = process.argv.includes("--load");

    if (load) {
      console.log("[ INFO ] Starting database sync...");
      await sync();
      console.log("[ INFO ] Database sync completed successfully");
      return process.exit(0);
    }

    // Load routes dynamically
    loadRoutes(app, { dir: __dirname });

    app.use('*', (req, res) => {
      res.status(404).json({
        error: {
          message: `Route ${req.method} ${req.originalUrl} not found`
        }
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`[ INFO ] Server running on port ${port}`);
      console.log(`[ INFO ] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[ INFO ] Health check: http://localhost:${port}/health`);
    });

  } catch (error) {
    console.error("[ ERROR ] Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[ ERROR ] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ ERROR ] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();