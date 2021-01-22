const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const db = require('./db');
const { productsRouter, usersRouter } = require('./routers');

const app = express();
const PORT = 5000;

db.getConnection((err) => {
  if (err) {
    console.log(`error connecting:${err.stack} `);
  }
  console.log(`Database connection is going well :) `);
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
app.use(cors());

app.use(bearerToken());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.status(200).send('rest api');
});

app.use('/products', productsRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
