const express = require('express');
const cors = require('cors'); // memberikan atau menolak akses, middleware
const bodyParser = require('body-parser'); //membaca body/data dari user request
const bearerToken = require('express-bearer-token'); // Agar secret key (token) tidak kelihatan
const PORT = 5000;
const App = express();

App.use(cors()); // jika tidak disetting lagi, berarti semua bisa mengakses
App.use(bodyParser.json()); // bisa juga begini jika data dipastikan berbentuk object
App.use(bearerToken());

// didahulukan menginstal multer : npm install --save multer
// Static : Middleware menjalankan function untuk memberi akses pada folder didalam directory storage
App.use(express.static('public'));

const pool = require('./db');
pool.getConnection(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    // return;
  }

  console.log('database connection is running');
});

const { productsRouter, cartRouter, usersRouter } = require('./routers');

App.get('/', (req, res) => {
  res.status(200).send('Selamat Datang');
});

App.use('/users', usersRouter);
App.use('/products', productsRouter);
App.use('/cart', cartRouter);
// App.use('/files', uploadRouter)

App.listen(PORT, () => console.log('Server running on Port :', PORT));
