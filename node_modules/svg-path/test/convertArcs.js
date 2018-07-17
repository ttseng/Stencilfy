var test = require('tape')
var Path = require('../lib/Path')

test('absolute', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:275, y:175 },
    { type: 'V', relative:false, y:25 },
    { type: 'A', relative:false, rx:150, ry:150,
      x_axis_rotation:0, large_arc_flag:0, sweep_flag:0,
      x:125, y:175 },
    { type: 'Z' }
  ])
  path.convertArcs()
  t.same(path.content,
    [
      { type: 'M', relative:false, x:275, y:175 },
      { type: 'V', relative:false, y:25 },
      { type: 'C', relative:false,
        x1:192.15728752538098, y1:25.000000000000014,
        x2:124.99999999999999, y2:92.157287525381,
        x:125, y:175 },
      { type: 'Z' }
    ])
  t.end()
})

test('relative', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:275, y:175 },
    { type: 'V', relative:false, y:25 },
    { type: 'A', relative:true, rx:150, ry:150,
      x_axis_rotation:0, large_arc_flag:0, sweep_flag:0,
      x:-150, y:150 },
    { type: 'Z' }
  ])
  path.convertArcs()
  t.same(path.content,
    [
      { type: 'M', relative:false, x:275, y:175 },
      { type: 'V', relative:false, y:25 },
      { type: 'C', relative:false,
        x1:192.15728752538098, y1:25.000000000000014,
        x2:124.99999999999999, y2:92.157287525381,
        x:125, y:175 },
      { type: 'Z' }
    ])
  t.end()
})

// TODO: test large arc and other variations
