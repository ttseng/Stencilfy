// server.js
// where your node app starts

// init project
var assets = require("./assets");
var express = require('express');
var app = express();
var port = 3000;

const bodyParser = require("body-parser");

var textToSVG; 

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use("/assets", assets);

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
	// load SVG stuff on page load
	setupSVG();
  	response.sendFile(__dirname + '/views/index.html');  
});

app.post('/', function(req, res){
	console.log(req.body);
	var svg = createSVG(req.body.name);
	console.log(svg);
	res.redirect('..?svg=' + svg);
});

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

var exports = module.exports = {};

function setupSVG(){
	console.log('setup svg');
	const TextToSVG = require('text-to-svg');
  	textToSVG = TextToSVG.loadSync('/assets/handy00.ttf');
} 

function createSVG(text){
  const attributes = {stroke: 'black', fill: 'transparent'};  
  const options = {x: 0, y: 0, fontSize: 100, anchor: 'top baseline', attributes: attributes};
  const svg = textToSVG.getSVG(text, options);
  return svg;
}