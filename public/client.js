// textToSVG stuff (https://github.com/shrhdk/text-to-svg)
const TextToSVG = require('text-to-svg');
const textToSVG = TextToSVG.loadSync();
const textOptions = {fontSize: 70};

// show the input field item on page
var input = document.querySelector('input[name="name"]');
var output = document.querySelector('.name');
  
input.oninput = function(event){
  var newText = event.target.value;
  var svg = textToSVG.getSVG(newText, textOptions);
  output.append(svg);
  // output.textContent = newText;
}