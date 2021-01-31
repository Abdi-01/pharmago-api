const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const { readToken } = require('../helpers/tokenRead');


router.post('/add', transactionsController.addTransaction);
router.get('/', readToken, transactionsController.getTransaction);
router.get('/all', transactionsController.getAllTransaction);
router.get('/all-transcation-detail/:idtransaction',
  transactionsController.getAllTransactionDetail
);
router.patch('/payment/:idtransaction', transactionsController.payment);
router.get('/detail/:idtransaction', transactionsController.getTransaction);

module.exports = router;
