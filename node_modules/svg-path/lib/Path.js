var parsePath = require('./parsePath')
var parseCommand = require('./parseCommand')
var serializeCommand = require('./serializeCommand')

module.exports = Path

function Path (content) {
  this.content = content
}

Path.prototype.abs = function () {
  this.filterMap(function (command, x, y) {
    if (command.relative) {
      if (command.x1 != null) command.x1 += x
      if (command.y1 != null) command.y1 += y
      if (command.x2 != null) command.x2 += x
      if (command.y2 != null) command.y2 += y
      if (command.x != null)  command.x  += x
      if (command.y != null)  command.y  += y
      command.relative = false
    }
  })
}

Path.prototype.matrix = function (a, b, c, d, e, f, debug) {
  for (var i=0; i < 6; i++) {
    if (typeof arguments[i] !== 'number')
      throw new TypeError('Matrix transformations require 6 Number arguments.')
  }
  this.convertArcs()
  this.filterMap(function (command, x, y) {
    applyMatrix(command, a, b, c, d, e, f)
  })
}

Path.prototype.convertArcs = function () {
  var args, curves
  this.filterMap(function (command, x, y) {
    if (command.type === 'A') {
      return convertArc(command, x, y)
    }
  })
}

Path.prototype.translate = function (tx, ty) {
  this.matrix(1, 0, 0, 1, tx, ty)
}

Path.prototype.scale = function (sx, sy) {
  this.matrix(sx, 0, 0, sy, 0, 0)
}

Path.prototype.rotate = function (a) {
  a = a * (Math.PI / 180)
  this.matrix(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0)
}

Path.prototype.skewX = function (a) {
  a = a * (Math.PI / 180)
  this.matrix(1, 0, Math.tan(a), 1, 0, 0)
}

Path.prototype.skewY = function (a) {
  a = a * (Math.PI / 180)
  this.matrix(1, Math.tan(a), 0, 1, 0, 0)
}

Path.prototype.copy = function () {
  var newContent = this.content.map(function (command) {
    var copy = {}
    for (var attr in command) {
      if (command.hasOwnProperty(attr)) copy[attr] = command[attr];
    }
    return copy
  })
  return new Path(newContent)
}

Path.prototype.split = function () {
  var subpaths = [[]]
  var start
  function currentPath() { return subpaths[subpaths.length - 1] }
  function push(command) { currentPath().push(command) }
  function newPath() {
    subpaths.push([])
  }
  this.content.forEach(function (command) {
    if (command.type === 'Z') {
      push(clone(command))
      newPath()
    } else if (command.type === 'M' && currentPath().length > 0) {
      newPath()
      push(clone(command))
      start = command
    } else {
      if (command.type === 'M') {
        if (command.relative) {
          start = { type: 'M', relative: false,
                   x: command.x + start.x,
                   y: command.y + start.y }
        } else {
          start = clone(command)
        }
        push(start)
      } else if (currentPath().length === 0) {
        push({ type: 'M', relative: false, x: start.x, y: start.y })
        push(clone(command))
      } else {
        push(clone(command))
      }
    }
  })
  if (currentPath().length === 0) subpaths.pop()
  return subpaths.map(function (subpath) {
    return new Path(subpath)
  })
}

Path.prototype.toString = function () {
  return this.content.reduce(function (result, command) {
    return result + serializeCommand(command)
  }, '')
}

// Iterate over the list of commands, calling the callback for each one with
// the command and the current absolute x and y.
//
// If the callback returns false, the current command will be filtered out.
// If it returns an array of commands, the current command will be replaced
// with those commands. If it returns null or undefined, nothing happens.
Path.prototype.filterMap = function (callback) {
  var commands = this.content
  var x, y, startX, startY, seenZ=false
  var current, replacement, i, numReplaced
  for (i = 0; /* do not cache length! */ i < commands.length; i++) {
    current = commands[i]
    if (seenZ) {
      seenZ = false
      replacement = callback(current, startX, startY)
    } else {
      replacement = callback(current, x, y)
    }
    if (replacement === false) {
      replacement = []
    }
    if (replacement) {
      numReplaced = replace(i, replacement)
      i += numReplaced - 1
      current = commands[i]
    }
    if (current.type === 'Z') {
      seenZ = true
    } else if (current.type === 'M') {
      x = startX = current.x
      y = startY = current.y
    } else {
      if (current.x != null) x = current.x
      if (current.y != null) y = current.y
    }
  }
  function replace (i, replacement) {
    commands
      .splice.bind(commands, i, 1)
      .apply(commands, replacement)
    return replacement.length
  }
}

