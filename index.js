let express = require('express');

let app = express();

const path = require('path');

const projectRoot = path.join('403RecipesApp', '/');

var cheapCooks = 'AppContents/';

var stylesheets = '';

app.use(express.static(path.join(stylesheets, 'AppContents')));

app.get("/", (req, res) => res.sendFile(path.join(cheapCooks, 'index.html')));

app.listen(3000, () => console.log("The server is listening for a client."));