var numbers = require('svg-numbers')
var flattenArgs = require('./flattenCommandArgs')

module.exports = function serializeCommand (command) {
  var prefix = command.relative ? command.type.toLowerCase() : command.type
  var args = flattenArgs(command)
  return prefix + numbers.serialize(args)
}
