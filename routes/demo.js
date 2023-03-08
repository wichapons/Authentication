const express = require('express');
const bcrypt = require('bcryptjs')

const db = require('../data/database');

const router = express.Router();

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', async function (req, res) {
  res.render('signup');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/signup', async function (req, res) {
  const userData = req.body;
  const email = userData.email;
  const confirmEmail = userData['email-confirm']; //could not use userData.email-confirm because there is a dash sign. userData['email-confirm'] =  userData.email-confirm 
  const password = userData.password;
  const hashedPassword = await bcrypt.hash(password,10)
  
  const user = {
    email: email,
    password:hashedPassword,
  };

  await db.getDb().collection('users').insertOne(user);
  res.redirect('/login');
});

router.post('/login', async function (req, res) {});

router.get('/admin', function (req, res) {
  res.render('admin');
});

router.post('/logout', function (req, res) {});

module.exports = router;
