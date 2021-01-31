const pool = require('../db');
const { asyncQuery } = require('../helpers/asyncQuery');
const { uploader } = require('../helpers/uploader');

module.exports = {
  getProducts: (req, res) => {
    // console.log('getProducts req.query.idproduct: ', req.query.idproduct);
    // console.log('getProducts req.query.idcategory: ', req.query.idcategory);

    let sqlJoin = `tbp.*, tbps.*, tbc.* FROM tbproduct tbp JOIN tbproduct_stock tbps ON tbp.idproduct = tbps.idproduct
                        JOIN tbproduct_category tbpc ON tbp.idproduct = tbpc.idproduct
                        JOIN tbcategory tbc ON tbc.idcategory = tbpc.idcategory
                        WHERE tbps.status = 'ready' AND tbps.type_obat = 'umum' AND tbp.is_deleted = 'false'`;
    let sqlGet = '';

    if (req.query.idproduct) {
      sqlGet = `SELECT ${sqlJoin} AND tbp.idproduct = ${req.query.idproduct};`;
    } else if (req.query.idcategory) {
      sqlGet = `SELECT ${sqlJoin} AND tbc.idcategory = ${req.query.idcategory};`;
    } else {
      sqlGet = `SELECT ${sqlJoin};`;
    }

    pool.query(sqlGet, (err, results) => {
      if (err) res.status(500).send(err);

      res.status(200).send({ products: results });
    });
  },
  getCustomProducts: async (req, res) => {
    try {
      let sqlGet = `SELECT tbp.idproduct, tbp.name, tbps.* FROM tbproduct tbp JOIN tbproduct_stock tbps ON tbp.idproduct = tbps.idproduct
            WHERE tbps.status = 'ready' AND tbps.type_obat = 'racik';`;

      let results = await asyncQuery(sqlGet);

      res.status(200).send({ customProducts: results });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Get products failed' });
    }
  },
  getCategory: (req, res) => {
    let sqlGet = `SELECT * FROM tbcategory;`;

    pool.query(sqlGet, (err, results) => {
      if (err) res.status(500).send(err);

      res.status(200).send({ category: results });
    });
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
      let sqlGet = `SELECT * FROM tbproduct WHERE name LIKE "${keyword}% " AND tbp.is_deleted = 'false'`;

      let results = await asyncQuery(sqlGet);
      res
        .status(200)
        .send({ messages: 'Get products was successful', products: results });
    } catch (error) {
      console.log(error);
      res.status(500).send({ messages: 'Get products failed', errors: true });
    }
  },

  addProduct: (req, res) => {
    try {
      let sqlInsert = `INSERT INTO tbproduct SET ?`;
      let sqlInsertProductCategory = `INSERT INTO tbproduct_category SET ?`;
      let sqlInsertProductStock = `INSERT INTO tbproduct_stock SET ?`;

      let path = '/images';
      const upload = uploader(path, 'file').fields([{ name: 'file' }]);
      upload(req, res, async (error) => {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        }

        // upload image file
        const { file } = req.files;
        const filepath = file ? path + '/' + file[0].filename : null;
        let data = JSON.parse(req.body.data);
        data.product_image = filepath;

        let {
          name,
          kategori,
          desc_umum,
          desc_indikasi,
          desc_komposisi,
          desc_dosis,
          desc_aturanpakai,
          desc_kontraindikasi,
          desc_efeksamping,
          desc_perhatian,
          stock_pcs,
          qty_per_pcs,
          satuan,
          price_pcs,
          type_obat,
          isPublish,
          product_image,
        } = data;

        // Insert product table
        let dataProduct = {
          name,
          product_image,
          isPublish,
          desc_umum,
          desc_indikasi,
          desc_komposisi,
          desc_dosis,
          desc_aturanpakai,
          desc_kontraindikasi,
          desc_efeksamping,
          desc_perhatian,
        };
        const resultsInsertProduct = await asyncQuery(sqlInsert, dataProduct);

        // insert table product category
        let dataProductCategory = {
          idcategory: kategori,
          idproduct: resultsInsertProduct.insertId,
        };
        const resultsInsertProductCategory = await asyncQuery(
          sqlInsertProductCategory,
          dataProductCategory
        );

        // insert table product stock
        let dataProductStock = {
          idproduct: resultsInsertProduct.insertId,
          stock_pcs,
          qty_per_pcs,
          satuan,
          total_stock_satuan: stock_pcs * qty_per_pcs,
          price_pcs,
          price_per_satuan: Math.floor(price_pcs / qty_per_pcs),
          type_obat,
        };
        const resultsInsertProductStock = await asyncQuery(
          sqlInsertProductStock,
          dataProductStock
        );

        // response add products
        res.status(200).send({
          messages: 'Produk berhasil di tambahkan',
          error: false,
        });
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ messages: 'Produk gagal ditambahkan', errors: true });
    }
  },
};
