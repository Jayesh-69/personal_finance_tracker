const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = require("./users");

class Assets extends Model { }

Assets.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "users", key: "id" }
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "user_account_unique"
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: "Assets",
  tableName: "assets",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["userId", "accountName"],
      name: "user_account_unique"
    }
  ]
});

// Associations
User.hasMany(Assets, { foreignKey: "userId", as: "user" });
Assets.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = Assets;
