module.exports = function flattenCommandArgs (command) {
  if (command.type === 'M' || command.type === 'L' || command.type === 'T') {
    return [command.x, command.y]
  }
  else if (command.type === 'H') {
    return [command.x]
  }
  else if (command.type === 'V') {
    return [command.y]
  }
  else if (command.type === 'C') {
    return [
      command.x1, command.y1,
      command.x2, command.y2,
      command.x,  command.y
    ]
  }
  else if (command.type === 'S') {
    return [
      command.x2, command.y2,
      command.x,  command.y
    ]
  }
  else if (command.type === 'Q') {
    return [
      command.x1, command.y1,
      command.x,  command.y
    ]
  }
  else if (command.type === 'A') {
    return [
      command.rx, command.ry,
      command.x_axis_rotation,
      command.large_arc_flag,
      command.sweep_flag,
      command.x, command.y
    ]
  }
  else {
    return []
  }
}
