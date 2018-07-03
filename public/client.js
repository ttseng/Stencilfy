var window   = require('svgdom');
var SVG      = require('svg.js')(window);
var document = window.document;

// get input and output on page
var input = document.querySelector('input[name="name"]');
var output = document.querySelector('.name');

input.oninput = function(event){
  // add text above input field
  var newText = event.target.value;
  output.textContent = newText;
  
  // try using svg.js
  var draw = SVG('textSVG').size(300,300);
  var text = draw.text(function(add){
    add.tspan(newText);
  });
}