const express = require('express')
const { rajaOngkirCOntroller } = require('../controller')
const router = express.Router()

router.get('/getProvince', rajaOngkirCOntroller.getProvince)
router.get('/getCity', rajaOngkirCOntroller.getCity)
router.post('/shippingCost', rajaOngkirCOntroller.shippingCost)

module.exports = router