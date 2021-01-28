const router = require('express').Router();
const { cartController } = require('../controllers')
const { readToken } = require('../helpers/tokenRead');


router.post('/add', cartController.addCart)
router.post('/addCustom', cartController.addCustomCart)
router.get('/', readToken,cartController.getCart)
router.get('/custom', readToken,cartController.getCustomCart)
router.delete('/delcart/:idcart', cartController.deleteCart)
router.delete('/delcustom/:idcartCustom', cartController.deleteCustomCart)
router.patch('/updQty/:idcart', cartController.updateCart)
router.patch('/updNote/:idcart', cartController.updateNote)


module.exports = router;
