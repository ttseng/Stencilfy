// show the input field item on page
var input = document.querySelector('input[name="name"]');
var output = document.querySelector('.name');
  
input.oninput = function(event){
  var newText = event.target.value;
  output.textContent = newText;
}