const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Investment = sequelize.define('Investment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  current_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  cdi_percentage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Investment;
