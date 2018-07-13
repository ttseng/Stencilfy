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
var ClipperLib = require('clipper-lib');

var counterStrings = "A,B,D,O,P,Q,R,a,b,d,e,g,o,p,q,0,4,6,8,9";
var counters = counterStrings.split(",");

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
  var character = req.body.text;
	var svgPath = createSVG(character);
  var svgWidth = textToSVG.getMetrics(character).width;
  var svgHeight = textToSVG.getMetrics(character).height;
  
  // remove counter if necessary
  if(counters.includes(character)){
    svgPath = removeCounters(svgPath);
  }
  
  var svg = createSVGfromSolution(svgPath, svgWidth, svgHeight);
  
  // return cleaned svg
  res.send(svg);
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

// createSVG
// takes text (string) input and outputs SVG path
function createSVG(text){
  const attributes = {stroke: 'black', fill: 'transparent'};  
  const options = {x: 0, y: 0, fontSize: 100, anchor: 'top baseline', attributes: attributes};
  var svg = textToSVG.getSVG(text, options); // string of svg
    
  var path = textToSVG.getPath(text, options); 
  console.log('path: ' + path);
    
  return path;
}


// removeCounters(svg)
// takes an SVG object and returns an edited SVG that has been stenciled
function removeCounters(svgPath, svgWidth, svgHeight) {
  var maskDim = 5;
  // console.log(`svgWidth: ${svgWidth} svgHeight: ${svgHeight}`);
  
  var subj_paths = createPath(svgPath);

  var clipXstart = (svgWidth-maskDim)/2;
  var clipXend = (svgWidth+maskDim)/2;
  
  var clip_paths = new ClipperLib.Paths();
  var clip_path = new ClipperLib.Path();
  clip_path.push(
    new ClipperLib.IntPoint(clipXstart,0),
    new ClipperLib.IntPoint(clipXend,0),
    new ClipperLib.IntPoint(clipXend, svgHeight),
    new ClipperLib.IntPoint(clipXstart, svgHeight)
  );
  clip_paths.push(clip_path);
  
  // setup stuff
  var scale = 100;
  ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
  ClipperLib.JS.ScaleUpPaths(clip_paths, scale);
  var cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
  var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clipType = ClipperLib.ClipType.ctDifference;

  // perform boolean
  var solution_paths = new ClipperLib.Paths();
  cpr.Execute(clipType, solution_paths, subject_fillType, clip_fillType);
  console.log(JSON.stringify(solution_paths));
  
  var newSVG = createSVGfromSolution(solution_paths, scale, svgWidth, svgHeight);
  return newSVG;
}

// createSVGfromSolution
// creates a new SVG element from the clipper.js solution path
function createSVGfromSolution(solution_paths, scale, width, height){
  var newSVG = `<svg style="background-color:none" width="${width}" height="${height}">`;
  newSVG += '<path stroke="black" fill="none" stroke-width="1" d="' + paths2string(solution_paths, scale) + '"/>';
  newSVG += '</svg>';  
  return newSVG;
}

// path2strings
// takes paths from clipper.js and converts them to svg paths
function paths2string (paths, scale) {
  var svgpath = "", i, j;
  if (!scale) scale = 1;
  for(i = 0; i < paths.length; i++) {
    for(j = 0; j < paths[i].length; j++){
      if (!j) svgpath += "M";
      else svgpath += "L";
      svgpath += (paths[i][j].X / scale) + ", " + (paths[i][j].Y / scale);
    }
    svgpath += "Z";
  }
  if (svgpath=="") svgpath = "M0,0";
  return svgpath;
}

// createPath 
// create polygon path from an SVG path to use with clipper.js
function createPath(svgPath){
  console.log('createPath svgPath: ' + svgPath);
  var paths = new ClipperLib.Paths();
  var path = new ClipperLib.Path();
  
  var len = svgPath.getTotalLength();
  
  for(var i=0; i<len; i++){
    var p = svgPath.getPointAtLength(i);
    path.push(new ClipperLib.IntPoint(p.x, p.y));
  }
  
  paths.push(path);
  return paths;
}