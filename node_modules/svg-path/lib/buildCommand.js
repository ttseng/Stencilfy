module.exports = function buildCommand(type, relative, args) {
  var command = {
    type: type,
    relative: relative
  }
  if (type === 'M' || type === 'L' || type === 'T') {
    command.x = args[0]
    command.y = args[1]
  }
  else if (type === 'H') {
    command.x = args[0]
  }
  else if (type === 'V') {
    command.y = args[0]
  }
  else if (type === 'C') {
    command.x1 = args[0]
    command.y1 = args[1]
    command.x2 = args[2]
    command.y2 = args[3]
    command.x = args[4]
    command.y = args[5]
  }
  else if (type === 'S') {
    command.x2 = args[0]
    command.y2 = args[1]
    command.x = args[2]
    command.y = args[3]
  }
  else if (type === 'Q') {
    command.x1 = args[0]
    command.y1 = args[1]
    command.x = args[2]
    command.y = args[3]
  }
  else if (type === 'A') {
    command.rx = args[0]
    command.ry = args[1]
    command.x_axis_rotation = args[2]
    command.large_arc_flag = args[3]
    command.sweep_flag = args[4]
    command.x = args[5]
    command.y = args[6]
  }
  else if (type === 'Z') {
    delete command.relative
  }
  return command
}
