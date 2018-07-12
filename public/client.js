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

function removeCounters(svg){
  var def = document.createElementNS("http://www.w3.org/2000/svg","def");
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
  def.append(mask);
  
  svg.prepend(def);
  svg.find('path')[0].setAttribute('clip-path', 'url(#mask)');
}