const router = require('express').Router();
const { productsController } = require('../controllers');

router.get('/', productsController.getProducts);
router.post('/', productsController.addProduct);
router.get('/custom', productsController.getCustomProducts);
router.get('/category', productsController.getCategory);
router.get('/search', productsController.getProductSearch);
router.get('/all-products', productsController.getAllProducts);
router.put('/edit-product/:idproduct', productsController.editProduct);
router.patch('/delete-product/:idproduct', productsController.deleteProduct);

module.exports = router;
