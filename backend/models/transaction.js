const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = require("./users");
const Category = require("./category");
const SubCategory = require("./subcategory");

class Transactions extends Model { }

Transactions.init({
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
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "categories", key: "id" }
  },
  subcategoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: "sub_category", key: "id" }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false
  },
  description: DataTypes.TEXT,
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: "Transactions",
  tableName: "transactions",
  timestamps: true
});

User.hasMany(Transactions, { foreignKey: "userId" });
Transactions.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Transactions, { foreignKey: "userId" });
Transactions.belongsTo(Category, { foreignKey: "categoryId" });

SubCategory.hasMany(User, { foreignKey: "userId" });
Transactions.belongsTo(SubCategory, { foreignKey: "subcategoryId" });

module.exports = Transactions;
