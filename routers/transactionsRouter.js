const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const { readToken } = require('../helpers/tokenRead');


router.post('/add', transactionsController.addTransaction);
router.get('/', readToken, transactionsController.getTransaction);
router.get('/detail/:idtransaction', transactionsController.getTransaction);
router.patch('/payment/:idtransaction', transactionsController.payment)


module.exports = router;