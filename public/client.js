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

function booleanCounter(svg){
  // add original svg path
  var subjPaths = new ClipperLib.Paths();
  var subjPath = new ClipperLib.Path();
  var path = svg.find('path').attr('d');
  subjPath.push(path);
  
  // create clipping path
  var clipPaths = new ClipperLib.Paths();
  var clipPath = new ClipperLib.Path();
  var maskDim = 10;
  var svgWidth = svg.attr('width');
  var svgHeight = svg.attr('height');
  clipPath.push(
    new ClipperLib.IntPoint(svgWidth-maskDim/2,0),
    new ClipperLib.IntPoint(svgWidth+maskDim/2,0),
    new ClipperLib.IntPoint(svg+maskDim/2, svgHeight),
    new ClipperLib.IntPoint(svg-maskDim/2, svgHeight)
    );
  clipPaths.push(clipPath);
  
  // create clipper
  var cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subjPaths, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clipPaths, ClipperLib.PolyType.ptSubject, true);
  
  // create solutions path
  var solutionsPath = new ClipperLib.Paths();
  
  var clipType = ClipperLib.ClipType.ctDifference;
}