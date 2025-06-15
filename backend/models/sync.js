const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize");
const loadModules = require("../utils/loadModules");

const models = loadModules("", __dirname);

// Function to create database if it doesn't exist
async function createDatabaseIfNotExists() {
  const tempSequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false
  });

  try {
    console.log("[ INFO ] Checking if database exists...");
    await tempSequelize.authenticate();

    const [results] = await tempSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`
    );

    if (results.length === 0) {
      console.log(`[ INFO ] Database '${process.env.DB_NAME}' does not exist. Creating...`);
      await tempSequelize.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`[ INFO ] Database '${process.env.DB_NAME}' created successfully!`);
    } else {
      console.log(`[ INFO ] Database '${process.env.DB_NAME}' already exists.`);
    }

  } catch (error) {
    console.error("[ ERROR ] Error checking/creating database:", error.message);
    throw error;
  } finally {
    await tempSequelize.close();
  }
}

async function sync() {
  try {
    console.log("[ INFO ] Starting database sync...");

    // First, ensure database exists
    await createDatabaseIfNotExists();

    // Now test connection to the actual database
    console.log("[ INFO ] Connecting to database...");
    await sequelize.authenticate();
    console.log("[ INFO ] Database connection established successfully");

    // Sync the model with the database
    console.log("[ INFO ] Syncing database schema...");
    await sequelize.sync({ force: false, alter: true });
    console.log("[ INFO ] All tables have synced successfully!");
    
    // IMPORTANT: Import and initialize all models AFTER database connection
    console.log("[ INFO ] Loading and initializing models...");

    // Show created tables
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log("[ INFO ] Tables in database:");
    tables.forEach(table => {
      console.log(`  - ${table[0]}`);
    });

    console.log("[ INFO ] Database sync completed successfully!");
  } catch (error) {
    console.error("[ ERROR ] Error while syncing database:", error);
    if (error.name === 'SequelizeConnectionError') {
      console.error("[ ERROR ] Database connection failed. Please check:");
      console.error("  - Database server is running");
      console.error("  - Database credentials are correct");
      console.error("  - Database host and port are accessible");
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error("[ ERROR ] Database access denied. Please check user permissions.");
    }
    throw error;
  }
}

module.exports = sync;