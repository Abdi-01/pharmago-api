const productsRouter = require('./productsRouter');
const cartRouter = require('./cartRouter')
const usersRouter = require('./usersRouter')
const transactionsRouter = require('./transactionsRouter')

module.exports = ({
    productsRouter,
    cartRouter,
    usersRouter,
    transactionsRouter
})