const express = require('express');
const router = express.Router();
const { readToken } = require('../helpers/tokenRead');
const usersController = require('../controllers/usersController');

router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);
router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password', usersController.resetPassword);
router.get('/keep-login', readToken, usersController.keepLogin);
router.get('/defaultAddress', readToken, usersController.getDefaultAddress);
router.patch('/account-verify', readToken, usersController.accountVerify);

module.exports = router;
