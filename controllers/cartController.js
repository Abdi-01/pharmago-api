const pool = require('../db');
const { asyncQuery } = require('../helpers/asyncQuery');

module.exports = {
    addCart: (req, res) => {
        //console.log('addcart req.body: ', req.body);
        let sqlInsert = `INSERT into tbcart SET ?`;

        pool.query(sqlInsert, req.body, (err, results) => {
            if (err) //console.log(err);

            res.status(200).send({ message: 'Add to Cart Success' });
        });
    },
    addCustomCart: (req, res) => {
        //console.log('addcustomcart req.body: ', req.body); // butuh ==> tbcartCustom: iduser, qty_kapsul, total_harga | tbcartCustom_detail:  idproduct, qty_per_satuan, total_price_satuan
        let cartCustom = req.body.cartCustom[0];
        let cartCustom_detail = req.body.cartCustom_detail;

        let sqlAdd = `INSERT INTO tbcartCustom (iduser, qty_kapsul, total_harga)
                    VALUES ( ${cartCustom.iduser}, ${pool.escape(
            cartCustom.qty_kapsul
        )}, ${pool.escape(cartCustom.total_harga)});`;

        pool.query(sqlAdd, (err1, results1) => {
            if (err1) {
                //console.log(err1);
                res.status(500).send(err1);
            }

            //console.log('addcustom results1: ', results1);

            if (results1) {
                let sqlAddDetail = `INSERT INTO tbcartCustom_detail VALUES `;

                let data = [];

                cartCustom_detail.forEach((item) => {
                    data.push(
                        `(null, ${pool.escape(results1.insertId)}, ${pool.escape(
                            item.idproduct
                        )}, ${pool.escape(item.qty_per_satuan)}, ${pool.escape(
                            item.total_price_satuan
                        )}) `
                    );
                });

                //console.log('data to string: ', data.toString());

                pool.query(sqlAddDetail + data.toString(), (err2, results2) => {
                    if (err2) {
                        //console.log(err2);
                        res.status(500).send(err2);
                    }
                    //console.log('cek results2: ', results2);

                    res.status(200).send('add custom cart success');
                });
            }
        });
    },
    getCart: async (req, res) => {
        //console.log('cek iduser getcard controller: ', req.user.iduser);
        try {
            let sqlGet = `SELECT tbp.*, tbps.*, tbc.*, tbca.* FROM tbproduct tbp JOIN tbcart tbca ON tbp.idproduct = tbca.idproduct
            JOIN tbproduct_stock tbps ON tbp.idproduct = tbps.idproduct
            JOIN tbproduct_category tbpc ON tbp.idproduct = tbpc.idproduct
            JOIN tbcategory tbc ON tbc.idcategory = tbpc.idcategory
            WHERE tbps.status = 'ready' AND tbps.type_obat = 'umum' AND tbca.isActive = 1  AND tbp.is_deleted = 'false'                            
            AND tbca.iduser = ${req.user.iduser}; `;

            let results = await asyncQuery(sqlGet);
            //console.log('==>', results);
            res.status(200).send({ cartUser: results });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: 'success', error: true });
        }
    },
    getCustomCart: async (req, res) => {
        //console.log('cek iduser getcustomcart controller: ', req.user.iduser);
        try {
            let sqlGet = `SELECT * FROM tbcartCustom tbcc JOIN tbcartCustom_detail tbccd
                ON tbcc.idcartCustom = tbccd.idcartCustom
                JOIN tbproduct tbp ON tbp.idproduct = tbccd.idproduct
                WHERE tbcc.isActive = 1
                AND tbcc.iduser = ${req.user.iduser}; `

            let results = await asyncQuery(sqlGet);

            res.status(200).send({ customCart: results });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    deleteCart: async (req, res) => {
        try {
            let sqlDel = `DELETE FROM tbcart WHERE idcart = ${req.params.idcart}; `
            //console.log('cek idcart deleteCart controller: ', req.params.idcart)
            let results = await asyncQuery(sqlDel);

            res.status(200).send({ message: 'Delete Cart Success' });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    deleteCustomCart: async (req, res) => {
        // console.log(
        //     'cek idcustomcart delete controller: ',
        //     req.params.idcartCustom
        // );

        try {
            let sqlDel1 = `DELETE FROM tbcartCustom WHERE idcartCustom = ${req.params.idcartCustom}; `;
            let sqlDel2 = `DELETE FROM tbcartCustom_detail WHERE idcartCustom = ${req.params.idcartCustom}; `;

            let results1 = await asyncQuery(sqlDel1);
            let results2 = await asyncQuery(sqlDel2);

            res.status(200).send({ message: 'Delete Cart Success' });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    updateCart: (req, res) => {
        //console.log('cek req.body updatecart: ', req.body, req.params.idcart);
        let sqlget = `SELECT * FROM tbcart tbc JOIN tbproduct_stock tbps ON tbc.idproduct = tbps.idproduct
                    WHERE tbc.idcart = ${req.params.idcart}; `

        pool.query(sqlget, (err1, results1) => {
            if (err1) res.status(500).send(err);
            let sqlGet2 = `SELECT tbp.*, tbps.*, tbc.*, tbca.* FROM tbproduct tbp JOIN tbcart tbca ON tbp.idproduct = tbca.idproduct
                    JOIN tbproduct_stock tbps ON tbp.idproduct = tbps.idproduct
                    JOIN tbproduct_category tbpc ON tbp.idproduct = tbpc.idproduct
                    JOIN tbcategory tbc ON tbc.idcategory = tbpc.idcategory
                    WHERE tbps.status = 'ready' AND tbps.type_obat = 'umum' AND tbca.isActive = 1  AND tbp.is_deleted = 'false'
                    AND tbca.iduser = ${results1[0].iduser}; `
            if (req.body.qty > 0 && req.body.qty <= results1[0].stock_pcs) {
                let sqlUpdate = `UPDATE tbcart SET qty = ${req.body.qty} WHERE idcart = ${req.params.idcart}; `;

                pool.query(sqlUpdate, (err2, results2) => {
                    if (err2) res.status(500).send(err2);

                    pool.query(sqlGet2, (err3, results3) => {
                        if (err3) res.status(500).send(err3);

                        res.status(200).send({ cartUser: results3 });
                    });
                });
                // tambahkan limit di mysql lalu apabila true akan ada kondisi
            }
        });
    },
    updateNote: async (req, res) => {
        try {
            let sqlUpdate = `UPDATE tbcart SET note = ${req.body.note} WHERE idcart = ${req.params.idcart}; `;
            let results = await asyncQuery(sqlUpdate);

            // res.status(200).send({ cartUser: results })
            res.status(200).send('success');
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
};
