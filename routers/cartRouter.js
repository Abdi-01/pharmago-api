const router = require('express').Router();
const { cartController } = require('../controllers')
const { readToken } = require('../helpers/tokenRead');


router.post('/add', cartController.addCart)
router.get('/:iduser', readToken,cartController.getCart)
router.delete('/:idcart', cartController.deleteCart)
router.patch('/updQty/:idcart', cartController.updateCart)


module.exports = router;
