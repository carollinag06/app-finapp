const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('expense', 'income'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit', 'debit', 'pix'),
    allowNull: true
  },
  recurrence: {
    type: DataTypes.ENUM('fixed', 'variable', 'installment'),
    allowNull: true
  },
  installmentsCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  installmentNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  installmentGroupId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  cardId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Transaction;
