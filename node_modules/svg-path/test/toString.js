var test = require('tape')
var Path = require('../lib/Path')

test('toString', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:100, y:100 },
    { type: 'L', relative:true, x:50, y:-50 },
    { type: 'H', relative:false, x:50 },
    { type: 'Z' }
  ])
  t.same(path.toString(), 'M100,100l50-50H50Z')
  t.same(''+path, 'M100,100l50-50H50Z')
  t.end()
})

