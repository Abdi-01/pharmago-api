const express = require('express');
const router = express.Router();
const { readToken } = require('../helpers/tokenRead');
const usersController = require('../controllers/usersController');

router.post('/login', usersController.loginUser);
router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password', usersController.resetPassword);
router.get('/keep-login', readToken, usersController.keepLogin);

module.exports = router;
