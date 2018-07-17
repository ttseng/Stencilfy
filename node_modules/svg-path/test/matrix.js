var test = require('tape')
var Path = require('../lib/Path')

// |a c e|
// |b d f| is also expressed as [a b c d e f]
// |0 0 1|
//
// (See http://www.w3.org/TR/SVG/coords.html#EstablishingANewUserSpace)

test('identity matrix', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0,  y:0  },
    { type: 'L', relative:false, x:30, y:60 }
  ])
  // |1 0 0|
  // |0 1 0|
  // |0 0 1|
  path.matrix(1, 0, 0, 1, 0, 0)
  t.same(path.content,
    [
      { type: 'M', relative:false, x:0,  y:0  },
      { type: 'L', relative:false, x:30, y:60 }
    ])
  t.end()
})

test('translation', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0,  y:0  },
    { type: 'L', relative:false, x:30, y:60 }
  ])
  // |1 0 tx|
  // |0 1 ty|
  // |0 0 1 |
  path.matrix(1, 0, 0, 1, 33, 55)
  t.same(path.content,
    [
      { type: 'M', relative:false, x:33, y:55  },
      { type: 'L', relative:false, x:63, y:115 },
    ])
  t.end()
})

test('scaling', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0,  y:0  },
    { type: 'L', relative:false, x:30, y:60 }
  ])
  // |sx 0  0|
  // |0  sy 0|
  // |0  0  1|
  path.matrix(2, 0, 0, 3, 0, 0)
  t.same(path.content,
    [
      { type: 'M', relative:false, x:0,  y:0   },
      { type: 'L', relative:false, x:60, y:180 },
    ])
  t.end()
})

test('x1,y1 and x2,y2', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0, y:0 },
    { type: 'C', relative:false, x1:10, y1:0, x2:20, y2:10, x:20, y:20 }
  ])
  path.matrix(1, 0, 0, 1, 10, 10) // translate 10,10
  t.same(path.content,
    [
      { type: 'M', relative:false, x:10, y:10 },
      { type: 'C', relative:false, x1:20, y1:10, x2:30, y2:20, x:30, y:30 }
    ])
  path.matrix(2, 0, 0, 3, 0, 0) // scale 2,3
  t.same(path.content,
    [
      { type: 'M', relative:false, x:20, y:30 },
      { type: 'C', relative:false, x1:40, y1:30, x2:60, y2:60, x:60, y:90 }
    ])
  t.end()
})

test('arcs', function(t) {
  var path = new Path([
    { type: 'M', relative:false, x:275, y:175 },
    { type: 'V', relative:false, y:25 },
    { type: 'A', relative:false, rx:150, ry:150,
      x_axis_rotation:0, large_arc_flag:0, sweep_flag:0,
      x:125, y:175 }
  ])
  path.matrix(1, 0, 0, 1, 10, 10) // translate 10,10
  t.same(path.content,
    [
      { type: 'M', relative:false, x:285, y:185 },
      { type: 'V', relative:false, y:35 },
      { type: 'C', relative:false,
        x1:202.15728752538098, y1:35.000000000000014,
        x2:134.99999999999999, y2:102.157287525381,
        x:135, y:185 }
    ])
  t.end()

})
