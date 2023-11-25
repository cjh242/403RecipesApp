let express = require('express');

let app = express();

const path = require('path');

const projectRoot = path.join('403RecipesApp', '/');

const knex = require("knex")({
    client:"pg",
    connection: {
        host : "localhost",
        user : "postgres",
        password : "password123",
        database : "recipes_web",
        port : 5432
    }
});

var cheapCooks = 'AppContents/';

var stylesheets = '';

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.set('views', '/Users/conwayhogan/Desktop/403/403RecipesApp/AppContents/views')

app.use(express.static(path.join(stylesheets, 'AppContents')));

app.get("/", (req, res) => res.sendFile(path.join(cheapCooks, 'index.html')));

app.get('/register', (req, res) => { res.render('register.ejs')});

app.listen(3000, () => console.log("The server is listening for a client."));