// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var textToSVG; 

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

var exports = module.exports = {};

exports.setupSVG = function(){
  const TextToSVG = require('text-to-svg');
  textToSVG = TextToSVG.loadSync();
}

exports.createSVG = function(text){
  const attributes = {stroke: 'black'};  
  const options = {x: 0, y: 0, fontSize: 72, anchor: 'top', attributes: attributes};
  const svg = textToSVG.getSVG(text, options);
  console.log(svg);
  return svg;
};
