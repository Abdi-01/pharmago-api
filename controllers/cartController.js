const pool = require('../db')


module.exports = ({
    addCart: (req, res) => {
        console.log('addcart req.body: ', req.body)
        let sqlInsert = `INSERT into tbcart SET ?`

        pool.query(sqlInsert, req.body, (err, results) => {
            if (err) console.log(err)

            res.status(200).send({ message: "Add to Cart Success"})
        })
    },
    getCart: (req, res) => {
        let sqlGet = `SELECT * FROM tbproduct tbp JOIN tbcart tbc
                        ON tbp.idproduct = tbc.idproduct
                        WHERE tbc.iduser = 1;` // dummyID
                        // WHERE tbc.iduser = ${req.user.iduser};`

        pool.query(sqlGet, (err, results) => {
            if (err) console.log(err)

            res.status(200).send(results)
        })
    }
})