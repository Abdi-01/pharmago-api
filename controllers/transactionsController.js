const pool = require('../db')
const { asyncQuery } = require('../helpers/asyncQuery');

module.exports = ({
    addTransaction: (req, res) => {
        console.log("addTransaction req.body: ", req.body)
        let abjad = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
        let angka = "1234567890";
        let varRandom = abjad + angka;

        let number = ''
        for (let i = 0; i < 8; i++) {
            number += varRandom.charAt(Math.floor(Math.random() * varRandom.length))
        }
        let tanggal = new Date().getDay()
        let bulan = new Date().getMonth()
        let tahun = new Date().getFullYear()
        let invoice = `INV/CO/${tahun}${bulan}${tanggal}/${req.body.checkout[0].iduser}${pool.escape(req.body.idcart[0])}/${number}`

        console.log("invoice: ", invoice)
        console.log("query sqlAdd: ", req.body.checkout[0].iduser, invoice)

        let sqlAdd = `INSERT INTO tbtransaction (iduser, invoice_number, ongkir, total_payment, iduser_address, transaction_type) 
        VALUES ( ${req.body.checkout[0].iduser}, ${pool.escape(invoice)}, ${pool.escape(req.body.ongkir)}, ${pool.escape(req.body.total_payment)}, ${pool.escape(req.body.iduser_address)}, 'CO' )`

        pool.query(sqlAdd, (err1, results1) => {
            if (err1) res.status(500).send(err1)

            console.log("addtransaction results 1 : ", results1)
            if (results1) {
                let sqlAddDetail = `INSERT INTO transaction_detail VALUES `

                let data = []
                let getIdProduct = []

                req.body.checkout.forEach((item, index) => {
                    data.push(`(null, ${pool.escape(results1.insertId)}, ${pool.escape(item.idproduct)}, ${pool.escape(item.qty)}, null, ${pool.escape(item.total_price)}, ${pool.escape(item.note)} )`)
                    getIdProduct.push(`${pool.escape(item.idproduct)}`)
                })
                console.log("datatostring: ", data.toString())
                console.log("getIDproduct stock: ", getIdProduct.toString())

                pool.query(sqlAddDetail + data.toString(), (err2, results2) => {
                    if (err2) res.status(500).send(err2)

                    console.log("results 2 : ", results2)

                    // fitur mengurangi stock barang
                    let sqlGetProduct = `SELECT * FROM tbproduct_stock
                                         WHERE idproduct IN (${getIdProduct.toString()});`

                    pool.query(sqlGetProduct, (err3, results3) => {
                        if (err3) res.status(500).send(err3)
                        console.log("results 3 :", results3)

                        let sqlReduceStock1 = `INSERT into tbproduct_stock (idproduct_stock, idproduct, stock_pcs, qty_per_pcs, satuan, total_stock_satuan, 
                                                price_pcs, price_per_satuan, status, type_obat) VALUES `

                        let sqlReduceStock2 = ` ON DUPLICATE KEY UPDATE
                            idproduct = VALUES(idproduct), 
                            stock_pcs = VALUES(stock_pcs),
                            qty_per_pcs = VALUES(qty_per_pcs),
                            satuan = VALUES(satuan),
                            total_stock_satuan = VALUES(total_stock_satuan),
                            price_pcs = VALUES(price_pcs),
                            price_per_satuan = VALUES(price_per_satuan),
                            status = VALUES(status),
                            type_obat = VALUES(type_obat);`

                        let update = []

                        results3.forEach((item, index) => {
                            let stockBaru = 0
                            req.body.checkout.forEach((element, id) => {
                                if (item.idproduct === element.idproduct) {
                                    stockBaru = (item.stock_pcs - element.qty)
                                }
                            })
                            update.push(`(${pool.escape(item.idproduct_stock)}, ${pool.escape(item.idproduct)}, ${pool.escape(stockBaru)}, ${pool.escape(item.qty_per_pcs)}, ${pool.escape(item.satuan)}, ${pool.escape(item.total_stock_satuan)}, ${pool.escape(item.price_pcs)}, ${pool.escape(item.price_per_satuan)}, ${pool.escape(item.status)}, ${pool.escape(item.type_obat)} )`)
                        })

                        console.log('cek query update stock: ', update.toString())

                        // (8, 8, -6, NULL, 'botol', NULL, 114500, NULL, 'ready', 'umum' ),(9, 9, -6, NULL, 'kemasan', NULL, 38500, NULL, 'ready', 'umum'),

                        pool.query(sqlReduceStock1 + update.toString() + sqlReduceStock2, (err4, results4) => {
                            if (err4) res.status(500).send(err4)

                            let sqlDel = `UPDATE tbcart SET isActive = 0 WHERE idcart IN (${req.body.idcart.map(e => e = `(${e})`).toString()})`

                            pool.query(sqlDel, (err5, results5) => {
                                if (err5) res.status(500).send(err5)
                                
                                res.status(200).send({ message: "Transaction Success", idpayment: results1.insertId, success: true, error: null })
                            })
                        })
                    })

                })
            }
        })
    },

    getTransaction: (req, res) => {
        console.log("transactionController.js getTrans params: ", req.params.iduser) //1

        let sqlGetTransaction = `SELECT * FROM tbtransaction WHERE iduser = ${req.params.iduser} ORDER BY idtransaction DESC;`

        let sqlGetProduct = `SELECT * FROM transaction_detail tr JOIN tbproduct tbp ON tbp.idproduct = tr.idproduct;`

        pool.query(sqlGetTransaction, (err1, results1) => {
            if (err1) res.status(500).send(err1)

            if (results1) {
                pool.query(sqlGetProduct, (err2, results2) => {
                    if (err2) res.status(500).send(err2)

                    results1.forEach((item, index) => {
                        let products = []
                        results2.forEach((element, idx) => {
                            if (item.idtransaction === element.idtransaction) {
                                products.push(element)
                            }
                        })
                        item['products'] = products
                    })

                    res.status(200).send({ transactions: results1 })
                })
            }
        })
    },

    payment: (req, res) => {
        let sqlPay = `UPDATE tbtransaction SET payment_status = "Paid" WHERE idtransaction = ${req.params.idtransaction};`

        pool.query(sqlPay, (err, results) => {
            if (err) res.status(500).send(err)
            res.status(200).send("Payment Success")
        })
    }


})
