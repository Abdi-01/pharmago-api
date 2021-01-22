const pool = require('../db')

module.exports = ({
    getProducts: (req, res) => {
        console.log('getProducts req.query.idproduct: ', req.query.idproduct)
        console.log('getProducts req.query.idcategory: ', req.query.idcategory)

        let sqlJoin = `tbp.*, tbc.* FROM tbproduct tbp JOIN tbproduct_category tbpc ON tbp.idproduct = tbpc.idproduct
                        JOIN tbcategory tbc ON tbc.idcategory = tbpc.idcategory`
        let sqlGet = ''

        if (req.query.idproduct) {
            sqlGet = `SELECT ${sqlJoin} WHERE tbp.idproduct = ${req.query.idproduct};`
        } else if (req.query.idcategory) {
            sqlGet = `SELECT ${sqlJoin} WHERE tbc.idcategory = ${req.query.idcategory};`
        } else {
            sqlGet = `SELECT ${sqlJoin};`
        }


        pool.query(sqlGet, (err, results) => {
            if (err) res.status(500).send(err)

            res.status(200).send({products: results})
        })
    },
    getCategory: (req, res) => {
        let sqlGet = `SELECT * FROM tbcategory;`

        pool.query(sqlGet, (err, results) => {
            if (err) res.status(500).send(err)

            res.status(200).send({category: results})
        })
    }
})