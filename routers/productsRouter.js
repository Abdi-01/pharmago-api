const router = require('express').Router();
const { productsController } = require('../controllers');

router.get('/', productsController.getProducts);
router.post('/', productsController.addProduct);
router.get('/custom', productsController.getCustomProducts);
router.get('/category', productsController.getCategory);
router.get('/search', productsController.getProductSearch);

module.exports = router;
