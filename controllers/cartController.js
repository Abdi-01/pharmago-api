const pool = require('../db')
const { asyncQuery } = require('../helpers/asyncQuery');

module.exports = ({
    addCart: (req, res) => {
        console.log('addcart req.body: ', req.body)
        let sqlInsert = `INSERT into tbcart SET ?`

        pool.query(sqlInsert, req.body, (err, results) => {
            if (err) console.log(err)

            res.status(200).send({ message: "Add to Cart Success" })
        })
    },
    getCart: async (req, res) => {
        console.log('cek iduser getcard controller: ', req.user.iduser)
        try {
            let sqlGet = `SELECT tbp.*, tbps.*, tbc.*, tbca.* FROM tbproduct tbp JOIN tbcart tbca ON tbp.idproduct = tbca.idproduct
            JOIN tbproduct_stock tbps ON tbp.idproduct = tbps.idproduct
            JOIN tbproduct_category tbpc ON tbp.idproduct = tbpc.idproduct
            JOIN tbcategory tbc ON tbc.idcategory = tbpc.idcategory
            WHERE tbps.status = 'ready' AND tbps.type_obat = 'umum' AND tbca.isActive = 1                             
            AND tbca.iduser = ${req.user.iduser};`

            let results = await asyncQuery(sqlGet);

            res.status(200).send({ cartUser: results })
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    deleteCart: async (req, res) => {
        console.log('cek idcart deleteCart controller: ', req.params.idcart)

        try {
            let sqlDel = `DELETE FROM tbcart WHERE idcart = ${req.params.idcart};`

            let results = await asyncQuery(sqlDel);

            res.status(200).send({ message: 'Delete Cart Success' })
        } catch (error) {
            console.log(error)
            res.status(500).send(error);
        }
    },
    updateCart: (req, res) => {
        console.log('cek req.body updatecart: ', req.body, req.params.idcart)
        let sqlget = `SELECT * FROM tbcart tbc JOIN tbproduct_stock tbps ON tbc.idproduct = tbps.idproduct
                        WHERE tbc.idcart = ${req.params.idcart};`

        pool.query(sqlget, (err1, results1) => {
            if (err1) res.status(500).send(err)
            
            if (req.body.qty > 0 && req.body.qty <= results1[0].stock_pcs) {
                let sqlUpdate = `UPDATE tbcart SET qty = ${req.body.qty} WHERE idcart = ${req.params.idcart};`
                
                pool.query(sqlUpdate, (err2, results2) => {
                    if (err2) res.status(500).send(err2)

                    res.status(200).send("Update Success!")
                })
            }
        })
    }
})