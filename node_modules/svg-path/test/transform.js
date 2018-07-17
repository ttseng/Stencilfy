var test = require('tape')
var Path = require('../lib/Path')

test('translate', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0,  y:0  },
    { type: 'L', relative:false, x:30, y:60 }
  ])
  path.translate(33, 55)
  t.same(path.content,
    [
      { type: 'M', relative:false, x:33, y:55  },
      { type: 'L', relative:false, x:63, y:115 },
    ])
  t.end()
})

test('scale', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0,  y:0  },
    { type: 'L', relative:false, x:30, y:60 }
  ])
  path.scale(2, 3)
  t.same(path.content,
    [
      { type: 'M', relative:false, x:0,  y:0   },
      { type: 'L', relative:false, x:60, y:180 },
    ])
  t.end()
})

test('rotate', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:20, y:0 },
    { type: 'L', relative:false, x:50, y:0 }
  ])
  path.rotate(90)
  t.same(path.content,
    [
      { type: 'M', relative:false, x:0, y:20 },
      { type: 'L', relative:false, x:0, y:50 },
    ])
  t.end()
})

test('skewX', function (t) {
  // TODO
  t.end()
})

test('skewY', function (t) {
  // TODO
  t.end()
})
