# svg-path

Parse and manipulate SVG `<path>`s.

[![NPM version](https://badge.fury.io/js/svg-path.png)](http://badge.fury.io/js/svg-path) [![Build status](https://travis-ci.org/PPvG/svg-path.png?branch=master)](https://travis-ci.org/PPvG/svg-path)

## Usage example

### Parsing

    var svgPath = require('svg-path')

    var pathData = 'm100,1e2C125,100 130,110 150,150l-25-75z'

    var path = svgPath(pathData) // creates a new svgPath.Path
    console.log(path.content)
    /*
        [
           { type: 'M', relative: false, x: 100, y: 100 },
           { type: 'C', relative: false,
             x1: 125, y1: 100, x2: 130, y2: 110, x: 150, y: 150 },
           { type: 'L', relative: true,  x: -25, y: -75 },
           { type: 'Z' }
        ]
    */

### Applying transformations

    var path = svgPath(pathData)
    path.abs()
    path.matrix(1, 0, 0, 1, 100, 50) // same as translate(100, 50)

Transformations are applied in-place. To retain the original, create a copy first:

    var newPath = path.copy()

Available transformations are `abs`, `translate`, `scale`, `rotate`, `skewX` and `skewY` and `convertArcs`. The latter converts all `A` (arc) commands to `C` (curveto) commands. All transformations expect `#abs()` start by calling `#convertArcs`.

## Running the tests

    $ git clone https://github.com/PPvG/svg-path
    $ cd svg-path
    $ npm install
    $ npm test

### Code coverage report

    $ npm run cover

Then open `./cov/report.html` in your browser.

## License

[MIT](https://raw.github.com/PPvG/svg-path/master/LICENSE)
