const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('connect-flash');
const csurf = require('csurf');
const cors = require('cors');

// create an instance of express app
let app = express();
app.use(cors());

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(session({
  store: new FileStore(),
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

const csrfInstance = csurf();

app.use(function(req,res,next){

  if (req.url === "/checkout/process-payment" || req.url.slice(0,5) == "/api/"){
     return next();
  }
  csrfInstance(req,res,next);
})

app.use(function(error, req, res, next){
  if(error && error.code == "EBADCSRFTOKEN"){
    req.flash("error", "Session expired, login and try again");
    res.redirect('back');
  } else {
    next();
  }
})

app.use(function(req,res,next){
  if (req.csrfToken){
    res.locals.csrfToken = req.csrfToken();
  }
  next();
})

app.use(function(req,res,next){
  const successMessages = req.flash("success");
  const errorMessages = req.flash("error");
  res.locals.success_messages = successMessages;
  res.locals.error_messages = errorMessages;
  next();
})

app.use(function(req, res, next){
  if (req.session.user){
    res.locals.user = req.session.user;
  }
  next();
})

const landingRoutes = require('./routes/landing');
const posterRoutes = require('./routes/posters');
const userRoutes = require('./routes/user');
const cloudinaryRoutes = require('./routes/cloudinary')
const cartRoutes = require('./routes/cart')
const checkOutRoutes = require('./routes/checkout')
const apiRoutes = {
  posters: require('./routes/api/posters'),
  users: require('./routes/api/users')
}

async function main() {
    app.use('/', landingRoutes);
    app.use('/posters', posterRoutes);	
    app.use('/user', userRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/cart', cartRoutes);
    app.use('/checkout', checkOutRoutes);
    app.use('/api/posters', express.json(), apiRoutes.posters);
    app.use('/api/users', express.json(), apiRoutes.users)
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});