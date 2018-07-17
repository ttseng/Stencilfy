// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const svgPath = require('svg-path'); //https://github.com/PPvG/svg-path
const TextToSVG = require('text-to-svg');
var textToSVG;
const svgpath = require('svgpath'); 
const ClipperLib = require('clipper-lib');
const pathProperties = require('svg-path-properties');

// file storage
var tmp = require('tmp');
var fs = require('fs');
const fileUpload = require('express-fileupload');

var counterStrings = "A,B,D,O,P,Q,R,a,b,d,e,g,o,p,q,0,4,6,8,9,&,@,%";
var counters = counterStrings.split(",");

var paddingFactor = 1.1;  // how much extra to size the resulting SVG box

// font information
const attributes = {stroke: 'black', fill: 'transparent'};
var defaultOptions = {x:0, y: 1, fontSize: 100, anchor: 'top baseline', attributes: attributes};
var scale = 100;
var textWidths;; // keep track of the width of each character
var fullHeight; // height of resulting SVG

var defaultFontPath = "fonts/Roboto-Regular.ttf"

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(fileUpload());

app.get('/', function(request, response) {
  setupSVG();
  response.sendFile(__dirname + '/views/index.html');  
});

/////////
// SAVE FONT - POST
// Saves uploaded font to temporary storage
////////
app.post('/saveFont', function(req, res){
  if(!req.files) console.log('no files were uploaded!');  
  
  let fontFile = req.files.file;
  console.log(fontFile);
  var fontName = fontFile.name;
  var fontType = fontName.substring(fontName.indexOf('.'));
  
  // move the font file to temporary storage
  tmp.file({postfix: fontType, keep: false, dir: "tmp"}, function _tempFileCreated(err, path, fd, cleanupCallback) {
  if (err) throw err;
 
  console.log('File: ', path);
  console.log('Filedescriptor: ', fd);
  console.log(`FileName: ${fontName}`);

  fs.writeFile(path, fontFile.data, function(err){
    console.log('wrote to file!');
    // setup font with new font file
    setupSVG(path);
    cleanupCallback();
    // return font name
    console.log(`returning font name ${fontName}`);
    res.send(fontName);
  });

  });
});


/////////
// LOAD FONT - POST
// Loads selected font from pre-defined set
////////

app.post('/loadFont', function(req, res){
  console.log('loadFont post request received with input: ' + JSON.stringify(req.body));
  var fontPath = "fonts/" + req.body.font + "-Regular.ttf";
  setupSVG(fontPath); // update to load custom font
});

