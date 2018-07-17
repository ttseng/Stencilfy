var buildCommand = require('./buildCommand')

var NUM_ARGS = { M:2, L:2, H:1, V:1, C:6, S:4, Q:4, T:2, A:7 }

module.exports = function parseCommand(command, args) {
  var type = command.toUpperCase()
  var relative = (command !== type)
  var continuation = false
  var commands = []

  var argGroup, command
  while (true) {
    argGroup = args.splice(0, NUM_ARGS[type])
    if (argGroup.length < NUM_ARGS[type])
      throwMissingArgs(type, argGroup.length, commands)
    else {
      command = buildCommand(type, relative, argGroup)
      if (type === 'A') {
        if (command.rx < 0 || command.ry < 0
          || !validFlag(command.large_arc_flag)
          || !validFlag(command.sweep_flag))
        {
          throwInvalidArgs(type, commands)
        }
      }
      else if (type === 'M' && continuation ) {
        // after the first pair of coordinates, M implies L
        command.type = 'L'
      }
      commands.push(command)
    }
    if (args.length > 0)
      continuation = true
    else
      break
  }
  return commands
}

function validFlag (flag) {
  return flag === 1 || flag === 0
}

function throwMissingArgs(type, num, partial) {
  var error = new SyntaxError('Missing args (command '+type+', got '+num+' arg(s)).')
  error.partial = partial
  throw error
}

function throwInvalidArgs(type, partial) {
  var error = new SyntaxError('Invalid args (command '+type+').')
  error.partial = partial
  throw error
}
