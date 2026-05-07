const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const genericController = require('../controllers/genericController');
const authController = require('../controllers/authController');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.put('/auth/profile', auth, authController.updateProfile);

// Resource routes
const resources = ['transactions', 'budgets', 'cards', 'categories', 'investments'];

resources.forEach(resource => {
  router.get(`/${resource}`, auth, genericController.getAll(resource));
  router.post(`/${resource}`, auth, genericController.create(resource));
  router.put(`/${resource}/:id`, auth, genericController.update(resource));
  router.delete(`/${resource}/:id`, auth, genericController.delete(resource));
});

module.exports = router;
