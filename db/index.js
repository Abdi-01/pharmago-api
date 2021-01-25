const mysql = require('mysql2');

const pool = mysql.createPool({
  connectionLimit: 100,
  host: '128.199.143.20',
  port: 3306,
  user: 'ade',
  password: '123!Aa#@',
  database: 'db_pharmago',
});

module.exports = pool;
