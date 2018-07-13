// server.js
// where your node app starts

// init project
var assets = require("./assets");
var express = require('express');
var app = express();
var port = 3000;

const bodyParser = require("body-parser");

var svgPath = require('svg-path'); //https://github.com/PPvG/svg-path
var textToSVG; 

var svgpath = require('svgpath'); 
var clipper = require('clipper-lib');

//https://www.npmjs.com/package/svgpath

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
  console.log(request.body);
	setupSVG();
  response.sendFile(__dirname + '/views/index.html');  
});

app.post('/', function(req, res){
  console.log('post request received');
	var svg = createSVG(req.body.text);
  res.json
  res.append(svg);
  // res.append('svg', svg);
	// res.redirect('..?svg=' + svg);
});

// listen for requests :)
var listener = app.listen(port, function () {
  // console.log('Your app is listening on port ' + listener.address().port);
});

var exports = module.exports = {};

function setupSVG(){
	const TextToSVG = require('text-to-svg');
  	textToSVG = TextToSVG.loadSync();
  	// textToSVG = TextToSVG.loadSync('/assets/handy00.ttf');
} 

function createSVG(text){
  const attributes = {stroke: 'black', fill: 'transparent'};  
  const options = {x: 0, y: 0, fontSize: 100, anchor: 'top baseline', attributes: attributes};
  const svg = textToSVG.getSVG(text, options); // string of svg
  
  // console.log('svg: ' + svg);
  
  var path = textToSVG.getPath(text, options); 
  // console.log('path: ' + path);
  
  var pathD = textToSVG.getD(text, options); // path data from path
  // console.log('pathD: ' + pathD);
  
  var svgPath_path = svgPath(pathD);
  // console.log(svgPath_path.content);
  
  var transformed = svgpath(pathD).round().toString();
  // console.log('transformed ' + transformed);
  
  // removeCounters(svg);
  // TO DO - only do the following if the character has a counter
  
  
  return svg;
}

// remove the counters from specific letters of the SVG
function removeCounters(svg){  
  
}
