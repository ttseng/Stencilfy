// show the input field item on page
var input = document.querySelector('input[name="name"]');
var output = document.querySelector('.name');

let svg; // the svg created through textToSVG

input.oninput = function(event){
  // add text above input field
  var newText = event.target.value;
  output.textContent = newText;
  
  // try using svg.js
  var draw = SVG('textSVG').size(300,300);

}