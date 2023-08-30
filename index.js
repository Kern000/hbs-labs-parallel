const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('connect-flash');

// create an instance of express app
let app = express();

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
  secret: "meow123",
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use(function(req,res,next){
  const successMessages = req.flash("success");
  const errorMessages = req.flash("error");
  res.locals.success_messages = successMessages;
  res.locals.error_messages = errorMessages;
  next();
})

const landingRoutes = require('./routes/landing');
const posterRoutes = require('./routes/posters');
const userRoutes = require('./routes/user');

async function main() {
    app.use('/', landingRoutes);
    app.use('/posters', posterRoutes);	
    app.use('/user', userRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});