function clone (command) {
  var clone = {}
  for (var attr in command) {
    if (command.hasOwnProperty(attr)) clone[attr] = command[attr];
  }
  return clone
}

function applyMatrix (cmd, a, b, c, d, e, f) {
  // x' = a*x + c*y + e 
  // y' = b*x + d*y + f
  var x = (cmd.x == null ? 0 : cmd.x)
  var y = (cmd.y == null ? 0 : cmd.y)
  if (cmd.x != null) {
    cmd.x = x*a + y*c + e
    if (nearZero(cmd.x)) cmd.x = 0
  }
  if (cmd.y != null) {
    cmd.y = x*b + y*d + f
    if (nearZero(cmd.y)) cmd.y = 0
  }
  if (cmd.x1 != null) {
    cmd.x1 = cmd.x1*a + cmd.y1*c + e
    cmd.y1 = cmd.x1*b + cmd.y1*d + f
    if (nearZero(cmd.x1)) cmd.x1 = 0
    if (nearZero(cmd.y1)) cmd.y1 = 0
  }
  if (cmd.x2 != null) {
    cmd.x2 = cmd.x2*a + cmd.y2*c + e
    cmd.y2 = cmd.x2*b + cmd.y2*d + f
    if (nearZero(cmd.x2)) cmd.x2 = 0
    if (nearZero(cmd.y2)) cmd.y2 = 0
  }
}

function nearZero (num) {
  return Math.abs(num) < 1e-12
}

function convertArc (command, x, y) {
  if (command.relative) {
    command.x += x
    command.y += y
    command.relative = false
  }
  args = a2c(x, y, command.rx, command.ry, command.x_axis_rotation, command.large_arc_flag, command.sweep_flag, command.x, command.y)
  return parseCommand('C', args)
}

function a2c (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
  var PI = Math.PI
  // Borrowed from https://github.com/DmitryBaranovskiy/raphael/blob/4d97d4ff5350bb949b88e6d78b877f76ea8b5e24/raphael.js#L2216-L2304
  // (MIT licensed; http://raphaeljs.com/license.html).
  // --------------------------------------------------------------------------
  // for more information of where this math came from visit:
  // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
  var _120 = PI * 120 / 180,
      rad = PI / 180 * (+angle || 0),
      res = [],
      xy,
      rotate = function (x, y, rad) {
        var X = x * Math.cos(rad) - y * Math.sin(rad),
        Y = x * Math.sin(rad) + y * Math.cos(rad);
        return {x: X, y: Y};
      };
  if (!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;
    var cos = Math.cos(PI / 180 * angle),
        sin = Math.sin(PI / 180 * angle),
        x = (x1 - x2) / 2,
        y = (y1 - y2) / 2;
    var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (h > 1) {
      h = Math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }
    var rx2 = rx * rx,
        ry2 = ry * ry,
        k = (large_arc_flag == sweep_flag ? -1 : 1) *
          Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
        cx = k * rx * y / ry + (x1 + x2) / 2,
        cy = k * -ry * x / rx + (y1 + y2) / 2,
        f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
        f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? PI - f1 : f1;
    f2 = x2 < cx ? PI - f2 : f2;
    f1 < 0 && (f1 = PI * 2 + f1);
    f2 < 0 && (f2 = PI * 2 + f2);
    if (sweep_flag && f1 > f2) {
      f1 = f1 - PI * 2;
    }
    if (!sweep_flag && f2 > f1) {
      f2 = f2 - PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }
  var df = f2 - f1;
  if (Math.abs(df) > _120) {
    var f2old = f2,
        x2old = x2,
        y2old = y2;
    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * Math.cos(f2);
    y2 = cy + ry * Math.sin(f2);
    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
  }
  df = f2 - f1;
  var c1 = Math.cos(f1),
      s1 = Math.sin(f1),
      c2 = Math.cos(f2),
      s2 = Math.sin(f2),
      t = Math.tan(df / 4),
      hx = 4 / 3 * rx * t,
      hy = 4 / 3 * ry * t,
      m1 = [x1, y1],
      m2 = [x1 + hx * s1, y1 - hy * c1],
      m3 = [x2 + hx * s2, y2 - hy * c2],
      m4 = [x2, y2];
  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];
  if (recursive) {
    return [m2, m3, m4].concat(res);
  } else {
    res = [m2, m3, m4].concat(res).join().split(',');
    var newres = [];
    for (var i = 0, ii = res.length; i < ii; i++) {
      newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
    }
    return newres;
  }
}
