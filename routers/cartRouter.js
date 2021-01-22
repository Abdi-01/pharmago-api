const router = require('express').Router();
const { cartController } = require('../controllers')

router.post('/add', cartController.addCart)
// router.get('/:iduser', readToken,cartController.getCart)
router.get('/:iduser', cartController.getCart)

module.exports = router;
