var serialize = require('../').serialize
var test = require('tape')

test('integers', function (t) {
  t.same(serialize([ 1 ]),       '1')
  t.same(serialize([ 1, 2, 3 ]), '1,2,3')
  t.end()
})

test('floats', function (t) {
  t.same(serialize([ 1.2 ]),          '1.2')
  t.same(serialize([ 1.2, .2 ]),      '1.2.2')
  t.same(serialize([ 1.2, .3, 4.5 ]), '1.2.3,4.5')
  t.end()
})

test('signs', function (t) {
  t.same(serialize([ -1 ]),        '-1')
  t.same(serialize([ -1, -2, 3 ]), '-1-2,3')
  t.same(serialize([ 1, -2, -3 ]), '1-2-3')
  t.same(serialize([ 1, -2, 3 ]),  '1-2,3')
  t.end()
})
