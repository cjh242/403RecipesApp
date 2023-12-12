// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config()
//   }

let express = require('express');
let app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const projectRoot = path.join('403RecipesApp', '/');
//const { Client } = require('pg');
const { Sequelize, DataTypes } = require('sequelize');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => User.findOne({ where: { email } }),
    id => User.findByPk(id)
);

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
const baseDir = __dirname;
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

  const Recipe = sequelize.define('recipe', {
    // Define recipe attributes
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ingredients: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    instructions: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    }, {
    timestamps: false,
    // ... other recipe attributes
    });
  // Define the foreign key relationship
  Recipe.belongsTo(User, {
    foreignKey: {
      allowNull: false,
    },
  });

  module.exports = Recipe;

  // sequelize.sync({ force: true }) // Set force to true to drop and recreate tables (for development)
  // .then(() => {
  //   console.log('Database and tables synced!');
  // })
  // .catch((error) => {
  //   console.error('Error syncing database:', error);
  // });

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.set('views', path.join(baseDir, 'AppContents', 'views'))

app.use(express.static(path.join(stylesheets, 'AppContents')));

app.get("/", (req, res) => { 
    res.render('index.ejs', { isAuthenticated: req.isAuthenticated()})});

app.get("/new", checkAuthenticated, (req, res) => { 
    res.render('addRecipe.ejs', { isAuthenticated: req.isAuthenticated(), userId: req.user.id })});

app.get("/allrecipes", async (req, res) => {
  const recipes = await Recipe.findAll();
  res.render('allRecipes.ejs',  { isAuthenticated: req.isAuthenticated(), myrecipes: recipes });
});

app.get("/myrecipes", checkAuthenticated, async (req, res) => {
  const UserId = req.user.id;

  const recipes = await Recipe.findAll({ where: { UserId: UserId } });
  res.render('myRecipes.ejs',  { isAuthenticated: req.isAuthenticated(), myrecipes: recipes });
});


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
});

app.post('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login'); // Redirect to the login page
    });
  });

app.post('/new', checkAuthenticated, async (req, res) => {

    const newRecipe = await Recipe.create({
        UserId: req.user.id,
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
    });

    console.log('New recipe created:', newRecipe);
    
    res.redirect('/new');
});

app.post('/deleteRecipe/:id', checkAuthenticated, async (req, res) => {

  const deleteRecipe = await Recipe.destroy({
    where: { id: req.params.id }
  });

  res.redirect('/myrecipes');
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

app.listen(port, () => console.log("The server is listening for a client."));