 import anime from 'animejs';

var lineDrawing = anime({
  targets: '#lineDrawing .lines path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 1500,
  delay: function(el, i) { return i * 250 },
  direction: 'alternate',
  loop: true
});

// show the input field item on page
var input = document.querySelector('input[name="name"]');
var output = document.querySelector('.name');
input.addEventListener('keyup', updateText());

function updateText() {
  return function() {
    var newText = this.value;
    output.textContent = newText;
  }				
}