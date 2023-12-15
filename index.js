// Conway Hogan, Tiffany Hansen, Elliot Pi, Jaden Gatherum
// Section 002 
// This is how the server talks to the client 

//all imports
let express = require('express');
let app = express();
//sets the port
const port = process.env.PORT || 3000;
//encryption
const bcrypt = require('bcrypt');
//used for authentication
const passport = require('passport');
//flash messages
const flash = require('express-flash');
//sessions
const session = require('express-session');
const methodOverride = require('method-override');
//helps know where stuff is
const path = require('path');
//project root
const projectRoot = path.join('403RecipesApp', '/');
//const { Client } = require('pg');
const { Sequelize, DataTypes } = require('sequelize');

//initializes passport that was set up in passportconfig
const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => User.findOne({ where: { email } }),
    id => User.findByPk(id)
);

//database connection
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

//variables
var cheapCooks = 'AppContents/';
var stylesheets = '';
const baseDir = __dirname;

//user model
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

  //recipe model
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

//using ejs and sessions
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

//routes
//landing page
app.get("/", (req, res) => { 
    res.render('index.ejs', { isAuthenticated: req.isAuthenticated()})});

//add recipe view route
app.get("/new", checkAuthenticated, (req, res) => { 
    res.render('addRecipe.ejs', { isAuthenticated: req.isAuthenticated(), userId: req.user.id })});

//allrecipes view route
app.get("/allrecipes", async (req, res) => {
  const recipes = await Recipe.findAll();
  res.render('allRecipes.ejs',  { isAuthenticated: req.isAuthenticated(), myrecipes: recipes });
});

//my recipes route that only shows the recipes you have added
app.get("/myrecipes", checkAuthenticated, async (req, res) => {
  const UserId = req.user.id;

  const recipes = await Recipe.findAll({ where: { UserId: UserId } });
  res.render('myRecipes.ejs',  { isAuthenticated: req.isAuthenticated(), myrecipes: recipes });
});


//register view route
app.get('/register', checkNotAuthenticated, (req, res) => { 
    res.render('register.ejs')});

//login view route
app.get('/login', checkNotAuthenticated, (req, res) => { 
    res.render('login.ejs')});

//login post
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

//register post that creates a new user
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

//logout page
app.get('/logout', checkAuthenticated, (req, res) => { 
  res.render('logout.ejs')});

//logout action post
app.post('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login'); // Redirect to the login page
    });
  });

//route to add new recipe
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
    
    res.redirect('/myrecipes');
});

// // Display form for editing a recipe
// app.get('/editRecipe', checkAuthenticated, async (req, res) => {

//   const editRecipe = await Recipe.findByPk(req.params.id);
  
//   // Render the form with existing recipe data for editing
//   res.render('editRecipe', { editRecipe, isAuthenticated: req.isAuthenticated() });
// });


// Display form for editing a recipe
app.get('/editRecipe:id', checkAuthenticated, async (req, res) => {

  try {
    // Find the recipe by its primary key (ID)
    const editRecipe = await Recipe.findByPk(req.params.id);
    const UserId = req.user.id;

    // Check if the recipe was found
    if (editRecipe) {
      // Access individual columns
      const title = editRecipe.title;
      const description = editRecipe.description;
      const category = editRecipe.category;
      const ingredients = editRecipe.ingredients;
      const instructions = editRecipe.instructions;

      // Render the form with existing recipe data for editing
      res.render('editRecipe.ejs', {
        title,
        description,
        category,
        ingredients,
        instructions,
        isAuthenticated: req.isAuthenticated(), 
        editRecipe: editRecipe, 
        myuser: UserId
      });
    } else {
      // Handle case where the recipe with the specified ID is not found
      res.status(404).send('Recipe not found');
    }
  } catch (error) {
    // Handle any errors that might occur during database interaction
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/editRecipe/:id', checkAuthenticated, async (req, res) => {
      try {
          // Update user information in the database
          //hashes the password before it is stored in the database
          const [numRowsUpdated, updatedRecipe] = await Recipe.update(
          {
            UserId: req.user.id,
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions,
              
          },
          {
              //finds the current user and uses where to compare it to the database only updating that user
              where: { id: req.params.id },
              returning: true, // Return the updated user
          }
          );
      
          if (numRowsUpdated > 0) {
          res.redirect('/myRecipes');
          } else {
          res.redirect('/');
          }
      } catch (error) {
          // Handle the error
          console.error(error);
          res.redirect('/edit');
      }
  }
  );

//delete recipe
app.get('/deleteRecipe/:id', checkAuthenticated, async (req, res) => {

  const deleteRecipe = await Recipe.destroy({
    where: { id: req.params.id }
  });

  res.redirect('/myrecipes');
});


//function to see if someone is authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
}

//function to see if someone is not authenticated 
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

//listen
app.listen(port, () => console.log("The server is listening for a client."));