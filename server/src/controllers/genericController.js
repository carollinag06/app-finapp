const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Card = require('../models/Card');
const Category = require('../models/Category');
const Investment = require('../models/Investment');

const models = {
  transactions: Transaction,
  budgets: Budget,
  cards: Card,
  categories: Category,
  investments: Investment
};

exports.getAll = (modelName) => async (req, res) => {
  try {
    const Model = models[modelName];
    const items = await Model.findAll({ where: { user_id: req.user.id } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = (modelName) => async (req, res) => {
  try {
    const Model = models[modelName];
    const item = await Model.create({ ...req.body, user_id: req.user.id });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = (modelName) => async (req, res) => {
  try {
    const Model = models[modelName];
    const item = await Model.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = (modelName) => async (req, res) => {
  try {
    const Model = models[modelName];
    const item = await Model.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    
    await item.destroy();
    res.json({ message: 'Item removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
