// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// TextToSVG stuff
var TextToSVG = require('text-to-svg');
var fontURL = "https://cdn.glitch.com/df69dc25-ffb4-49de-9faa-129e415fcbac%2Fslkscre.ttf?1530640044868";

// load font
var textToSVG = TextToSVG.load(fontURL, (err, t2s) => {
  textToSVG = t2s;
});


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});