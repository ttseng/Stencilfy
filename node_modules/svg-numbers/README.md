# svg-numbers

Parser and serializer for lists of coordinates in SVG documents, such as [the `points` attribute of a `<polyline>` element](http://www.w3.org/TR/SVG/shapes.html#PointsBNF).

[![NPM version](https://badge.fury.io/js/svg-numbers.png)](http://badge.fury.io/js/svg-numbers) [![Build status](https://travis-ci.org/PPvG/svg-numbers.png?branch=master)](https://travis-ci.org/PPvG/svg-numbers)

## Installation

With [npm](https://npmjs.org/): `$ npm install svg-numbers`

## Usage

### Parsing

    var parse = require('svg-numbers').parse

    var numbers = parse('10, 15.20.8 -11,15-25+75 4.2e3')
    console.log(numbers)
    // [ 10, 15.2, .8, -11, 15, -25, 75, 4200 ]

### Serializing

    var serialize = require('svg-numbers').serialize

    var numbers = [10, 4.2, .333, -8]
    var str = serialize(numbers)
    console.log(str)
    // '10,4.2.333-8'

Separators (commas and/or spaces) are left out wherever the SVG recommendation allows it. If you'd rather have separators everywhere, just use `Array.prototype.join`:

    var str = numbers.join(', ')
    console.log(str)
    // '10, 4.2, .333, -8'

### Catching syntax errors

If a syntax error is found, an error is thrown. The valid coordinates up to and until the syntax error are available as `error.partial`:

    try {
      var numbers = parse('10, 20, , 30, 40')
    } catch (error) {
      console.log(error.partial)
      // [ 10, 20 ]
    }

(The W3C SVG recommendation has something to say about [error processing](http://www.w3.org/TR/SVG/implnote.html#ErrorProcessing).)

## Running the tests

    $ git clone https://github.com/PPvG/svg-numbers

    $ cd svg-numbers

    $ npm install

    $ npm test

## Browser support

Use [browserify](http://browserify.org/). All major browsers are supported:

[![Browser support](https://ci.testling.com/PPvG/svg-numbers.png)](https://ci.testling.com/PPvG/svg-numbers)

## License

[MIT](https://raw.github.com/PPvG/svg-numbers/master/LICENSE)
