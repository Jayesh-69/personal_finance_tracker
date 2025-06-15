const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

const Category = require("./category");

class SubCategory extends Model { }

SubCategory.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "categories", key: "id" }
  }, name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: "SubCategory",
  tableName: "sub_category",
  timestamps: true
});

Category.hasMany(SubCategory, { foreignKey: "categoryId" });
SubCategory.belongsTo(Category, { foreignKey: "categoryId" });

module.exports = SubCategory;