//////////
// CREATE STENCIL - POST 
// Take text input from form and create Stencil SVG
//////////
app.post('/createStencil', function(req, res){
  console.log('post request received with input: ' + req.body.text);  
  var input = req.body.text;
  textWidths = [];
  var inputChars = input.split('');
  console.log(`inputChars: ${inputChars}`);
  var origPathArr = []; // storing individual paths for each character, before removing counters
  var newPathArr = []; // storing individual paths for each character, after removing counters
  
  fullHeight = textToSVG.getMetrics(inputChars[0], defaultOptions).height*paddingFactor; // for now, restrict output SVG to single line
  
  // construct each individual character from the input
  for(var i=0; i<inputChars.length; i++){

    // create SVG from character (no stencil applied yet)
    var newOptions = constructOptions(i);
    var svgPath = textToSVG.getPath(inputChars[i], newOptions); 
    // console.log(`svgPath for ${inputCharts[i]`: ${svgPath}`);
    var charWidth = textToSVG.getMetrics(inputChars[i], defaultOptions).width;
    var charHeight = textToSVG.getMetrics(inputChars[i], defaultOptions).height;
    if(charHeight > fullHeight) fullHeight = chartHeight;
    // console.log('charWidth: ' + charWidth);
    textWidths.push(charWidth);
    origPathArr.push(svgPath);
  
    // apply stencil if necessary (if character has a counter)
    if(counters.includes(inputChars[i])){
      var newSVGpath = removeCounters(svgPath, inputChars[i]); // remove counters if necessary
      console.log(`newSVGpath for ${inputChars[i]}: ${newSVGpath}`);
    }else{
      var newSVGpath = svgPath;
    }
    // console.log(`newSVGpath ${newSVGpath}`);
    newPathArr.push(newSVGpath);
    console.log('');
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
  console.log(`constructOptions with index ${index}`);
  var options = {y: 0, fontSize: 100, anchor: 'top baseline', attributes: attributes};
  if(index == 0){
    var x = 0;
  }else{
    var x = getNewX(); // finds the new X position for the latest character
  }
  options["x"] = x;
  console.log('newX: ' + options["x"]);
  console.log(`textWidths ${textWidths}`);
  return options;
}

// listen for requests :)
var listener = app.listen(process.env.PORT || port, function () {
  // console.log('Your app is listening on port ' + listener.address().port);
});

var exports = module.exports = {};


function setupSVG(fontPath){
  console.log(`setupSVG with path ${fontPath}`);
  if(fontPath){
    console.log('loading selected font');
    textToSVG = TextToSVG.loadSync(fontPath);
  }else{
     console.log('loading default font');
    textToSVG = TextToSVG.loadSync(defaultFontPath);
  }
    // console.log('textToSVG ready!');
} 

function getNewX(){
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    return textWidths.reduce(reducer);
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

// removeCounters(svgPath, char)
// takes an SVG Path and character and returns an SVG Path that has been stenciled
function removeCounters(svgPath, char) {
  console.log("removeCounters");
  var maskDim = 5; // how wide the mask rectangle should be
  var svgInfo = getSVGinfo(char);
  // console.log(`svgWidth: ${svgWidth} svgHeight: ${svgHeight}`);
  
  console.log(`svgInfo.pathD for ${char}: ${svgInfo.pathD}`);
  var subjPaths = createPath(svgInfo.pathD);
  console.log(`polygonPaths for ${char}: ${JSON.stringify(subjPaths)}`);

  var clipXstart = (svgInfo.width-maskDim)/2;
  var clipXend = (svgInfo.width+maskDim)/2;
  
  var clipPaths = new ClipperLib.Paths();
  var clipPath = new ClipperLib.Path();
  clipPath.push(
    new ClipperLib.IntPoint(clipXstart,0),
    new ClipperLib.IntPoint(clipXend,0),
    new ClipperLib.IntPoint(clipXend, svgInfo.height),
    new ClipperLib.IntPoint(clipXstart, svgInfo.height)
  );
  clipPaths.push(clipPath);
  
  // setup stuff
  ClipperLib.JS.ScaleUpPaths(subjPaths, scale);
  ClipperLib.JS.ScaleUpPaths(clipPaths, scale);
  var cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subjPaths, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clipPaths, ClipperLib.PolyType.ptClip, true);
  var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clipType = ClipperLib.ClipType.ctDifference;

  // perform boolean
  var solution_paths = new ClipperLib.Paths();
  cpr.Execute(clipType, solution_paths, subject_fillType, clip_fillType);
  // console.log('solutionsPath: ' + JSON.stringify(solution_paths));
  
  var newSVGPathD = paths2string(solution_paths, scale);  
  // console.log('newSVGPathD ' + newSVGPathD);
  
  var transformed = svgpath(newSVGPathD).translate(getNewX()-textWidths[textWidths.length-1], 0);
  // console.log('transformed ' + transformed);
  
  var newSVGPath = '<path stroke="black" fill="none" stroke-width="1" d="' + transformed + '"/>';
  
  // console.log(`newSVGPath for ${char}: ${newSVGPath}`);
  // newSVGPath = svgpath(newSVGPath).translate(getNewX, 0);
  
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
  var fullWidth = textWidths.reduce(reducer)*paddingFactor; // add a little bit extra
   var newSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:transparent" width="${fullWidth}" height="${fullHeight}">`;
  for(var i=0; i< pathsArr.length; i++){
    newSVG += pathsArr[i];
  }
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
  // if (svgpath=="") svgpath = "M0,0";
  return svgpath;
}

// createPath 
// create polygon path from an SVG path to use with clipper.js
function createPath(svgPathD){
  var paths = new ClipperLib.Paths();

  // split svgPathD into arrays based on closed paths
  var indexes = getAllIndexes(svgPathD, "M");
  console.log(`indexes length ${indexes.length}`);

  var newSVGpathsD = [];

  for(i=0; i<indexes.length; i++){
    var subPath = "";
    if(i == 0){
      subPath = svgPathD.substr(i, indexes[i+1]);
    }else if(i == indexes.length-1){
      // last path
      subPath = svgPathD.substr(indexes[i]);
    }else{
      subPath = svgPathD.substr(indexes[i], indexes[i+1]);
    }
    // sometimes run into issue with the path not ending with Z - a quick fix here
    if(subPath.slice(-1) != "Z"){
      subPath = subPath.replaceAt(subPath.length-1, "Z");
    }
    console.log(`subPath for ${i}: ${subPath}`);
    newSVGpathsD.push(subPath);
  }

  console.log(`newSVGpathsD.length: ${newSVGpathsD.length}`);

  for(x=0; x<newSVGpathsD.length; x++){
    console.log(`path creation loop ${x}`);
    var path = new ClipperLib.Path();
    var properties = pathProperties.svgPathProperties(newSVGpathsD[x]);
    var len = properties.getTotalLength();
  
    for(var i=0; i<len; i++){
      var p = properties.getPointAtLength(i);
      path.push(new ClipperLib.IntPoint(p.x, p.y));
    }
    console.log(`path: ${JSON.stringify(path)}`);
    console.log('');
    // add this array to paths
    paths.push(path);
  }

  console.log(`paths: ${JSON.stringify(paths)}`);

  return paths;
}

// getAllIndexes
// find indexes of all occurences of val within a string
function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}