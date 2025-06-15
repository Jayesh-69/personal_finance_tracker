const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: "#007bff"
  },
  icon: DataTypes.STRING
}, {
  sequelize,
  modelName: "Category",
  tableName: "categories",
  timestamps: true
});

module.exports = Category;
