'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (runner, mochaOptions) {
  var failures = 0;
  var stack = []; // 0:'TextToSVG' <- 1:'method' <- 2:'text' = [SP]

  var dest = mochaOptions.reporterOptions.dest;
  console.log('write test report to ' + dest);
  _fs2.default.writeFileSync(dest, '');

  function write(str) {
    _fs2.default.appendFileSync(dest, str);
  }

  function ontest(test, err) {
    var text = stack[2];
    var options = JSON.parse(test.title);
    var metrics = textToSVG.getMetrics(text, options);
    var d = textToSVG.getD(text, options);
    var svg = textToSVG.getDebugSVG(text, options);

    if (err) {
      failures++;
    }

    write('<tr class="' + (err ? 'fail' : 'pass') + '">');
    write('<td><pre>' + JSON.stringify(options, null, 2) + '</pre></td>');
    write('<td>' + svg + '</td>');
    write('<td><pre>' + JSON.stringify(metrics, null, 2) + '</pre></td>');
    write('<td><pre>' + d + '</pre></td>');
    write('</tr>');
  }

  runner.on('start', function () {
    write('<html >');
    write('<head>');
    write('<meta charset="UTF-8" />');
    write('<title>TextToSVG</title>');
    write('</head>');
    write('<body>');
    write('<style>' + STYLE + '</style>');
  });

  runner.on('suite', function (suite) {
    if (suite.root) {
      return;
    }

    stack.push(suite.title);
    switch (stack.length - 1) {
      case 0:
        // TextToSVG
        write('<h1>' + suite.title + '</h1>');
        break;
      case 1:
        // method
        write('<h2>' + suite.title + '</h2>');
        break;
      case 2:
        // text
        write('<h3>' + suite.title + '</h3>');
        write('<table>');
        write('<tr>');
        write('<th>options</th>');
        write('<th>svg</th>');
        write('<th>getMetrics</th>');
        write('<th>getD</th>');
        write('</tr>');
        break;
      default:
        throw new Error('Unknown Depth');
    }
  });

  runner.on('suite end', function (suite) {
    if (stack.length === 3) {
      write('</table>');
    }
    stack.pop(suite.title);
  });

  runner.on('pass', function (test) {
    ontest(test, null);
  });

  runner.on('fail', function (test, err) {
    ontest(test, err);
  });

  runner.on('end', function () {
    write('</body></html>');
    process.exit(failures);
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _src = require('../src');

var _src2 = _interopRequireDefault(_src);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2016 Hideki Shiro
 */

/* eslint-disable no-console,  */

var textToSVG = _src2.default.loadSync();

var STYLE = '\n  table {\n    border-collapse: collapse;\n  }\n\n  tr.pass {\n    background-color: #90EE90;\n  }\n\n  tr.fail {\n    background-color: #FFC0CB;\n  }\n\n  th, td {\n    padding: 3px;\n    border: 1px solid #b9b9b9;\n  }\n';

module.exports = exports.default;