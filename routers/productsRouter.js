const router = require('express').Router();
const { productsController } = require('../controllers')

router.get('/', productsController.getProducts)
router.get('/category', productsController.getCategory)
router.get('/search', productsController.getProductSearch)

module.exports = router;