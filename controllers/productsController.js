const pool = require('../db')
const { asyncQuery } = require('../helpers/asyncQuery');
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

            res.status(200).send({ products: results })
        })
    },
    getCategory: (req, res) => {
        let sqlGet = `SELECT * FROM tbcategory;`

        pool.query(sqlGet, (err, results) => {
            if (err) res.status(500).send(err)

            res.status(200).send({ category: results })
        })
    },
    getProductSearch: async (req, res) => {
        // console.log('req', req.query.keywordSearch.length);
        const { keyword } = req.query;
        try {
            let sqlGet =
                keyword != undefined
                    ? `SELECT * FROM tbproduct WHERE name LIKE "${keyword}%"`
                    : `SELECT * FROM tbproduct`;

            let results = await asyncQuery(sqlGet);
            res
                .status(200)
                .send({ messages: 'Get products was successful', products: results });
        } catch (error) {
            console.log(error);
            res.status(500).send({ messages: 'Get products failed', errors: true });
        }
    }
})