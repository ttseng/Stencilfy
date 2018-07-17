var test = require('tape')
var parse = require('../lib/parsePath')

test('single commands', function (t) {
  t.same(
    parse('m100,100 h100, L200, 200 Z'),
    [
      { type: 'M', relative: false, x: 100, y: 100 },
      { type: 'H', relative: true, x: 100 },
      { type: 'L', relative: false, x: 200, y: 200 },
      { type: 'Z' }
    ]
  )
  t.end()
})

test('command grouping', function (t) {
  t.same(
    parse('m100,100 L200,100 150,200 Z'),
    [
      { type: 'M', relative: false, x: 100, y: 100 },
      { type: 'L', relative: false, x: 200, y: 100 },
      { type: 'L', relative: false, x: 150, y: 200 },
      { type: 'Z' }
    ],
    'overloaded command implies repetition'
  )
  t.same(
    parse('m100,100 200,100 Z'),
    [
      { type: 'M', relative: false, x: 100, y: 100 },
      { type: 'L', relative: true, x: 200, y: 100 },
      { type: 'Z' }
    ],
    'special case: overloaded M implies L'
  )
  result = parse('M100,100 200,100 Z')
  t.equal(result[1].relative, false, 'inherit relativity from M')
  result = parse('m100,100 200,100 Z')
  t.equal(result[1].relative, true, 'inherit relativity from M')
  t.end()
})

test('argument names', function (t) {
  t.same(
    parse('M10,20 L20,30 H30 V40'),
    [
      { type: 'M', relative:false, x: 10, y: 20 },
      { type: 'L', relative:false, x: 20, y: 30 },
      { type: 'H', relative:false, x: 30 },
      { type: 'V', relative:false, y: 40 }
    ]
  )
  t.same(
    parse('M0,0 C10,20 30,40 50,60 S10,20 30,40 Q10,20 30,40 T10,20'),
    [
      { type: 'M', relative:false, x: 0, y: 0 },
      { type: 'C', relative:false, x1:10, y1:20, x2:30, y2:40, x:50, y:60 },
      { type: 'S', relative:false, x2:10, y2:20, x:30, y:40 },
      { type: 'Q', relative:false, x1:10, y1:20, x:30, y:40 },
      { type: 'T', relative:false, x:10, y:20 }
    ]
  )
  t.same(
    parse('M0,0 A50,60 -30 0,1 50,-25'),
    [
      { type: 'M', relative:false, x: 0, y: 0 },
      { type: 'A', relative:false, rx:50, ry:60,
        x_axis_rotation:-30, large_arc_flag:0, sweep_flag:1, x:50, y:-25 }
    ]
  )
  t.end()
})

test('throws unless first command is M', function (t) {
  t.throws(
    function() { parse('L100,100') },
    new SyntaxError("Unexpected command 'L', expected first command to be 'M'.")
  )
  t.end()
})

test('Z has no relativity', function (t) {
  var result = parse('M100,100 L100,200 Z')
  t.same(result[2], { type: 'Z' })
  t.end()
})

test('throws on invalid number of arguments', function (t) {
  t.throws(
    function() { parse('M100,100 L200') },
    new SyntaxError('Missing args (command L, got 1 arg(s)).')
  )
  t.end()
})

test('throws on invalid Arc arguments', function (t) {
  t.throws(
    function() { parse('M100,100 A -50,-30, 30, 0,1, 25,25') },
    new SyntaxError('Invalid args (command A).')
  )
  t.throws(
    function() { parse('M100,100 A50,30, -10, 5,12, 25,25') },
    new SyntaxError('Invalid args (command A).')
  )
  t.end()
})

test('example', function (t) {
  t.same(
    parse('m100,1e2C125,100 130,110 150,150l-25-75z'),
    [
      { type: 'M', relative: false, x: 100, y: 100 },
      { type: 'C', relative: false,
        x1: 125, y1: 100, x2: 130, y2: 110, x: 150, y: 150 },
      { type: 'L', relative: true, x: -25, y: -75 },
      { type: 'Z' }
    ]
  )
  t.end()
})
