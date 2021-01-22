const router = require('express').Router();
const { productsController } = require('../controllers')

router.get('/', productsController.getProducts)
router.get('/category', productsController.getCategory)

module.exports = router;