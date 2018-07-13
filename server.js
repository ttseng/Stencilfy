// server.js
// where your node app starts

// init project
const assets = require("./assets");
const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const svgPath = require('svg-path'); //https://github.com/PPvG/svg-path
var textToSVG = require('text-to-svg');
const svgpath = require('svgpath'); 
const ClipperLib = require('clipper-lib');
const pathProperties = require('svg-path-properties');

var counterStrings = "A,B,D,O,P,Q,R,a,b,d,e,g,o,p,q,0,4,6,8,9";
var counters = counterStrings.split(",");

// font information
const attributes = {stroke: 'black', fill: 'transparent'};
var defaultOptions = {x:0, y: 0, fontSize: 100, anchor: 'top baseline', attributes: attributes};
var scale = 100;
var textWidths = []; // keep track of the width of each character
var fullHeight; // height of resulting SVG

var input; // input detected from text field

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
  setupSVG();
  console.log(request.body);
  response.sendFile(__dirname + '/views/index.html');  
});


//////////
// POST - get text input from textfield
//////////
app.post('/', function(req, res){
  console.log('post request received with input: ' + req.body.text);  
  input = req.body.text;
  var inputChars = input.split('');
  console.log(`inputChars: ${inputChars}`);
  var origPathArr = []; // storing individual paths for each character, before removing counters
  var newPathArr = []; // storing individual paths for each character, after removing counters
  
  fullHeight = textToSVG.getMetrics(inputChars[0], defaultOptions).height; // for now, restrict to single line
  
  for(var i=0; i<inputChars.length; i++){
    var newOptions = constructOptions(i);
    var svgPath = textToSVG.getPath(inputChars[i], newOptions); 
    // console.log(`svgPath: ${svgPath}`);
    var charWidth = textToSVG.getMetrics(inputChars[i], defaultOptions).width;
    console.log('characterWidth: ' + characterWidth);
    textWidths.push(charWidth);
    origPathArr.push(svgPath);
  
    // remove counter if necessary - ultimately want to iterate over ever character
    if(counters.includes(inputChars[i])){
      var newSVGpath = removeCounters(svgPath, inputChars[i]); // remove counters if necessary
    }else{
      var newSVGpath = svgPath;
    }
    // console.log(`newSVGpath ${newSVGpath}`);
    newPathArr.push(newSVGpath);
  }
  // compile all paths into a single svg
  var origSVG = compileSVGfromPaths(origPathArr);
  // console.log(`origSVG: ${origSVG}`);
  var newSVG = compileSVGfromPaths(newPathArr);
  // console.log(`newSVG: ${newSVG}`);
  
  // return cleaned svg
  var respBody = {origSVG, newSVG};
  res.send(respBody);
});

// constructOptions(index)
// create options for generating svg with text-to-svg that moves x position for each character
function constructOptions(index){
  var options = {y: 0, fontSize: 100, anchor: 'top baseline', attributes: attributes};
  if(index == 0){
    var x = textWidths[index-1];
  }else{
    var x = 0;
  }
  options[x] = x;
  console.log('newX: ' + options[x]);
  console.log(`textWidths ${textWidths}`);
  return options;
}

// listen for requests :)
var listener = app.listen(port, function () {
  // console.log('Your app is listening on port ' + listener.address().port);
});

var exports = module.exports = {};

function setupSVG(){
  	textToSVG = textToSVG.loadSync();
    console.log('textToSVG ready!');
  	// textToSVG = TextToSVG.loadSync('/assets/handy00.ttf');
} 

// getSVGinfo
// get SVG width, height, and path data from text 
function getSVGinfo(input){
  var info = {};
  var width = textToSVG.getMetrics(input, defaultOptions).width;
  var height = textToSVG.getMetrics(input, defaultOptions).height;
  var pathD = textToSVG.getD(input, defaultOptions);
  info["width"] = width;
  info["height"] = height;
  info["pathD"] = pathD;
  return info;  
}

// removeCounters(svgPath)
// takes an SVG Path and returns an SVG Path that has been stenciled
function removeCounters(svgPath) {
  console.log("removeCounters");
  var maskDim = 5;
  var svgInfo = getSVGinfo(input);
  
  // console.log(`svgWidth: ${svgWidth} svgHeight: ${svgHeight}`);
  
  var subj_paths = createPath(svgInfo.pathD);

  var clipXstart = (svgInfo.width-maskDim)/2;
  var clipXend = (svgInfo.width+maskDim)/2;
  
  var clip_paths = new ClipperLib.Paths();
  var clip_path = new ClipperLib.Path();
  clip_path.push(
    new ClipperLib.IntPoint(clipXstart,0),
    new ClipperLib.IntPoint(clipXend,0),
    new ClipperLib.IntPoint(clipXend, svgInfo.height),
    new ClipperLib.IntPoint(clipXstart, svgInfo.height)
  );
  clip_paths.push(clip_path);
  
  // setup stuff
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
  // console.log('solutionsPath: ' + JSON.stringify(solution_paths));
  
  var newSVGPath = createPathFromSolution(solution_paths);
  return newSVGPath;
}

// createPathFromSolution(solution_paths)
// creates SVG path for clipper.js solution path
function createPathFromSolution(solution_paths){
  return '<path stroke="black" fill="none" stroke-width="1" d="' + paths2string(solution_paths, scale) + '"/>';
}

// compileSVGfromPaths(pathsArr)
// create an svg from a path of arrays
function compileSVGfromPaths(pathsArr){
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  var fullWidth = textWidths.reduce(reducer);
   var newSVG = `<svg style="background-color:transparent" width="${fullWidth}" height="${fullHeight}">`;
  for(var i=0; i< pathsArr.length; i++){
    newSVG += pathsArr[i];
  }
  return newSVG;
}

// createSVGfromSolution
// creates a new SVG element from the clipper.js solution path
function createSVGfromSolution(solution_paths){
  var svgInfo = getSVGinfo(input);
  console.log('svgInfo: ' + svgInfo);
  var newSVG = `<svg style="background-color:transparent" width="${svgInfo.width}" height="${svgInfo.height}">`;
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
function createPath(svgPathD){
  var paths = new ClipperLib.Paths();
  var path = new ClipperLib.Path();
  
  var properties = pathProperties.svgPathProperties(svgPathD);
  var len = properties.getTotalLength();
  
  for(var i=0; i<len; i++){
    var p = properties.getPointAtLength(i);
    path.push(new ClipperLib.IntPoint(p.x, p.y));
  }
  
  paths.push(path);
  return paths;
}