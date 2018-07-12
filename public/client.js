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


// removeCounters - an attempt using masks
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
      var subjPaths = [[{X:10,Y:10},{X:110,Y:10},{X:110,Y:110},{X:10,Y:110}],[{X:20,Y:20},{X:20,Y:100},{X:100,Y:100},{X:100,Y:20}]]; 
   
  // var path = svg.find('path').attr('d');
  // subjPath.push(path);  
  
  // create clipping path
  
    var clipPaths = [[{X:50,Y:50},{X:150,Y:50},{X:150,Y:150},{X:50,Y:150}], [{X:60,Y:60},{X:60,Y:140},{X:140,Y:140},{X:140,Y:60}]];
  var maskDim = 10;
  var svgWidth = svg.attr('width');
  var svgHeight = svg.attr('height');

    // clipPath.push(
  //   new ClipperLib.IntPoint(svgWidth-maskDim/2,0),
  //   new ClipperLib.IntPoint(svgWidth+maskDim/2,0),
  //   new ClipperLib.IntPoint(svg+maskDim/2, svgHeight),
  //   new ClipperLib.IntPoint(svg-maskDim/2, svgHeight)
  //   );
  
  var scale = 100;
  ClipperLib.JS.ScaleUpPaths(subjPaths, scale);
  ClipperLib.JS.ScaleUpPaths(clipPaths, scale);
  
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
  svg = '<svg style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="160" height="160">';
    svg += '<path stroke="black" fill="yellow" stroke-width="2" d="' + paths2string(solutionPath, scale) + '"/>';
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

function svg2paths(svg){
  var paths = $('svg path')[0];
  var len = paths.getTotalLength();
  var path
  for(var i=0; i<len; i++){
  }
}
