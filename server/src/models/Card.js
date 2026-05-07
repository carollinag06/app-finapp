const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  credit_limit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  closing_day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  due_day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Card;
