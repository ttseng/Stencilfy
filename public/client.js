function addSVGtoPage(){
  var url = window.location.href;
  var svgExist = url.indexOf('?svg=');
  if(svgExist != -1){
  	// clean up svg to replacd %20 with spaces
  	var cleanSVG = decodeURI(getParameterByName("svg", url));
  	// console.log(cleanSVG);
      $('#textSVG').append(cleanSVG);
  }else{
    return false;
  }
}

// getParameterByName - take the parameter from the url and fetch contents
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// removeCounters - an attempt using svg masks
function removeCounters(svg){
  var defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
  var mask = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  
  var svgWidth = svg.attr('width');
  var svgHeight = svg.attr('height');
  
  rect.setAttribute('width', svgWidth/4);
  rect.setAttribute('height', svgHeight);
  rect.setAttribute('x', svgWidth/2-svgWidth/4/2);
  rect.setAttribute('y', 0);
  
  mask.setAttribute('id', 'mask');
  mask.append(rect);
  defs.append(mask);
  
  svg.prepend(defs);
  svg.find('path')[0].setAttribute('clip-path', 'url(#mask)');
}


// booleanCounter - test the clipper.js library
function booleanCounter(svg){
  // add original svg path
  var subjPaths = createPath($('svg'));
  
  // create clipping path
  var svgWidth = parseInt(svg.attr('width'));
  var svgHeight = parseInt(svg.attr('height'));
  // console.log(`svgWidth: ${svgWidth} svgHeight: ${svgHeight}`);
  var maskDim = 10;
  
  var clipXstart = (svgWidth-maskDim)/2;
  var clipXend = (svgWidth+maskDim)/2;
  
  var clipPaths = new ClipperLib.Paths();
  var clipPath = new ClipperLib.Path();
  clipPath.push(
    new ClipperLib.IntPoint(clipXstart,0),
    new ClipperLib.IntPoint(clipXend,0),
    new ClipperLib.IntPoint(clipXend, svgHeight),
    new ClipperLib.IntPoint(clipXstart, svgHeight)
  );
  clipPaths.push(clipPath);
  console.log('clipPaths: ', clipPaths);
  
  // create clipper
  var cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subjPaths, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clipPaths, ClipperLib.PolyType.ptSubject, true);
  
  // create solutions path
  var solutionPath = new ClipperLib.Paths();
  
  var clipType = ClipperLib.ClipType.ctDifference;
  var subjFillType = ClipperLib.PolyFillType.pftNonZero;
  var clipFillType = ClipperLib.PolyFillType.pftNonZero;
  
  var success = cpr.Execute(clipType, solutionPath, subjFillType, clipFillType);
  console.log(`success? ${success}`);
  console.log(JSON.stringify(solutionPath));
  
  // add to page
  svg = `<svg style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="${svgWidth}" height="${svgHeight}">`;
    svg += '<path stroke="black" fill="yellow" stroke-width="2" d="' + paths2string(solutionPath, 1) + '"/>';
    svg += '</svg>';
  
  $('body').append(svg);
  
}

// path2strings - takes paths from clipper.js and converts them to svg paths

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

// createPath - create polygon path from an SVG to use with clipper.js
function createPath(svg){
  var paths = new ClipperLib.Paths();
  var path = new ClipperLib.Path();
  
  var svgPaths = $('svg path')[0];
  var len = svgPaths.getTotalLength();
  
  for(var i=0; i<len; i++){
    var p = svgPaths.getPointAtLength(i);
    path.push(new ClipperLib.IntPoint(p.x, p.y));
  }
  
  paths.push(path);
  return paths;
}
