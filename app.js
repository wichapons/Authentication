const path = require('path');
const express = require('express');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session');

const db = require('./data/database');
const demoRoutes = require('./routes/demo');
const { Cookie } = require('express-session');
const MongodbStore = mongodbStore(session);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

const sessionStore = new MongodbStore({
  uri: 'mongodb://127.0.0.1:27017',
  databaseName: 'auth-demo',
  collection:'sessions',
  cookie:{
    maxAge: 60*100 //100min expire after login
  }
});

app.use(session({
  secret: '#&$(*%&#*($&%&^^@!)&RTSDJFHGJKDHGCGHGjhgfcuis&*%#*@$',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

app.use(async function(req,res,next){
  const user = req.session.user
  const isAuth = req.session.isAuthenticated;
  

  if(!user || !isAuth){
    return next();
  }
  const userDoc = await db.getDb().collection('users').findOne({_id:user.id})
  const isAdmin = userDoc.isAdmin;

  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin
  next();
});

app.use(demoRoutes);

app.use(function(error, req, res, next) {
  res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000)
})
  .catch(function (err) {
  console.error('Failed to connect to database:', err);
});
