// drivernya install mysql2
const mysql = require('mysql2');

const pool= mysql.createPool({
    connectionLimit: 100,
    host: '128.199.143.20',
    user: 'alex',
    password: '123!Aa#@',
    database: 'db_pharmago',
    port: 3306,
    multipleStatements: true
})

module.exports = pool;

// pool.query('SELECT * FROM tbusers', (err, result, fields) => {
//     if (err) {
//         return console.log(err)
//     }
//     return console.log(result)
// })