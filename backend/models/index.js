const sync = require("./sync");

// Export sync function and models will be available through sequelize.models
module.exports = {
  sync,
  // Models will be accessible via sequelize.models after sync
  get User() { return require('./users'); },
  get Transaction() { return require('./transaction'); },
  get Category() { return require('./category'); },
};