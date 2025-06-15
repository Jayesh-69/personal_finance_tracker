require('dotenv').config();
const { User } = require('../models');
const sequelize = require('../config/sequelize');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const user = await User.create({
      name: 'Jayesh',
      email: 'jayesh@gmail.com',
      password: 'Jayesh@123'
    });

    console.log('✅ User created:', user.toJSON());
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
