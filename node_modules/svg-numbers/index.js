// Character groups
var RE = {
  SEPARATOR: /[ \t\r\n\,.\-+]/,
  WHITESPACE: /[ \t\r\n]/,
  DIGIT: /[\d]/,
  SIGN: /[-+]/,
  POINT: /\./,
  COMMA: /,/,
  EXP: /e/i
}

// States
var SEP = 0
var INT = 1
var FLOAT = 2
var EXP = 3

module.exports = parse
module.exports.parse = parse
module.exports.serialize = serialize

function parse (input) {

  if (typeof input !== 'string') {
    throw new TypeError('Invalid input: ' + typeof input)
  }

  var state = SEP
  var seenComma = true
  var result = [], number = '', exponent = ''

  function newNumber() {
    if (number !== '') {
      if (exponent==='') result.push(Number(number))
      else               result.push(Number(number) * Math.pow(10, Number(exponent)))
    }
    number = ''
    exponent = ''
  }

  var current, i = 0, length = input.length
  for (i = 0; i < length; i++) {
    current = input[i]

    // parse until next number
    if (state === SEP) {
      // eat whitespace
      if (RE.WHITESPACE.test(current)) {
        continue
      }
      // start new number
      if (RE.DIGIT.test(current) || RE.SIGN.test(current)) {
        state = INT
        number = current
        continue
      }
      if (RE.POINT.test(current)) {
        state = FLOAT
        number = current
        continue
      }
      // throw on double commas (e.g. "1, , 2")
      if (RE.COMMA.test(current)) {
        if (seenComma) {
          throwSyntaxError(current, i, result)
        }
        seenComma = true
      }
    }

    // parse integer part
    if (state === INT) {
      if (RE.DIGIT.test(current)) {
        number += current
        continue
      }
      if (RE.POINT.test(current)) {
        number += current
        state = FLOAT
        continue
      }
      if (RE.EXP.test(current)) {
        state = EXP
        continue
      }
      // throw on double signs ("-+1"), but not on sign as separator ("-1-2")
      if (RE.SIGN.test(current)
          && number.length === 1
          && RE.SIGN.test(number[0])) {
        throwSyntaxError(current, i, result)
      }
    }

    // parse decimal part
    if (state === FLOAT) {
      if (RE.DIGIT.test(current)) {
        number += current
        continue
      }
      if (RE.EXP.test(current)) {
        state = EXP
        continue
      }
      // throw on double decimal points (e.g. "1..2")
      if (RE.POINT.test(current) && number[number.length-1] === '.') {
        throwSyntaxError(current, i, result)
      }
    }

    // parse exponent part
    if (state == EXP) {
      if (RE.DIGIT.test(current)) {
        exponent += current
        continue
      }
      if (RE.SIGN.test(current)) {
        if (exponent === '') {
          exponent += current
          continue
        }
        if (exponent.length === 1 && RE.SIGN.test(exponent)) {
          throwSyntaxError(current, i, result)
        }
      }
    }


    // end of number
    if (RE.WHITESPACE.test(current)) {
      newNumber()
      state = SEP
      seenComma = false
    }
    else if (RE.COMMA.test(current)) {
      newNumber()
      state = SEP
      seenComma = true
    }
    else if (RE.SIGN.test(current)) {
      newNumber()
      state = INT
      number = current
    }
    else if (RE.POINT.test(current)) {
      newNumber()
      state = FLOAT
      number = current
    }
    else {
      throwSyntaxError(current, i, result)
    }
  }

  // add the last number found (if any)
  newNumber()

  return result
}

function serialize (points) {
  var seenFloat = false
  var seenExponent = false
  var result = ''
  points.forEach(function (point) {
    if (point < 0) {
      if (point > -1)
        result += '-' + point.toString().slice(2)
      else
        result += point.toString()
    }
    else {
      if (point > 0 && point < 1) {
        if (!seenFloat && !seenExponent && result !== '')
          result += ','
        result += point.toString().slice(1)
      } else {
        if (result !== '')
          result += ','
        result += point.toString()
      }
    }
    seenFloat = point !== Math.round(point)
  })
  return result
}

function throwSyntaxError (current, i, partial) {
  var error = new SyntaxError('Unexpected character "'+current+'" at index '+i+'.')
  error.partial = partial
  throw error
}
