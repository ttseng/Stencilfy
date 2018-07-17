var parse = require('../')
var test = require('tape')

test('integers', function (t) {
  t.same(parse('1'),       [ 1 ],       '1')
  t.same(parse('1, 2, 3'), [ 1, 2, 3 ], '1, 2, 3')
  t.same(parse('1 2 3'),   [ 1, 2, 3 ], '1 2 3')
  t.end()
})

test('floats', function (t) {
  t.same(parse('1.5'),          [ 1.5 ],            '1.5')
  t.same(parse('1.5, 4.2'),     [ 1.5, 4.2 ],       '1.5, 4.2')
  t.same(parse('1.2.3.4'),      [ 1.2, .3, .4 ],    '1.2.3.4')
  t.same(parse('1.2.3,4.5'),    [ 1.2, .3, 4.5 ],   '1.2.3,4.5')
  t.same(parse('.1 .2,.3, .4'), [ .1, .2, .3, .4 ], '.1 .2,.3, .4')
  t.end()
})

test('signs', function (t) {
  t.same(parse('-1'),        [ -1 ],        '-1')
  t.same(parse('-1, -2, 3'), [ -1, -2, 3 ], '-1, -2, 3')
  t.same(parse('1-2-3'),     [ 1, -2, -3 ], '1-2-3')
  t.same(parse('1 -2 +3'),   [ 1, -2, 3 ],  '1 -2 +3')
  t.end()
})

test('exponent', function (t) {
  t.same(parse('1e3'),       [ 1000 ],         '1e3')
  t.same(parse('1e-3'),      [ 1/1000 ],       '1e-3')
  t.same(parse('1e3.5'),     [ 1000, .5 ],     '1e3.5')
  t.same(parse('1e3,5'),     [ 1000, 5 ],      '1e3,5')
  t.same(parse('1e3 4.2e5'), [ 1000, 420000 ], '1e3 4.2e5')
  t.end()
})

test('separators', function (t) {
  t.same(parse('  1    2 '), [ 1, 2 ],        '  1    2 ')
  t.same(parse('1,2,3'),     [ 1, 2, 3 ],     '1,2,3')
  t.same(parse('-1-2-3'),    [ -1, -2, -3 ],  '-1-2-3')
  t.same(parse('1.2.3.4'),   [ 1.2, .3, .4 ], '1.2.3.4')
  t.same(parse('1 , 2 ,3'),  [ 1, 2, 3 ],     '1 , 2 ,3')
  t.end()
})

test('type error', function (t) {
  t.throws(function() { parse(undefined) },
           new TypeError('Invalid input: undefined'))
  t.throws(function() { parse(true) },
           new TypeError('Invalid input: boolean'))
  t.throws(function() { parse({obj:'ect'}) },
           new TypeError('Invalid input: object'))
  t.throws(function() { parse(['array']) },
           new TypeError('Invalid input: object'))
  t.end()
})

test('syntax error', function (t) {
  t.throws(function() { parse('1.2ee4') },
           new SyntaxError('Unexpected character "e" at index 4.'))
  t.throws(function() { parse('1.2e--4') },
           new SyntaxError('Unexpected character "-" at index 5.'))
  t.throws(function() { parse('--1') },
           new SyntaxError('Unexpected character "-" at index 1.'))
  t.throws(function() { parse('-+1') },
           new SyntaxError('Unexpected character "+" at index 1.'))
  t.throws(function() { parse('1,,2') },
           new SyntaxError('Unexpected character "," at index 2.'))
  t.throws(function() { parse(',2,3') },
           new SyntaxError('Unexpected character "," at index 0.'))
  t.throws(function() { parse('1..1') },
           new SyntaxError('Unexpected character "." at index 2.'))
  t.end()
})

test('full example', function (t) {
  t.same(
    parse('100,1e2 15.20,-110,150-25-75'),
    [ 100, 1e2, 15.2, -110, 150, -25, -75 ],
    '100,1e2 15.20,-110,150-25-75'
  )
  t.end()
})
