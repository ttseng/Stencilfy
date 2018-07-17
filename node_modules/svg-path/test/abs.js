var test = require('tape')
var Path = require('../lib/Path')

test('single path', function (t) {
  var path = new Path([
    { type: 'M', relative: false, x: 10, y: 10 },
    { type: 'H', relative: true, x: 10 },
    { type: 'L', relative: true, x: 20, y: -20 },
    { type: 'L', relative: false, x: 10, y: 20 },
    { type: 'Z' }
  ])
  path.abs()
  t.same(path.content,
    [
      { type: 'M', relative: false, x: 10, y: 10 },
      { type: 'H', relative: false, x: 20 },
      { type: 'L', relative: false, x: 40, y: -10 },
      { type: 'L', relative: false, x: 10, y: 20 },
      { type: 'Z' }
    ])
  t.end()
})

test('absolute subpath', function (t) {
  var path = new Path([
    { type: 'M', relative: false, x:0, y:0 },
    { type: 'L', relative: false, x:100, y:100 },
    { type: 'Z' },
    { type: 'M', relative: false, x:50, y:50 },
    { type: 'L', relative: false, x:20, y:20 }
  ])
  path.abs()
  // No change
  t.same(path.content,
    [
      { type: 'M', relative: false, x:0, y:0 },
      { type: 'L', relative: false, x:100,y:100 },
      { type: 'Z' },
      { type: 'M', relative: false, x:50, y:50 },
      { type: 'L', relative: false, x:20, y:20 }
    ])
  t.end()
})

test('relative subpath', function (t) {
  var path = new Path([
    { type: 'M', relative: false, x:50, y:50 },
    { type: 'L', relative: true, x:100, y:100 },
    { type: 'Z' },
    { type: 'M', relative: true, x:50, y:50 },
    { type: 'L', relative: true, x:20, y:20 }
  ])
  path.abs()
  // Subpath is relative to original start point (i.e. the END of the Z move)
  t.same(path.content,
    [
      { type: 'M', relative: false, x:50, y:50 },
      { type: 'L', relative: false, x:150,y:150 },
      { type: 'Z' },
      { type: 'M', relative: false, x:100, y:100 },
      { type: 'L', relative: false, x:120, y:120 }
    ])
  t.end()
})

test('relative implicit subpath', function (t) {
  var path = new Path([
    { type: 'M', relative: false, x:50, y:50 },
    { type: 'L', relative: true, x:100, y:100 },
    { type: 'Z' },
    { type: 'L', relative: true, x:20, y:20 }
  ])
  path.abs()
  // Subpath is relative to original start point (i.e. the END of the Z move)
  t.same(path.content,
    [
      { type: 'M', relative: false, x:50, y:50 },
      { type: 'L', relative: false, x:150,y:150 },
      { type: 'Z' },
      { type: 'L', relative: false, x:70, y:70 }
    ])
  t.end()
})

test('absolute implicit subpath', function (t) {
  var path = new Path([
    { type: 'M', relative: false, x:50, y:50 },
    { type: 'L', relative: true, x:100, y:100 },
    { type: 'Z' },
    { type: 'L', relative: false, x:20, y:20 }
  ])
  path.abs()
  t.same(path.content,
    [
      { type: 'M', relative: false, x:50, y:50 },
      { type: 'L', relative: false, x:150,y:150 },
      { type: 'Z' },
      { type: 'L', relative: false, x:20, y:20 }
    ])
  t.end()
})
