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
  const confirmEmail = userData['confirm-email']; //could not use userData.email-confirm because there is a dash sign. userData['email-confirm'] =  userData.email-confirm 
  const password = userData.password;
  const hashedPassword = await bcrypt.hash(password,10)
  const user = {
    email: email,
    password:hashedPassword,
  };
  
  const existingEmail = await db.getDb().collection('users').findOne({email:email}) 
  console.log(email,password,confirmEmail);

  if (!email||!password||!confirmEmail||email !== confirmEmail){
    console.log('incorrect input');
    return res.redirect('/signup')
  }
  if (email === existingEmail){
    console.log('user already existed');
    return res.redirect('/signup')
  }else{
    await db.getDb().collection('users').insertOne(user);
    res.redirect('/login');
  }
});

router.post('/login', async function (req, res) {
  const userData = req.body;
  const email = userData.email;
  const password = userData.password;

  const existingUser = await db.getDb().collection('users').findOne({email:email});
  if (!existingUser){
    console.log('cannot log in');
    res.redirect('/login')
  };

   const IsCorrectPassword = await bcrypt.compare(password,existingUser.password); //check entered password and password that stored in database
  if (!IsCorrectPassword){
    console.log('password is not correct');
    res.redirect('/login')
  }

  req.session.user ={
    id:existingUser._id,
    email: existingUser.email
  };
  req.session.save(()=>{
    console.log('user authenticated');
    res.redirect('/admin')
  });

});

router.get('/admin', function (req, res) {
  if (!req.session.user){
    return res.render('401').status(401);
  }
  res.render('admin');
});

router.post('/logout', function (req, res) {});

module.exports = router;
