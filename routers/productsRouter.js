const router = require('express').Router();
const { productsController } = require('../controllers')

router.get('/', productsController.getProducts)

module.exports = router;