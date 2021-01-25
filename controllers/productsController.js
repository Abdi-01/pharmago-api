const pool = require('../db');
const { asyncQuery } = require('../helpers/asyncQuery');
module.exports = ({
    getProducts: (req, res) => {
        console.log('getProducts req.query.idproduct: ', req.query.idproduct)
        console.log('getProducts req.query.idcategory: ', req.query.idcategory)

        let sqlJoin = `tbp.*, tbps.*, tbc.* FROM tbproduct tbp JOIN tbproduct_stock tbps ON tbp.idproduct = tbps.idproduct
                        JOIN tbproduct_category tbpc ON tbp.idproduct = tbpc.idproduct
                        JOIN tbcategory tbc ON tbc.idcategory = tbpc.idcategory
                        WHERE tbps.status = 'ready' AND tbps.type_obat = 'umum'`
        let sqlGet = ''

        if (req.query.idproduct) {
            sqlGet = `SELECT ${sqlJoin} AND tbp.idproduct = ${req.query.idproduct};`
        } else if (req.query.idcategory) {
            sqlGet = `SELECT ${sqlJoin} AND tbc.idcategory = ${req.query.idcategory};`
        } else {
            sqlGet = `SELECT ${sqlJoin};`
        }


        pool.query(sqlGet, (err, results) => {
            if (err) res.status(500).send(err)

            res.status(200).send({ products: results })
        })
    },
    getCustomProducts: async (req, res) => {
        try {
            let sqlGet = `SELECT tbp.idproduct, tbp.name, tbps.* FROM tbproduct tbp JOIN tbproduct_stock tbps ON tbp.idproduct = tbps.idproduct
            WHERE tbps.status = 'ready' AND tbps.type_obat = 'racik';`

            let results = await asyncQuery(sqlGet)

            res
                .status(200)
                .send({ customProducts: results });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: 'Get products failed' });
        }
    },
    getCategory: (req, res) => {
        let sqlGet = `SELECT * FROM tbcategory;`

        pool.query(sqlGet, (err, results) => {
            if (err) res.status(500).send(err)

            res.status(200).send({ category: results })
        })
    },
    getCategory: (req, res) => {
        let sqlGet = `SELECT * FROM tbcategory;`;

        pool.query(sqlGet, (err, results) => {
            if (err) res.status(500).send(err);
            res.status(200).send({ category: results });
        });
    },

    getProductSearch: async (req, res) => {
        // console.log('req', req.query.keywordSearch.length);
        const { keyword } = req.query;
        try {
            let sqlGet = `SELECT * FROM tbproduct WHERE name LIKE "${keyword}%"`;

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
