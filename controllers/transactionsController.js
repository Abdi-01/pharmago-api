const pool = require('../db');
const { asyncQuery } = require('../helpers/asyncQuery');

module.exports = {
  quickBuy: (req, res) => {
    console.log("addTransaction req.body: ", req.body)
    let transaction_type = req.body.transaction_type;
    let abjad = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
    let angka = '1234567890';
    let varRandom = abjad + angka;

    let number = '';
    for (let i = 0; i < 8; i++) {
      number += varRandom.charAt(Math.floor(Math.random() * varRandom.length));
    }
    let tanggal = new Date().getDay();
    let bulan = new Date().getMonth();
    let tahun = new Date().getFullYear();
    let invoice = `INV/${transaction_type}/${tahun}${bulan}${tanggal}/${req.body.checkout.iduser}Q/${number}`;


    console.log("invoice: ", invoice)
    console.log("query sqlAdd: ", req.body.checkout.iduser, invoice, req.body.ongkir, req.body.checkout.total_price, req.body.iduser_address, transaction_type)

    let sqlAdd = `INSERT INTO tbtransaction (iduser, invoice_number, ongkir, total_payment, iduser_address, transaction_type) 
        VALUES ( ${req.body.checkout.iduser}, ${pool.escape(invoice)}, 
        ${pool.escape(req.body.ongkir)}, ${pool.escape(req.body.checkout.total_price)}, 
        ${pool.escape(req.body.iduser_address)}, ${pool.escape(transaction_type)} )`

    pool.query(sqlAdd, (err1, results1) => {
      if (err1) res.status(500).send(err1)

      console.log("results 1 : ", results1)
      if (results1) {
        let sqlAddDetail = `INSERT INTO transaction_detail VALUES (null, ${pool.escape(results1.insertId)}, ${pool.escape(req.body.checkout.idproduct)}, null, ${pool.escape(req.body.checkout.qty_qo)}, ${pool.escape(req.body.checkout.total_price)}, ${pool.escape(req.body.checkout.note)} );`

        pool.query(sqlAddDetail, (err2, results2) => {
          if (err2) res.status(500).send(err2)

          console.log("results 2 : ", results2)

          let sqlGetProduct = `SELECT * FROM tbproduct_stock WHERE idproduct = ${req.body.checkout.idproduct};`

          pool.query(sqlGetProduct, (err3, results3) => {
            if (err3) res.status(500).send(err3)
            console.log("results 3 :", results3)

            let qtyUpdate = parseInt(results3[0].stock_pcs) - parseInt(req.body.checkout.qty_qo)
            // console.log("cek stock: ", results3[0].stock)
            // console.log("cek body qty: ", req.body.qty)
            // console.log("qty baru: ", qtyUpdate)
            let sqlReduceStock = `UPDATE tbproduct_stock SET stock_pcs = ${qtyUpdate} WHERE idproduct = ${req.body.checkout.idproduct};`

            pool.query(sqlReduceStock, (err4, results4) => {
              if (err4) res.status(500).send(err4)

              res.status(200).send({ message: "Quick Transaction Success", idpayment: results1.insertId, success: true, err: null })
            })
          })

        })
      }
    })
  },

  addTransaction: (req, res) => {
    //console.log('addTransaction req.body: ', req.body);
    let transaction_type = req.body.transaction_type;
    let abjad = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
    let angka = '1234567890';
    let varRandom = abjad + angka;

    let number = '';
    for (let i = 0; i < 8; i++) {
      number += varRandom.charAt(Math.floor(Math.random() * varRandom.length));
    }
    let tanggal = new Date().getDay();
    let bulan = new Date().getMonth();
    let tahun = new Date().getFullYear();
    let invoice = `INV/${transaction_type}/${tahun}${bulan}${tanggal}/${req.body.checkout[0].iduser
      }${pool.escape(req.body.idcart[0])}/${number}`;

    //console.log('invoice: ', invoice);
    //console.log('query sqlAdd: ', req.body.checkout[0].iduser, invoice);

    let sqlAdd = `INSERT INTO tbtransaction (iduser, invoice_number, ongkir, total_payment, iduser_address, transaction_type) 
        VALUES ( ${req.body.checkout[0].iduser}, ${pool.escape(invoice)}, ${pool.escape(req.body.ongkir)}, ${pool.escape(req.body.total_payment)}, ${pool.escape(req.body.iduser_address)}, ${pool.escape(transaction_type)} )`;

    pool.query(sqlAdd, (err1, results1) => {
      if (err1) res.status(500).send(err1);

      //console.log('addtransaction results 1 : ', results1);
      if (results1) {
        let sqlAddDetail = `INSERT INTO transaction_detail VALUES `;

        let data = [];
        let getIdProduct = [];

        if (transaction_type === 'QO') {
          req.body.checkout.forEach((item, index) => {
            data.push(`(null, ${pool.escape(results1.insertId)}, ${pool.escape(item.idproduct)}, null, ${pool.escape(item.qty_qo)}, ${pool.escape(item.total_price)}, ${pool.escape(item.note)} )`);
            getIdProduct.push(`${pool.escape(item.idproduct)}`);
          });
        } else if (transaction_type === 'CO') {
          req.body.checkout.forEach((item, index) => {
            data.push(`(null, ${pool.escape(results1.insertId)}, ${pool.escape(item.idproduct)}, ${pool.escape(item.qty_co)}, null, ${pool.escape(item.total_price)}, ${pool.escape(item.note)} )`);
            getIdProduct.push(`${pool.escape(item.idproduct)}`);
          });
        } else if (transaction_type === 'ALL') {
          req.body.checkout.forEach((item, index) => {
            data.push(`(null, ${pool.escape(results1.insertId)}, ${pool.escape(item.idproduct)}, null, ${pool.escape(item.qty_qo)}, ${pool.escape(item.total_price)}, ${pool.escape(item.note)} )`);
            getIdProduct.push(`${pool.escape(item.idproduct)}`);
          });
          req.body.checkoutcustom.forEach((item, index) => {
            data.push(`(null, ${pool.escape(results1.insertId)}, ${pool.escape(item.idproduct)}, ${pool.escape(item.qty_co)}, null, ${pool.escape(item.total_price)}, ${pool.escape(item.note)} )`);
            getIdProduct.push(`${pool.escape(item.idproduct)}`);
          });
        }

        //console.log('datatostring: ', data.toString());
        //console.log('getIDproduct stock: ', getIdProduct.toString());

        pool.query(sqlAddDetail + data.toString(), (err2, results2) => {
          if (err2) res.status(500).send(err2);

          //console.log('results 2 : ', results2);

          // fitur mengurangi stock barang
          let sqlGetProduct = `SELECT * FROM tbproduct_stock
                                         WHERE idproduct IN (${getIdProduct.toString()});`;

          pool.query(sqlGetProduct, (err3, results3) => {
            if (err3) res.status(500).send(err3);
            //console.log('results 3 :', results3);

            let sqlReduceStock1 = `INSERT into tbproduct_stock (idproduct_stock, idproduct, stock_pcs, qty_per_pcs, satuan, total_stock_satuan, 
                                                price_pcs, price_per_satuan, status, type_obat) VALUES `;

            let sqlReduceStock2 = ` ON DUPLICATE KEY UPDATE
                            idproduct = VALUES(idproduct), 
                            stock_pcs = VALUES(stock_pcs),
                            qty_per_pcs = VALUES(qty_per_pcs),
                            satuan = VALUES(satuan),
                            total_stock_satuan = VALUES(total_stock_satuan),
                            price_pcs = VALUES(price_pcs),
                            price_per_satuan = VALUES(price_per_satuan),
                            status = VALUES(status),
                            type_obat = VALUES(type_obat);`;

            let update = [];

            results3.forEach((item, index) => {
              let stockBaru = 0;
              let stockSatuanBaru = 0;
              if (transaction_type === 'QO') {
                req.body.checkout.forEach((element, id) => {
                  if (item.idproduct === element.idproduct) {
                    stockBaru = item.stock_pcs - element.qty_qo;
                  }
                });
                update.push(`(${pool.escape(item.idproduct_stock)}, ${pool.escape(item.idproduct)}, ${pool.escape(stockBaru)}, ${pool.escape(item.qty_per_pcs)}, ${pool.escape(item.satuan)}, ${pool.escape(item.total_stock_satuan)}, ${pool.escape(item.price_pcs)}, ${pool.escape(item.price_per_satuan)}, ${pool.escape(item.status)}, ${pool.escape(item.type_obat)} )`);
              } else if (transaction_type === 'CO') {
                req.body.checkout.forEach((element, id) => {
                  if (item.idproduct === element.idproduct) {
                    stockSatuanBaru = item.total_stock_satuan - element.qty_co;
                    stockBaru = parseFloat(stockSatuanBaru / item.qty_per_pcs);
                  }
                });
                update.push(`(${pool.escape(item.idproduct_stock)}, ${pool.escape(item.idproduct)}, ${pool.escape(stockBaru)}, ${pool.escape(item.qty_per_pcs)}, ${pool.escape(item.satuan)}, ${pool.escape(stockSatuanBaru)}, ${pool.escape(item.price_pcs)}, ${pool.escape(item.price_per_satuan)}, ${pool.escape(item.status)}, ${pool.escape(item.type_obat)} )`);
              } else if (transaction_type === 'ALL') {
                // cart umum
                req.body.checkout.forEach((element, id) => {
                  if (item.idproduct === element.idproduct) {
                    stockBaru = item.stock_pcs - element.qty_qo;
                    update.push(
                      `(${pool.escape(item.idproduct_stock)}, ${pool.escape(item.idproduct)}, ${pool.escape(stockBaru)}, ${pool.escape(item.qty_per_pcs)}, ${pool.escape(item.satuan)}, ${pool.escape(item.total_stock_satuan)}, ${pool.escape(item.price_pcs)}, ${pool.escape(item.price_per_satuan)}, ${pool.escape(item.status)}, ${pool.escape(item.type_obat)} )`);
                  }
                });
                // cart racik
                req.body.checkoutcustom.forEach((element, id) => {
                  if (item.idproduct === element.idproduct) {
                    stockSatuanBaru = item.total_stock_satuan - element.qty_co;
                    stockBaru = parseFloat(stockSatuanBaru / item.qty_per_pcs);
                    update.push(`(${pool.escape(item.idproduct_stock)}, ${pool.escape(item.idproduct)}, ${pool.escape(stockBaru)}, ${pool.escape(item.qty_per_pcs)}, ${pool.escape(item.satuan)}, ${pool.escape(stockSatuanBaru)}, ${pool.escape(item.price_pcs)}, ${pool.escape(item.price_per_satuan)}, ${pool.escape(item.status)}, ${pool.escape(item.type_obat)} )`);
                  }
                });
              }
            });
            //console.log('cek query update stock: ', update.toString());
            // (8, 8, -6, NULL, 'botol', NULL, 114500, NULL, 'ready', 'umum' ),(9, 9, -6, NULL, 'kemasan', NULL, 38500, NULL, 'ready', 'umum'),
            pool.query(
              sqlReduceStock1 + update.toString() + sqlReduceStock2,
              (err4, results4) => {
                if (err4) res.status(500).send(err4);

                let sqlDel = ``;
                let sqlDel2 = ``;

                if (transaction_type === 'QO') {
                  sqlDel = `UPDATE tbcart SET isActive = 0 WHERE idcart IN (${req.body.idcart
                    .map((e) => (e = `(${e})`))
                    .toString()})`;
                } else if (transaction_type === 'CO') {
                  sqlDel = `UPDATE tbcartCustom SET isActive = 0 WHERE idcartCustom = ${req.body.idcart};`;
                } else if (transaction_type === 'ALL') {
                  sqlDel = `UPDATE tbcart SET isActive = 0 WHERE idcart IN (${req.body.idcart.map((e) => (e = `(${e})`)).toString()})`;
                  sqlDel2 = `UPDATE tbcartCustom SET isActive = 0 WHERE idcartCustom = ${req.body.idcartCustom};`;
                }

                pool.query(sqlDel, (err5, results5) => {
                  if (err5) res.status(500).send(err5);

                  if (transaction_type === 'ALL') {
                    pool.query(sqlDel2, (err6, results6) => {
                      if (err6) res.status(500).send(err6);

                      //console.log('addtransaction test log ALL');
                      res.status(200).send({
                        message: 'Transaction Success',
                        idpayment: results1.insertId,
                        success: true,
                        error: null,
                      });
                    });
                  } else {
                    //console.log('addtransaction test log non ALL');
                    res.status(200).send({
                      message: 'Transaction Success',
                      idpayment: results1.insertId,
                      success: true,
                      error: null,
                    });
                  }
                });
              }
            );
          });
        });
      }
    });
  },
  getTransaction: (req, res) => {
    // //console.log("transactionController.js getTrans params: ", req.params.iduser) //1
    console.log("transactionController.js getTrans iduser: ", req.user.iduser) //1
    //console.log("transactionController.js getTrans query idtransaction: ", req.query.idtransaction) //1

    // let sqlGetTransaction = `SELECT * FROM tbtransaction WHERE iduser = ${req.user.iduser} ORDER BY idtransaction DESC;`
    let sqlGetTransaction = ``

    if (req.query.idtransaction) {
      sqlGetTransaction = `SELECT * FROM tbtransaction WHERE iduser = ${req.user.iduser} AND idtransaction = ${req.query.idtransaction};`
    } else {
      sqlGetTransaction = `SELECT * FROM tbtransaction WHERE iduser = ${req.user.iduser} ORDER BY idtransaction DESC;`
    }

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
    console.log('payment', req.params.idtransaction)
    let sqlPay = `UPDATE tbtransaction SET payment_status = "Paid" WHERE idtransaction = ${req.params.idtransaction};`;

    pool.query(sqlPay, (err, results) => {
      if (err) res.status(500).send(err);
      res.status(200).send('Payment Success');
    });
  },
  getAllTransaction: async (req, res) => {
    try {
      let sqlGetAllTrx = `SELECT tu.*, tt.*, tu.name as customer, td.*, tp.*, ta.*, ts.* FROM tbtransaction tt 
      JOIN tbuser tu ON tt.iduser = tu.iduser
      JOIN transaction_detail td ON tt.idtransaction = td.idtransaction
      JOIN tbproduct tp ON td.idproduct = tp.idproduct 
      JOIN tbuser_address ta ON tu.iduser = ta.iduser
      JOIN tbproduct_stock ts ON tp.idproduct = ts.idproduct
      order by tt.created_at desc;`;
      let results = await asyncQuery(sqlGetAllTrx);
      // //console.log('=====>', results);
      res.status(200).send({ dataTrx: results });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  getAllTransactionDetail: async (req, res) => {
    try {
      let sqlGetAllDetailTrx = `SELECT tu.*, tt.*, tu.name as customer, td.*, tp.*, ta.*, ts.* FROM tbtransaction tt 
                                    JOIN tbuser tu ON tt.iduser = tu.iduser
                                    JOIN transaction_detail td ON tt.idtransaction = td.idtransaction
                                    JOIN tbproduct tp ON td.idproduct = tp.idproduct 
                                    JOIN tbuser_address ta ON tu.iduser = ta.iduser
                                    JOIN tbproduct_stock ts ON tp.idproduct = ts.idproduct
                                    WHERE tt.idtransaction = ${req.params.idtransaction}
                                    order by tt.created_at desc;`;

      let results = await asyncQuery(sqlGetAllDetailTrx);
      res.status(200).send({ dataTrx: results });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  getReportTrx: async (req, res) => {
    try {
      let sqlGetTrx = `SELECT td.idproduct, tp.name, sum(td.qty_co) as qty_terjual FROM tbtransaction tt
                                            JOIN transaction_detail td ON tt.idtransaction = td.idtransaction
                                            JOIN tbproduct_stock ts ON td.idproduct = ts.idproduct
                                            JOIN tbproduct tp ON ts.idproduct = tp.idproduct
                                            WHERE ts.type_obat = 'racik'
                                            GROUP BY td.idproduct
                                            ORDER BY td.idproduct`;

      let results = await asyncQuery(sqlGetTrx);
      res.status(200).send({ reportData: results });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  getReportChart: async (req, res) => {
    try {
      let sqlGet = `SELECT date_format(tt.created_at, '%M') AS bulan, sum(floor(tt.total_payment)) as total_penjualan_per_bulan FROM tbtransaction tt
                                      JOIN transaction_detail td ON tt.idtransaction = td.idtransaction
                                      JOIN tbproduct_stock ts ON td.idproduct = ts.idproduct
                                      JOIN tbproduct tp ON ts.idproduct = tp.idproduct
                                      WHERE tt.payment_status = 'paid'
                                      GROUP BY  date_format(tt.created_at, '%M') 
                                      ORDER BY  date_format(tt.created_at, '%M')`;
      let results = await asyncQuery(sqlGet);
      res.status(200).send({ reportData: results });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
