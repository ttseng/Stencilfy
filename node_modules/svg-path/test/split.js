var test = require('tape')
var Path = require('../lib/Path')

test('single path', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0, y:0 },
    { type: 'L', relative:false, x:100, y:100 },
    { type: 'Z' }
  ])
  var subpaths = path.split()
  t.same(subpaths.length, 1)
  t.same(subpaths[0].content,
    [
      { type: 'M', relative:false, x:0, y:0 },
      { type: 'L', relative:false, x:100, y:100 },
      { type: 'Z' }
    ])
  t.end()
})

test('explicit subpath', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0, y:0 },
    { type: 'L', relative:false, x:100, y:100 },
    { type: 'Z' },
    { type: 'M', relative:false, x:50, y:50 },
    { type: 'L', relative:false, x:200, y:200 }
  ])
  var subpaths = path.split()
  t.same(subpaths.length, 2)
  t.same(subpaths[0].content,
    [
      { type: 'M', relative:false, x:0, y:0 },
      { type: 'L', relative:false, x:100, y:100 },
      { type: 'Z' }
    ])
  t.same(subpaths[1].content,
    [
      { type: 'M', relative:false, x:50, y:50 },
      { type: 'L', relative:false, x:200, y:200 }
    ])
  t.end()
})

test('relative subpath', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:50, y:50 },
    { type: 'L', relative:false, x:100, y:100 },
    { type: 'Z' },
    { type: 'M', relative:true, x:50, y:50 },
    { type: 'L', relative:false, x:200, y:200 }
  ])
  var subpaths = path.split()
  t.same(subpaths.length, 2)
  t.same(subpaths[0].content,
    [
      { type: 'M', relative:false, x:50, y:50 },
      { type: 'L', relative:false, x:100, y:100 },
      { type: 'Z' }
    ])
  t.same(subpaths[1].content,
    [
      { type: 'M', relative:false, x:100, y:100 },
      { type: 'L', relative:false, x:200, y:200 }
    ])
  t.end()
})

test('subpath without closepath', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0, y:0 },
    { type: 'L', relative:false, x:100, y:100 },
    { type: 'M', relative:false, x:50, y:50 },
    { type: 'L', relative:false, x:200, y:200 }
  ])
  var subpaths = path.split()
  t.same(subpaths.length, 2)
  t.same(subpaths[0].content,
    [
      { type: 'M', relative:false, x:0, y:0 },
      { type: 'L', relative:false, x:100, y:100 }
    ])
  t.same(subpaths[1].content,
    [
      { type: 'M', relative:false, x:50, y:50 },
      { type: 'L', relative:false, x:200, y:200 }
    ])
  t.end()
})

test('implicit subpath after closepath', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0, y:0 },
    { type: 'L', relative:false, x:100, y:100 },
    { type: 'Z' },
    { type: 'L', relative:false, x:200, y:200 }
  ])
  var subpaths = path.split()
  t.same(subpaths.length, 2)
  t.same(subpaths[0].content,
    [
      { type: 'M', relative:false, x:0, y:0 },
      { type: 'L', relative:false, x:100, y:100 },
      { type: 'Z' }
    ])
  t.same(subpaths[1].content,
    [
      { type: 'M', relative:false, x:0, y:0 },
      { type: 'L', relative:false, x:200, y:200 }
    ])
  t.end()
})

test('commands are clones', function (t) {
  var path = new Path([
    { type: 'M', relative:false, x:0, y:0 },
    { type: 'L', relative:false, x:100, y:100 },
    { type: 'M', relative:false, x:50, y:50 },
    { type: 'L', relative:false, x:200, y:200 }
  ])
  var subpaths = path.split()
  t.same(subpaths.length, 2)
  // commands should be clones...
  t.same(path.content[0], subpaths[0].content[0])
  t.same(path.content[1], subpaths[0].content[1])
  t.same(path.content[2], subpaths[1].content[0])
  t.same(path.content[3], subpaths[1].content[1])
  // ...not references to the same objects:
  t.notEqual(path.content[0], subpaths[0].content[0])
  t.notEqual(path.content[1], subpaths[0].content[1])
  t.notEqual(path.content[2], subpaths[1].content[0])
  t.notEqual(path.content[3], subpaths[1].content[1])
  t.end()
})
