let express = require('express');

let app = express();

const path = require('path');

var cheapCooks = '/Users/conwayhogan/Desktop/403/403RecipesApp/AppContents/'

var stylesheets = '/Users/conwayhogan/Desktop/403//403RecipesApp/'

app.use(express.static(path.join(stylesheets, 'AppContents')));

app.get("/", (req, res) => res.sendFile(path.join(cheapCooks, 'index.html')));

app.listen(3000, () => console.log("The server is listening for a client."));