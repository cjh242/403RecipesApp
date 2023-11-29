if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

let express = require('express');
let app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const projectRoot = path.join('403RecipesApp', '/');
const { Client } = require('pg');
const { Sequelize, DataTypes } = require('sequelize');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => User.findOne({ where: { email } }),
    id => User.findByPk(id)
//email => users.find(user => user.email === email),
//id => users.find(user => user.id === id)
);

// const client = new Client({
//         host : "recipes-server.cgflce8swton.us-east-1.rds.amazonaws.com",
//         user : "postgres",
//         password : "Elliot24Conway23",
//         database : "recipes-data",
//         port : 5432,
//         ssl: {
//             rejectUnauthorized: false,
//         },
// });

const sequelize = new Sequelize('recipes-data', 'postgres', 'Elliot24Conway23', {
    host: 'recipes-server.cgflce8swton.us-east-1.rds.amazonaws.com',
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Use only if using a self-signed certificate or if not using a certificate
        },
      },
  });

var cheapCooks = 'AppContents/';
var stylesheets = '';
//const users = [];

const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: false,
  });

  module.exports = User;

// client.connect()
//   .then(() => {
//     console.log('Connected to the database');
//     // Your code for executing queries goes here
//   })
//   .catch(err => {
//     console.error('Error connecting to the database', err);
//   });

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.set('views', '/Users/conwayhogan/Desktop/403/403RecipesApp/AppContents/views')

app.use(express.static(path.join(stylesheets, 'AppContents')));

app.get("/", checkAuthenticated, (req, res) => { 
    res.render('index.html')});

app.get('/register', checkNotAuthenticated, (req, res) => { 
    res.render('register.ejs')});

app.get('/login', checkNotAuthenticated, (req, res) => { 
    res.render('login.ejs')});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
        // Create a new user instance and save it to the database
        const newUser = await User.create({
          email: req.body.email,
          password: hashedPassword,
        });
    
        console.log('New user created:', newUser);
    
        res.redirect('/login');
      } catch (error) {
        console.error(error);
        res.redirect('/register');
      }
    // try {
    //     const hashedPassword = await bcrypt.hash(req.body.password, 10)
    //     users.push({
    //     id: Date.now().toString(),
    //     email: req.body.email,
    //     password: hashedPassword
    //     })
    //     res.redirect('/login')
    // } catch {
    //     res.redirect('/register')
    // }
});

app.post('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login'); // Redirect to the login page or any other desired destination
    });
  });

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

app.listen(3000, () => console.log("The server is listening for a client."));