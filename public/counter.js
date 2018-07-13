// removeCounters(svg)
// takes an SVG object and returns an edited SVG that has been stenciled
function removeCounters(svg) {
  var svgWidth = parseInt(svg.attr('width'));
  var svgHeight = parseInt(svg.attr('height'));
  var maskDim = 5;
  // console.log(`svgWidth: ${svgWidth} svgHeight: ${svgHeight}`);
  
  var subj_paths = createPath($('svg'));

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
  // console.log(JSON.stringify(solution_paths));
  
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
// create polygon path from an SVG to use with clipper.js
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

// demoClipper
// demo clipper functionality
function demoClipper() {
  var subj_paths = [[{X:10,Y:10},{X:110,Y:10},{X:110,Y:110},{X:10,Y:110}],
                      [{X:20,Y:20},{X:20,Y:100},{X:100,Y:100},{X:100,Y:20}]]; 
    
  // var clip_paths = [[{X:50,Y:50},{X:150,Y:50},{X:150,Y:150},{X:50,Y:150}], // 
  //                     [{X:60,Y:60},{X:60,Y:140},{X:140,Y:140},{X:140,Y:60}]];  // THE ORIGINAL
  
  var clipXstart = 70;
  var clipXend = 80;
  var svgHeight = 160;
  
  var clip_paths = new ClipperLib.Paths();
  var clip_path = new ClipperLib.Path();
  clip_path.push(
    new ClipperLib.IntPoint(clipXstart,0),
    new ClipperLib.IntPoint(clipXend,0),
    new ClipperLib.IntPoint(clipXend, svgHeight),
    new ClipperLib.IntPoint(clipXstart, svgHeight)
  );
  clip_paths.push(clip_path);
  
  var scale = 100;
  ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
  ClipperLib.JS.ScaleUpPaths(clip_paths, scale);
  var cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
  var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
  var clipTypes = [ClipperLib.ClipType.ctUnion, ClipperLib.ClipType.ctDifference, ClipperLib.ClipType.ctXor, ClipperLib.ClipType.ctIntersection];
  var clipTypesTexts = "Union, Difference, Xor, Intersection";
  var solution_paths, svg, cont = document.getElementById('svgContainer');
  var i;
  for(i = 0; i < clipTypes.length; i++) {
    solution_paths = new ClipperLib.Paths();
    cpr.Execute(clipTypes[i], solution_paths, subject_fillType, clip_fillType);
    // console.log(JSON.stringify(solution_paths));
    svg = '<svg style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="160" height="160">';
    svg += '<path stroke="black" fill="yellow" stroke-width="2" d="' + paths2string(solution_paths, scale) + '"/>';
    svg += '</svg>';
    cont.innerHTML += svg;
  }
  cont.innerHTML += "<br>" + clipTypesTexts;
}

// removeCounters - an attempt using svg masks
// function removeCounters(svg){
//   var defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
//   var mask = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
//   var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  
//   var svgWidth = svg.attr('width');
//   var svgHeight = svg.attr('height');
  
//   rect.setAttribute('width', svgWidth/4);
//   rect.setAttribute('height', svgHeight);
//   rect.setAttribute('x', svgWidth/2-svgWidth/4/2);
//   rect.setAttribute('y', 0);
  
//   mask.setAttribute('id', 'mask');
//   mask.append(rect);
//   defs.append(mask);
  
//   svg.prepend(defs);
//   svg.find('path')[0].setAttribute('clip-path', 'url(#mask)');
// }