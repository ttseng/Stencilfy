// demoClipper
// demo clipper functionality
function demoClipper() {
  var subj_paths = [[{X:10,Y:10},{X:110,Y:10},{X:110,Y:110},{X:10,Y:110}],
                      [{X:20,Y:20},{X:20,Y:100},{X:100,Y:100},{X:100,Y:20}]]; // THE ORIGINAL
    
  var clip_paths = [[{X:50,Y:50},{X:150,Y:50},{X:150,Y:150},{X:50,Y:150}], // 
                      [{X:60,Y:60},{X:60,Y:140},{X:140,Y:140},{X:140,Y:60}]];  // THE ORIGINAL
  
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