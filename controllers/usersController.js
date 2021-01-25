const pool = require('../db');
const { asyncQuery } = require('../helpers/asyncQuery');
const { createJWTToken } = require('../helpers/tokenCreate');
const hbs = require('nodemailer-express-handlebars');
const transporter = require('../helpers/sendEmail');
const Crypto = require('crypto');

module.exports = {
  registerUser: async (req, res) => {
    try {
      console.log(req.body.data);
      let {
        name,
        email,
        handphone,
        password,
        provinsi,
        kota,
        kecamatan,
        alamat_detail,
        kode_pos,
      } = req.body.data;

      let sqlGet = `SELECT * FROM tbuser`;
      let sqlInsert = `INSERT INTO tbuser SET ?`;
      let sqlInsertAddress = `INSERT INTO tbuser_address SET ?`;

      // hash password
      let hashPassword = Crypto.createHmac('sha256', 'xxQWd#@')
        .update(password)
        .digest('hex');

      // create OTP for validation account
      let char = '0123456789abcdefghijklmnopqrstuvwxyz';
      let OTP = '';
      for (let i = 0; i < 6; i++) {
        OTP += char.charAt(Math.floor(Math.random() * char.length));
      }

      // check already email
      let allUser = await asyncQuery(sqlGet);
      let userActive = allUser.filter((user) => user.email == email);

      console.log('check OTP', OTP);
      console.log('check hashPassword', hashPassword);
      console.log('check userActive', userActive);

      let dataUserRegistrasi = {
        name,
        email,
        handphone,
        password: hashPassword,
        otp: OTP,
      };

      if (userActive.length == 0) {
        let results = await asyncQuery(sqlInsert, dataUserRegistrasi);
        console.log('check results user', results);

        let dataUserAddress = {
          iduser: results.insertId,
          provinsi,
          kota,
          kecamatan,
          alamat_detail,
          kode_pos,
        };

        let resultsAddress = await asyncQuery(
          sqlInsertAddress,
          dataUserAddress
        );

        console.log('check results address', resultsAddress);

        let sqlGetUser = `SELECT * FROM tbuser WHERE iduser=${results.insertId}`;
        let resultGetUser = await asyncQuery(sqlGetUser);

        if (resultGetUser) {
          let {
            iduser,
            name,
            email,
            handphone,
            role,
            isActive,
          } = resultGetUser[0];
          let token = createJWTToken({
            iduser,
            name,
            email,
            handphone,
            role,
            isActive,
          });

          console.log('check token', token);

          // handlebar setting
          const handlebarsOption = {
            viewEngine: {
              extName: '.html',
              partialsDir: './template',
              layoutsDir: './template',
              defaultLayout: 'registration.html',
            },
            viewPath: './template',
            extName: '.html',
          };
          transporter.use('compile', hbs(handlebarsOption));

          let mail = {
            from: 'PharmaGO<maulana4de@gmail.com>',
            to: email,
            subject: `Account Verification`,
            template: 'registration', // nama file html
            context: {
              name: name,
              otp: OTP,
              link: `http://localhost:3000/verify/${token}`,
              image:
                'https://res.cloudinary.com/azouz/image/upload/v1611285010/pharmago/logo-pharmago_cfqqrs.png',
            },
          };

          transporter.sendMail(mail, (err, res) => {
            if (err) {
              console.log(err);
              return res.status(500).send(err);
            }
          });

          console.log('check resultGetUser', resultGetUser);

          res.status(200).send({
            message: 'Registrasi berhasil',
            user: resultGetUser,
            error: false,
          });
        }
      } else {
        res.status(401).send({
          message: 'Email anda sudah terdaftar',
          error: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Register gagal', error: true });
    }
  },

  loginUser: async (req, res) => {
    try {
      let { email, password } = req.body;

      // decrypt password
      let hashPassword = Crypto.createHmac('sha256', 'xxQWd#@')
        .update(password)
        .digest('hex');
        console.log('mas alx',hashPassword)

      let sqlGetAll = `SELECT * FROM tbuser`;
      let sqlGet = `SELECT *  FROM tbuser 
                              WHERE email = ${pool.escape(email)} 
                              AND password = ${pool.escape(hashPassword)}`;

      // check active email
      let allUsers = await asyncQuery(sqlGetAll);
      let userActive = allUsers.filter((user) => user.email == email);

      if (userActive.length > 0) {
        // if the email or password is wrong
        if (
          userActive[0].email != email ||
          userActive[0].password != hashPassword
        ) {
          res.status(401).send({
            message: 'Email atau Password anda salah',
            error: true,
          });
        } else {
          let results = await asyncQuery(sqlGet);
          console.log('==>', results.length);
          if (results.length > 0) {
            // if the user has verified
            if (results[0].isActive) {
              let {
                iduser,
                name,
                email,
                handphone,
                role,
                isActive,
              } = results[0];
              let token = createJWTToken({
                iduser,
                name,
                email,
                handphone,
                role,
                isActive,
              });
              res.status(200).send({
                message: 'Login berhasil',
                user: results,
                token,
                error: false,
              });
            } else {
              res.status(401).send({
                message: 'Account anda belum terverifikasi',
                error: true,
              });
            }
          }
        }
      } else {
        res.status(401).send({
          message: 'Email anda belum terdaftar',
          error: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Login gagal' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      let { email } = req.body;
      let sqlGetAll = `SELECT * FROM tbuser`;
      let sqlGet = `SELECT *  FROM tbuser 
                              WHERE email = ${pool.escape(email)}`;

      // check active email
      let allUsers = await asyncQuery(sqlGetAll);
      let userActive = allUsers.filter((user) => user.email == email);
      console.log(userActive);
      if (userActive.length > 0) {
        let results = await asyncQuery(sqlGet);
        if (results.length > 0) {
          let { iduser, name, email } = results[0];

          // handlebar setting
          const handlebarsOption = {
            viewEngine: {
              extName: '.html',
              partialsDir: './template',
              layoutsDir: './template',
              defaultLayout: 'template.html',
            },
            viewPath: './template',
            extName: '.html',
          };
          transporter.use('compile', hbs(handlebarsOption));

          let mail = {
            from: 'PharmaGO<maulana4de@gmail.com>',
            to: email,
            subject: `Request Reset Password `,
            template: 'template', // nama file html
            context: {
              name: name,
              link: `http://localhost:3000/reset-password/${iduser}`,
              image:
                'https://res.cloudinary.com/azouz/image/upload/v1611285010/pharmago/logo-pharmago_cfqqrs.png',
            },
          };

          transporter.sendMail(mail, (errorMail, resultsMail) => {
            if (errorMail) {
              console.log(errorMail);
              return res.status(500).send(errorMail);
            }
            console.log('email', results);
          });
          res.status(200).send({
            message: 'Reset email sudah terkirim',
            user: results,
            error: false,
          });
        }
      } else {
        res.status(401).send({
          message: 'Email anda belum terdaftar disitem kami',
          error: true,
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: 'permintaan reset password gagal', error: true });
    }
  },

  resetPassword: async (req, res) => {
    try {
      console.log('Check Req ===>', req.body);
      const { password, iduser } = req.body;

      // encrypt password
      let hashPassword = Crypto.createHmac('sha256', 'xxQWd#@')
        .update(password)
        .digest('hex');

      let sqlUpdate = `UPDATE tbuser
                       SET password = ${pool.escape(hashPassword)}
                       WHERE iduser=${pool.escape(iduser)}
                       `;
      let results = await asyncQuery(sqlUpdate);
      if (results) {
        res.status(200).send({
          message: 'Password anda berhasil diperbaharui',
          error: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  keepLogin: async (req, res) => {
    try {
      const { iduser } = req.user;
      let sqlGet = `SELECT *
                        FROM tbuser
                        WHERE iduser = ${iduser}`;
      if (iduser != null) {
        let results = await asyncQuery(sqlGet);

        let { iduser, name, email, handphone, role, isActive } = results[0];

        let token = createJWTToken({
          iduser,
          name,
          email,
          handphone,
          role,
          isActive,
        });
        res.status(200).send({
          message: 'Keep Login berhasil',
          user: results,
          token,
          error: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  getDefaultAddress: async (req, res) => {
    try {
      console.log('cekgetdefaultadress params: ', req.params.iduser)
      const { iduser } = req.params;
      let sqlGet = `SELECT * FROM tbuser_address tbua JOIN tbuser tbu ON tbua.iduser = tbu.iduser
                  WHERE tbu.iduser = ${iduser};`
      let results = await asyncQuery(sqlGet)

      res.status(200).send({ defaultAddress: results })
    } catch (error) {
      console.log(error)
      res.status(500).send(error);
    }
  },
  accountVerify: async (req, res) => {
    try {
      console.log('Check Req ===>', req.body);
      const { otp } = req.body;

      let sqlUpdate = `UPDATE tbuser
                       SET isActive = 1
                       WHERE otp=${pool.escape(otp)}`;

      let results = await asyncQuery(sqlUpdate);
      if (results) {
        res.status(200).send({
          message: 'Akun anda sudah terverifikasi',
          error: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
