const express = require('express');
const bcrypt = require('bcryptjs')

const db = require('../data/database');
const e = require('express');
const session = require('express-session');

const router = express.Router();

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', async function (req, res) {
  let inputSessionData = req.session.inputData;
  if(!inputSessionData){
    inputSessionData = {
      isError : false,
      message: '',
      email: '',
      confirmEmail:'' 
      }
  }
  req.session.inputData = null; //will show only 1 request if user hit refresh again the previous inpu data will now show
  res.render('signup',{inputData:inputSessionData});
});

router.get('/login', function (req, res) {
  let inputSessionData = req.session.inputData;
  console.log(inputSessionData);
  if(!inputSessionData){
    
    inputSessionData = {
      isError : false,
      message: '',
      email: '',
      confirmEmail:'' 
      }
  }
  console.log(inputSessionData);
  req.session.inputData = null; 
  res.render('login',{inputData:inputSessionData});
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
    // create session for save the input data in case of invalid inpuut
    req.session.inputData = {
    isError : true,
    message: 'Invalid Input',
    email: email,
    confirmEmail:confirmEmail
  };
  // save session to cookie and redirect to signup again
    req.session.save(()=>{
      res.redirect('/signup')
      console.log('incorrect input');
    });
    return 
   }
  if (email === existingEmail){
    req.session.inputData = {
        isError : true,
        message: 'user already existed',
        email: email,
        }
        req.session.save(()=>{
          res.redirect('/signup')
        })
        return;
    }else{
    await db.getDb().collection('users').insertOne(user);
    req.session.inputData = null;  //reset session in signup page
    return res.redirect('/login');
  }
});

router.post('/login', async function (req, res) {
  const userData = req.body;
  const email = userData.email;
  const password = userData.password;

  const existingUser = await db.getDb().collection('users').findOne({email:email});
  if (!existingUser){
      req.session.inputData = {
      isError : true,
      message: 'Cannot login please check input email or password',
      email: email
      }
      
      req.session.save(()=>{
        res.redirect('/login')
      });
      return;
  };

   const IsCorrectPassword = await bcrypt.compare(password,existingUser.password); //check entered password and password that stored in database
  if (!IsCorrectPassword){
    req.session.inputData = {
      isError : true,
      message: 'Cannot login please check input email or password',
      email: email
      }
      req.session.save(()=>{
        res.redirect('/login')
      });
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

router.get('/admin',async function (req, res) {
  const user = await db.getDb().collection('users').findOne({_id:req.session.user.id})
  if (!user || !user.isAdmin){
    res.render('admin');
  }else{
    return res.render('403').status(403);
  }
});

router.get('/profile', function (req, res) {
  if (!req.session.user){
    return res.render('401').status(401);
  }
  res.render('profile');
});

router.post('/logout', function (req, res) {
  req.session.user = null;
  res.redirect('/');
});
  
module.exports = router;
