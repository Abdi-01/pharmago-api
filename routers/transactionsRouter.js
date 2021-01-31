const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

router.post('/add', transactionsController.addTransaction);
router.get('/:iduser', transactionsController.getTransaction);
router.get('/', transactionsController.getAllTransaction);
router.get(
  '/all-transcation-detail/:idtransaction',
  transactionsController.getAllTransactionDetail
);
router.patch('/payment/:idtransaction', transactionsController.payment);

module.exports = router;
