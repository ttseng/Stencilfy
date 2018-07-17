var test = require('tape')
var flatten = require('../lib/flattenCommandArgs')

function testFlatten (command, expectedArgs) {
  test(command.type, function (t) {
    var args = flatten(command)
    t.same(args, expectedArgs)
    t.end()
  })
}

testFlatten(
  { type: 'M', relative: false, x: 10, y: 20 },
  [10, 20])

testFlatten(
  { type: 'L', relative: false, x: 10, y: 20 },
  [10, 20])

testFlatten(
  { type: 'C', relative: false, x1: 10, y1: 20, x2: 30, y2: 40, x: 50, y: 60 },
  [10, 20, 30, 40, 50, 60])

testFlatten(
  { type: 'S', relative: false, x2: 30, y2: 40, x: 50, y: 60 },
  [30, 40, 50, 60])

testFlatten(
  { type: 'Q', relative: false, x1: 10, y1: 20, x: 50, y: 60 },
  [10, 20, 50, 60])

testFlatten(
  { type: 'T', relative: false, x: 10, y: 20 },
  [10, 20])

testFlatten(
  { type: 'A', relative: false, rx: 10, ry: 20, x_axis_rotation: 30,
    large_arc_flag: 0, sweep_flag: 0, x: 50, y: 60 },
  [10, 20, 30, 0, 0, 50, 60])
