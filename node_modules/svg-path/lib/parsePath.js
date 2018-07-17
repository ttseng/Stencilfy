var parseNumbers = require('svg-numbers')
var parseCommand = require('./parseCommand')

var COMMAND_GROUP_REGEX = /([MZLHVCSQTAZ])([^MZLHVCSQTAZ]*)/ig

module.exports = function parsePath (input) {
  var firstCommand = true
  var commands = []
  var concat = function (newCommands) {
    var spliceCommands = Array.prototype.splice.bind(commands, commands.length, 0)
    spliceCommands.apply(commands, newCommands)
  }
  var i=0
  input
    .replace(/^[ \t\r\n]*/, '')
    .replace(COMMAND_GROUP_REGEX, function(match, command, args, offset) {
      i += match.length
      concat(parseCommand(command, parseNumbers(args)))
      if (firstCommand && commands[0] != null) {
        if (commands[0].type !== 'M') {
          throwSyntaxError("Unexpected command '" + commands[0].type
                           + "', expected first command to be 'M'.")
        }
        commands[0].relative = false // first moveto is always absolute
        firstCommand = false
      }
    })
  return commands
}

function throwSyntaxError (message, partial) {
  var error = new SyntaxError(message)
  error.partial = partial
  throw error
}
