var test = require('tape')
var Path = require('../lib/Path')

test('copy', function (t) {
  var before = new Path([
    { type: 'M', relative:false, x:0,  y:0  },
    { type: 'L', relative:false, x:30, y:60 }
  ])
  var after = before.copy()
  after.content[1].x = 100
  t.same(after.content[1], { type: 'L', relative:false, x:100, y:60 })
  t.same(before.content[1], { type: 'L', relative:false, x:30, y:60 })
  t.end()
})
