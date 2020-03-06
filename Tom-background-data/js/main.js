(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var path = require('path');
var production = ("development" === 'production');

module.exports = {
  bower: 'src/bower_components',
  src: 'src',
  production: production,
  debugInvTest: 'slice_sa',
  dist: production ? 'dist' : 'build',
	port: 9000,
	root: path.resolve('./'),
  onError: function(err) {
    console.error(err);
  }
};

},{"path":2}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("Zbi7gb"))
},{"Zbi7gb":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
/* globals jQuery */
jQuery.fn.extend({
    getPath: function () {
        "use strict";
        var path;
        var node = this;
        /*Include only names and IDs since you can always programmatically add/remove classes*/
        var uniqueTags = ['name', 'id'];
        while (node.length) {
            var realNode = node[0],
                name = realNode.localName;
            if (!name) {
                break;
            }
            name = name.toLowerCase();
            var parent = node.parent();
            var uniqueIdentifierFound = false;
            for (var i = uniqueTags.length - 1; i >= 0; i--) {
                var tag = uniqueTags[i];
                var tagValue = node.attr(tag);
                if (tagValue && (tagValue.trim !== '')) {
                    name = '[' + tag + '=\"' + tagValue + '\"]';
                    //we've found a unique identifier so we're done
                    uniqueIdentifierFound = true;
                    break; //exit for loop
                }
            }
            if (!uniqueIdentifierFound) {
                var sameTagSiblings = parent.children(name);

                //As soon as you know you have sibling nodes, use nth-of-type so you can better find a unique match
                if (sameTagSiblings.length > 1) {
                    var allSiblings = parent.children();
                    var index = allSiblings.index(realNode) + 1;
                    name += ':nth-child(' + index + ')';
                }
                path = name + (path ? '>' + path : '');
                node = parent;
            } else {
                path = name + (path ? '>' + path : '');
                break; //exit while loop
            }
        }
        return path;
    }
});

},{}],5:[function(require,module,exports){
'use strict';

var $ = require('jquery');
var ds = require('./view_models/data_store');

var sendAzn = function(turkId, assignmentId) {
  $.each(ds.data, function(i, d) {
    var formName = d.name;
    var formData = d.data;
    $.each(formData, function(inputName, inputValue) {
      var name = formName + '-' + inputName;
      var val = JSON.stringify(inputValue);
      $('#aws-submit').append('<input type="hidden" name="' + name + '" value=\'' + val + '\'/>');
    });
  });
  $('#aws-submit').append('<input type="hidden" name="workerId" value="' + turkId + '"/>');
  $('#aws-submit').append('<input type="hidden" name="assignmentId" value="' + assignmentId + '"/>');
  
  $('#aws-submit').append('<p>Click the button below to submit</p>');
  $('#aws-submit').append('<button type="submit">Submit</button>');
  $('.panel.info .status').remove();
};

module.exports = sendAzn;

},{"./view_models/data_store":22,"jquery":"f0T/ef"}],6:[function(require,module,exports){

'use strict';

var d3 = require('d3');

function AngleLine() {
  var margin = {top: 5, right: 5, bottom: 5, left: 5},
      width = 100,
      height = 100,
      x = function(d) {return d[0];},
      y = function(d) {return d[1];},
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xRange = function(data) {return [0, 1];},
      yRange = function(data) {return [0, 1];},
      xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
      yAxis = d3.svg.axis().scale(yScale).orient('left'),
      xLabel = '',
      yLabel = '',
      lineLength = 1;

  function chart(selection) {
    // selection may be more than one thing
    selection.each(function(data) {
      // need to convert data to a cannonical represetation...
      data = data.map(function(d, i) {
        return [x.call(data, d, i), y.call(data, d, i)];
      });

      // update scales
      xScale.range([0, width - margin.left - margin.right])
            .domain(xRange(data));
      yScale.domain(yRange(data))
            .range([height - margin.top - margin.bottom, 0]);

      // Update the axes
      xAxis.tickValues(xRange(data));
      yAxis.tickValues(yRange(data));

      // Create the svg and bind all data to it
      var svg = d3.select(this).selectAll('svg').data([data]);

      // new charts need to be created
      var newChartArea = svg.enter().append('svg').append('g');
      newChartArea.append('g').attr('class', 'x axis');
      newChartArea.append('g').attr('class', 'y axis');
      newChartArea.append('g').attr('class', 'x label');
      newChartArea.append('g').attr('class', 'y label');

      // update the outside dimensions
      svg.attr('width', width)
         .attr('height', height)
         .attr('class', 'chart');

      var chartContent = svg.select('g');

      // update the inner dimensions
      chartContent.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // The center of the chart is important
      /*
      var cx = (xScale.domain()[1] - xScale.domain()[0]) / 2;
      var cy = (yScale.domain()[1] - yScale.domain()[0]) / 2;

      // Place the circle guage
      var guage = chartContent.selectAll('.circle.guage')
                              .data(data);

      // update the guage border
      guage.enter().append('circle')
                   .attr('class', 'guage')
                   .attr('stroke', 'gray')
                   .attr('fill', 'none')
                   .attr('stroke-width', 1);
      guage.attr('cx', xScale(cx))
           .attr('cy', yScale(cy))
           .attr('r', xScale(lineLength/2));
           */

      // create the angle indicator
      var radiusIndicator = d3.svg.arc()
        .innerRadius(40)
        .outerRadius(40)
        .startAngle(Math.PI/2)
        .endAngle(function(d) {
          if(d[0] === 0) {
            return 0;
          } else {
            var theta = Math.atan(d[1]/d[0]);
            return Math.PI/2 - theta;
          }
        });

      var angleArc = chartContent.selectAll('path.arc').data(data);

      angleArc.enter().append('path')
                      .attr('class', 'arc')
                      .attr('fill', 'none')
                      .attr('stroke', 'gray')
                      .attr('stroke-width', 1)
                      .attr('transform', 'translate(0,' + yScale(0) + ')');

      angleArc.attr('d', radiusIndicator);

      // Update the line
      var line = chartContent.selectAll('.line.angle')
                             .data(data);

      // Create new line
      line.enter().append('line')
                  .attr('class', 'line angle')
                  .attr('stroke', 'black')
                  .attr('stroke-width', '2');

      /*
      var newShadows = chartContent.selectAll('.line.shadow')
                                   .data(data).enter();
      newShadows.append('line')
                .attr('class', 'line shadow x')
                .attr('stroke', 'black')
                .attr('stroke-width', '2');
      newShadows.append('line')
                .attr('class', 'line shadow y')
                .attr('stroke', 'black')
                .attr('stroke-width', '2');
                */

      // needed for the line below
      function dx(d) {
        if(d[0] === 0) {
          return 0;
        } else {
          var s = d[1] / d[0];
          return lineLength / (2*Math.sqrt(s*s + 1));
        }
      }
      function dy(d) {
        if(d[0] === 0) {
          return lineLength / 2;
        } else {
          var s = d[1] / d[0];
          return (lineLength * s) / (2*Math.sqrt(s*s + 1));
        }
      }
      // Update the line
      line.attr('x1', function(d) {return xScale(0);})
          .attr('x2', function(d) {return xScale(2*dx(d));})
          .attr('y1', function(d) {return yScale(0);})
          .attr('y2', function(d) {return yScale(2*dy(d));});
      /*
      line.attr('x1', function(d) {return xScale(cx - dx(d));})
          .attr('x2', function(d) {return xScale(cx + dx(d));})
          .attr('y1', function(d) {return yScale(cy - dy(d));})
          .attr('y2', function(d) {return yScale(cy + dy(d));});
          *.
          /*
      chartContent.selectAll('.line.shadow.x').data(data)
                  .attr('x1', function(d) {return xScale(cx - dx(d));})
                  .attr('x2', function(d) {return xScale(cx + dx(d));})
                  .attr('y1', function(d) {return yScale(0);})
                  .attr('y2', function(d) {return yScale(0);});
      chartContent.selectAll('.line.shadow.y').data(data)
                  .attr('x1', function(d) {return xScale(0);})
                  .attr('x2', function(d) {return xScale(0);})
                  .attr('y1', function(d) {return yScale(cy - dy(d));})
                  .attr('y2', function(d) {return yScale(cy + dy(d));});
                  */

      // Add the axis labels (maybe)
      if(xLabel) {
        var g = chartContent.select('.x.label');
        g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + height + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-1em')
                        .text(xLabel);
      }
      if(yLabel) {
        var g = chartContent.select('.y.label');
        g.attr('transform', 'translate(0' + ',' +(height-margin.top-margin.bottom)/2 +  ') rotate(-90)');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-3em')
                        .text(yLabel);
      }
      // Update the axes
      chartContent.select('.x.axis')
                  .attr('transform', 'translate(0,' + yScale.range()[0] + ')')
                  .call(xAxis);
      chartContent.select('.y.axis')
                  .call(yAxis);
    });
  }

  chart.margin = function(m) {
    if(!arguments.length) {
      return margin;
    }
    margin = m;
    return chart;
  };

  chart.width = function(w) {
    if(!arguments.length) {
      return width;
    }
    width = w;
    return chart;
  };

  chart.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    height = h;
    return chart;
  };

  chart.x = function(valFunc) {
    if(!arguments.length) {
      return x;
    }
    x = valFunc;
    return chart;
  };

  chart.y = function(valFunc) {
    if(!arguments.length) {
      return y;
    }
    y = valFunc;
    return chart;
  };

  chart.xRange = function(rng) {
    if(!arguments.length) {
      return xRange;
    }
    if(rng instanceof Array) {
      xRange = function(data) {return rng;};
    } else {
      xRange = rng;
    }
    return chart;
  };

  chart.yRange = function(rng) {
    if(!arguments.length) {
      return yRange;
    }
    if(rng instanceof Array) {
      yRange = function(data) {return rng;};
    } else {
      yRange = rng;
    }
    return chart;
  };

  chart.xLabel = function(l) {
    if(!arguments.length) {
      return xLabel;
    }
    xLabel = l;
    return chart;
  };

  chart.yLabel = function(l) {
    if(!arguments.length) {
      return yLabel;
    }
    yLabel = l;
    return chart;
  };

  chart.lineLength = function(len) {
    if(!arguments.length) {
      return lineLength;
    }
    lineLength = len;
    return chart;
  };

  return chart;
}

module.exports = AngleLine;

},{"d3":"9mKXAG"}],7:[function(require,module,exports){

'use strict';

var d3 = require('d3');

function BarChart() {
  var margin = {top: 40, right: 40, bottom: 40, left: 40},
      width = 400,
      height = 400,
      x = function(d) {return d[0];},
      y = function(d) {return d[1];},
      xScale = d3.scale.linear(),
      yScale = d3.scale.ordinal(),
      xRange = function(data) {return [0, d3.max(data, function(d) {return d[0];})];},
      yRange = function(data) {return data.map(function(d) {return d[1];});},
      xAxis = d3.svg.axis().orient('bottom'),
      yAxis = d3.svg.axis().orient('left'),
      xLabel = '',
      yLabel = '';

  function chart(selection) {
    // selection may be more than one thing
    selection.each(function(data) {
      // need to convert data to a cannonical represetation...
      data = data.map(function(d, i) {
        return [x.call(data, d, i), y.call(data, d, i)];
      });
      // update scales
      xScale.domain(xRange(data))
            .range([0, width-margin.left-margin.right]);
      yScale.domain(yRange(data))
            .rangeRoundBands([height - margin.top - margin.bottom, 0], 0.05);
      if(xAxis) {
        xAxis.scale(xScale);
      }
      if(yAxis) {
        yAxis.scale(yScale);
      }

      // Create the svg and bind all data to it
      var svg = d3.select(this).selectAll('svg').data([data]);
      
      // new charts need to be created
      var newChartArea = svg.enter().append('svg').append('g');
      newChartArea.append('g').attr('class', 'x axis');
      newChartArea.append('g').attr('class', 'y axis');
      newChartArea.append('g').attr('class', 'x label');
      newChartArea.append('g').attr('class', 'y label');

      // update the outside dimensions
      svg.attr('width', width)
         .attr('height', height)
         .attr('class', 'chart');

      var chartContent = svg.select('g');

      // update the inner dimensions
      chartContent.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Update the bars
      var bars = chartContent.selectAll('.bar')
                             .data(data);
      // Remove unused bars
      bars.exit().remove();

      // Create new bars
      bars.enter().append('rect')
                  .attr('class', 'bar');

      // Update the bars
      bars.attr('x', function(d) {return xScale.range()[0];})
          .attr('y', function(d) {return yScale(d[1]);})
          .attr('height', yScale.rangeBand())
          .attr('width', function(d) {return xScale(d[0]);});

      // Add the axis labels (maybe)
      if(xLabel) {
        var g = chartContent.select('.x.label');
        g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + height + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-1em')
                        .text(xLabel);
      }
      if(yLabel) {
        var g = chartContent.select('.y.label');
        //g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + height + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-1em')
                        .text(yLabel);
      }
      // Update the axes
      if(xAxis) {
        chartContent.select('.x.axis')
                    .attr('transform', 'translate(0,' + (height-margin.bottom-margin.top) + ')')
                    .call(xAxis);
      }
      //chartContent.select('.y.axis')
                  //.call(yAxis);
    });
  }

  chart.margin = function(m) {
    if(!arguments.length) {
      return margin;
    }
    margin = m;
    return chart;
  };

  chart.width = function(w) {
    if(!arguments.length) {
      return width;
    }
    width = w;
    return chart;
  };

  chart.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    height = h;
    return chart;
  };

  chart.x = function(valFunc) {
    if(!arguments.length) {
      return x;
    }
    x = valFunc;
    return chart;
  };

  chart.y = function(valFunc) {
    if(!arguments.length) {
      return y;
    }
    y = valFunc;
    return chart;
  };

  chart.xAxis = function(axis) {
    if(!arguments.length) {
      return xAxis;
    }
    xAxis = axis;
    return chart;
  };

  chart.yAxis = function(axis) {
    if(!arguments.length) {
      return yAxis;
    }
    yAxis = axis;
    return chart;
  };

  chart.xRange = function(rng) {
    if(!arguments.length) {
      return xRange;
    }
    if(rng instanceof Array) {
      xRange = function(data) {return rng;};
    } else {
      xRange = rng;
    }
    return chart;
  };

  chart.yRange = function(rng) {
    if(!arguments.length) {
      return yRange;
    }
    if(rng instanceof Array) {
      yRange = function(data) {return rng;};
    } else {
      yRange = rng;
    }
    return chart;
  };

  chart.xLabel = function(l) {
    if(!arguments.length) {
      return xLabel;
    }
    xLabel = l;
    return chart;
  };

  chart.yLabel = function(l) {
    if(!arguments.length) {
      return yLabel;
    }
    yLabel = l;
    return chart;
  };

  return chart;
}

module.exports = BarChart;

},{"d3":"9mKXAG"}],8:[function(require,module,exports){

'use strict';

var d3 = require('d3');
var lineAngle = require('./util').lineAngle;

function Scatterplot() {
  var margin = {top: 40, right: 40, bottom: 40, left: 40},
      width = 400,
      height = 400,
      x = function(d) {return d[0];},
      y = function(d) {return d[1];},
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xRange = function(data) {return [0, d3.max(data, function(d) {return d[0];})];},
      yRange = function(data) {return [0, d3.max(data, function(d) {return d[1];})];},
      xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
      yAxis = d3.svg.axis().scale(yScale).orient('left'),
      xLabel = '',
      yLabel = '',
      radius = function(d) {return 6;},
      onClick = function(d, i) {},
      lineLength = 0.2; // in data size...

  function chart(selection) {
    // selection may be more than one thing
    selection.each(function(data) {
      // Pull out the gradients before we throw them away below
      // moving dot is the last item in the array
      var gradients = [data[data.length-1]].map(function(d) {
        // convert to slopes as well
        return d.gradient.map(function(g) {
          return {
            cx: d.expRisk,
            cy: d.expReturn,
            slope: g.expRisk===0 ? g.expReturn / 1e-9 : g.expReturn / g.expRisk,
            isSelected: g.isSelected() // hack here
          };
        });
      }).reduce(function(a,b) {return a.concat(b);});
      // need to convert data to a cannonical represetation...
      data = data.map(function(d, i) {
        var ret = [x.call(data, d, i), y.call(data, d, i)];
        ret.allocs = d.allocs;
        return ret;
      });

      // update scales
      xScale.range([0, width - margin.left - margin.right])
            .domain(xRange(data));
      yScale.domain(yRange(data))
            .range([height - margin.top - margin.bottom, 0]);

      // Create the svg and bind all data to it
      var svg = d3.select(this).selectAll('svg').data([data]);

      // new charts need to be created
      var newChartArea = svg.enter().append('svg').append('g');
      newChartArea.append('g').attr('class', 'x axis');
      newChartArea.append('g').attr('class', 'y axis');
      newChartArea.append('g').attr('class', 'x label');
      newChartArea.append('g').attr('class', 'y label');

      // update the outside dimensions
      svg.attr('width', width)
         .attr('height', height)
         .attr('class', 'chart');

      var chartContent = svg.select('g');

      // update the inner dimensions
      chartContent.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Update the points
      var points = chartContent.selectAll('.dot')
                               .data(data);
      // Remove unused points
      points.exit().remove();

      // Create new points
      points.enter().append('circle')
                    .attr('class', 'dot');

      // Update the points
      points.attr('cx', function(d) {return xScale(d[0]);})
            .attr('cy', function(d) {return yScale(d[1]);})
            .attr('r', function(d) {return radius(d);})
            .attr('id', function(d, i) {
              if(i==data.length-1) return 'risk-return';
              else                 return 'saved-port-' + i;
            })
            .on('click', onClick);

      // Update the gradient lines
      var gradLines = chartContent.selectAll('.gradient')
                                  .data(gradients);

      // Remove unused lines
      gradLines.exit().remove();

      // Create new gradient lines
      gradLines.enter().append('line');
                       //.attr('class', 'gradient');

      // Update the line positions
      gradLines.attr('x1', function(d) {return xScale(lineAngle(d.cx, d.cy, d.slope, lineLength/1.5).x1);})
               .attr('y1', function(d) {return yScale(lineAngle(d.cx, d.cy, d.slope, lineLength/1.5).y1);})
               .attr('x2', function(d) {return xScale(lineAngle(d.cx, d.cy, d.slope, lineLength).x2);})
               .attr('y2', function(d) {return yScale(lineAngle(d.cx, d.cy, d.slope, lineLength).y2);})
               .attr('class', function(d, i) {return 'gradient colorbrewer qualitative-'+(i+1);})
               .attr('stroke-width', 1.5);
               //.attr('stroke', function(d, i) {return cb['Dark2'][5][i];})
               //.attr('stroke-width', function(d) {return d.isSelected ? 4 : 2;});

      // Add the axis labels (maybe)
      if(xLabel) {
        var g = chartContent.select('.x.label');
        g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + (height-margin.bottom) + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .text(xLabel);
      }
      if(yLabel) {
        var g = chartContent.select('.y.label');
        g.attr('transform', 'translate(0,' +(height-margin.top-margin.bottom)/2 + ') rotate(-90)');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-3em')
                        .text(yLabel);
      }
      // Update the axes
      chartContent.select('.x.axis')
                  .attr('transform', 'translate(0,' + yScale.range()[0] + ')')
                  .call(xAxis);
      chartContent.select('.y.axis')
                  .call(yAxis);
    });
  }

  chart.margin = function(m) {
    if(!arguments.length) {
      return margin;
    }
    margin = m;
    return chart;
  };

  chart.width = function(w) {
    if(!arguments.length) {
      return width;
    }
    width = w;
    return chart;
  };

  chart.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    height = h;
    return chart;
  };

  chart.x = function(valFunc) {
    if(!arguments.length) {
      return x;
    }
    x = valFunc;
    return chart;
  };

  chart.y = function(valFunc) {
    if(!arguments.length) {
      return y;
    }
    y = valFunc;
    return chart;
  };

  chart.xAxis = function(axis) {
    if(!arguments.length) {
      return xAxis;
    }
    xAxis = axis;
    return chart;
  };

  chart.yAxis = function(axis) {
    if(!arguments.length) {
      return yAxis;
    }
    yAxis = axis;
    return chart;
  };

  chart.xRange = function(rng) {
    if(!arguments.length) {
      return xRange;
    }
    if(rng instanceof Array) {
      xRange = function(data) {return rng;};
    } else {
      xRange = rng;
    }
    return chart;
  };

  chart.yRange = function(rng) {
    if(!arguments.length) {
      return yRange;
    }
    if(rng instanceof Array) {
      yRange = function(data) {return rng;};
    } else {
      yRange = rng;
    }
    return chart;
  };

  chart.xLabel = function(l) {
    if(!arguments.length) {
      return xLabel;
    }
    xLabel = l;
    return chart;
  };

  chart.yLabel = function(l) {
    if(!arguments.length) {
      return yLabel;
    }
    yLabel = l;
    return chart;
  };

  chart.radius = function(r) {
    if(!arguments.length) {
      return r;
    }
    if(r instanceof Function) {
      radius = r;
    } else {
      radius = function(d) {return r;};
    }

    return chart;
  };

  chart.lineLength = function(len) {
    if(!arguments.length) {
      return lineLength;
    }
    lineLength = len;
    return chart;
  };

  chart.onClick = function(f) {
    if(!arguments.length) {
      return onClick;
    }
    onClick = f;
    return chart;
  };

  return chart;
}

module.exports = Scatterplot;

},{"./util":12,"d3":"9mKXAG"}],9:[function(require,module,exports){

'use strict';

var d3 = require('d3');

function Scatterplot() {
  var margin = {top: 40, right: 40, bottom: 40, left: 40},
      width = 400,
      height = 400,
      x = function(d) {return d[0];},
      y = function(d) {return d[1];},
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xRange = function(data) {return [0, d3.max(data, function(d) {return d[0];})];},
      yRange = function(data) {return [0, d3.max(data, function(d) {return d[1];})];},
      xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
      yAxis = d3.svg.axis().scale(yScale).orient('left'),
      xLabel = '',
      yLabel = '',
      radius = function(d) {return 6;},
      onClick = function(d, i) {};

  function chart(selection) {
    // console.log("2", selection);
    // selection may be more than one thing
    selection.each(function(data) {
      // need to convert data to a cannonical represetation...
      data = data.map(function(d, i) {
        var ret = [x.call(data, d, i), y.call(data, d, i)];
        ret.allocs = d.allocs;
        return ret;
      });
      // update scales
      xScale.range([0, width - margin.left - margin.right])
            .domain(xRange(data));
      yScale.domain(yRange(data))
            .range([height - margin.top - margin.bottom, 0]);

      // Create the svg and bind all data to it
      var svg = d3.select(this).selectAll('svg').data([data]);

      // new charts need to be created
      var newChartArea = svg.enter().append('svg').append('g');
      newChartArea.append('g').attr('class', 'x axis');
      newChartArea.append('g').attr('class', 'y axis');
      newChartArea.append('g').attr('class', 'x label');
      newChartArea.append('g').attr('class', 'y label');

      // update the outside dimensions
      svg.attr('width', width)
         .attr('height', height)
         .attr('class', 'chart');

      var chartContent = svg.select('g');

      // update the inner dimensions
      chartContent.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Update the points
      var points = chartContent.selectAll('.dot')
                               .data(data);
      // Remove unused bars
      points.exit().remove();

      // Create new bars
      points.enter().append('circle')
                    .attr('class', 'dot');

      // Update the bars
      points.attr('cx', function(d) {return xScale(d[0]);})
            .attr('cy', function(d) {return yScale(d[1]);})
            .attr('r', function(d) {return radius(d);})
            .attr('id', function(d, i) {
              if(i==data.length-1) return 'risk-return';
              else                 return 'saved-port-' + i;
            })
            .on('click', onClick);

      // Add the axis labels (maybe)
      if(xLabel) {
        var g = chartContent.select('.x.label');
        g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + (height-margin.bottom) + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .text(xLabel);
      }
      if(yLabel) {
        var g = chartContent.select('.y.label');
        g.attr('transform', 'translate(0,' +(height-margin.top-margin.bottom)/2 + ') rotate(-90)');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-4em')
                        .text(yLabel);
      }
      // Update the axes
      chartContent.select('.x.axis')
                  .attr('transform', 'translate(0,' + yScale.range()[0] + ')')
                  .call(xAxis);
      chartContent.select('.y.axis')
                  .call(yAxis);
    });
  }

  chart.margin = function(m) {
    if(!arguments.length) {
      return margin;
    }
    margin = m;
    return chart;
  };

  chart.width = function(w) {
    if(!arguments.length) {
      return width;
    }
    width = w;
    return chart;
  };

  chart.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    height = h;
    return chart;
  };

  chart.x = function(valFunc) {
    if(!arguments.length) {
      return x;
    }
    x = valFunc;
    return chart;
  };

  chart.y = function(valFunc) {
    if(!arguments.length) {
      return y;
    }
    y = valFunc;
    return chart;
  };

  chart.xRange = function(rng) {
    if(!arguments.length) {
      return xRange;
    }
    if(rng instanceof Array) {
      xRange = function(data) {return rng;};
    } else {
      xRange = rng;
    }
    return chart;
  };

  chart.yRange = function(rng) {
    if(!arguments.length) {
      return yRange;
    }
    if(rng instanceof Array) {
      yRange = function(data) {return rng;};
    } else {
      yRange = rng;
    }
    return chart;
  };

  chart.xLabel = function(l) {
    if(!arguments.length) {
      return xLabel;
    }
    xLabel = l;
    return chart;
  };

  chart.yLabel = function(l) {
    if(!arguments.length) {
      return yLabel;
    }
    yLabel = l;
    return chart;
  };

  chart.radius = function(r) {
    if(!arguments.length) {
      return r;
    }
    if(r instanceof Function) {
      radius = r;
    } else {
      radius = function(d) {return r;};
    }

    return chart;
  };

  chart.onClick = function(f) {
    if(!arguments.length) {
      return onClick;
    }
    onClick = f;
    return chart;
  };

  return chart;
}

module.exports = Scatterplot;

},{"d3":"9mKXAG"}],10:[function(require,module,exports){

'use strict';

var d3 = require('d3'),
    numeric = require('numeric');

function SparklineSlider() {
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 300,
      height = 100,
      plotFunction = function(x) {return x;},
      x = function(d) {return d.pos;},
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xRange = function(data) {return [0, 1];},
      yRange = function(data) {return [0, 3];},
      xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
      yAxis = d3.svg.axis().scale(yScale).orient('left'),
      xLabel = '',
      yLabel = '',
      onDrag = function() {};

  function chart(selection) {
    // console.log("Sparkline", selection);
    // selection may be more than one thing
    selection.each(function(data) {
      // need to convert data to a cannonical represetation...
      plotFunction = data.f;
      data = data.pos;

      // update scales
      xScale.range([0, width - margin.left - margin.right])
            .domain(xRange(data));
      yScale.domain(yRange(data))
            .range([height - margin.top - margin.bottom, 0]);

      // Create the svg and bind all data to it
      var svg = d3.select(this).selectAll('svg').data([data]);

      // new charts need to be created
      var newChartArea = svg.enter().append('svg').append('g');
      newChartArea.append('g').attr('class', 'x axis');
      newChartArea.append('g').attr('class', 'y axis');
      newChartArea.append('g').attr('class', 'x label');
      newChartArea.append('g').attr('class', 'y label');

      // update the outside dimensions
      svg.attr('width', width)
         .attr('height', height)
         .attr('class', 'chart control');

      var chartContent = svg.select('g');

      // update the inner dimensions
      chartContent.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Draw the line
      var numPts = 15;
      var xBounds = xRange(data),
          xVals = numeric.linspace(xBounds[0], xBounds[1], numPts);
      var plotData = xVals.map(function(x) {
        return {x: x, y: plotFunction(x)};
      });

      var line = d3.svg.line().interpolate('basis')
                   .x(function(d) {return xScale(d.x);})
                   .y(function(d) {return yScale(d.y);});
      chartContent.selectAll('path.line').data([plotData])
                  .enter().append('path')
                          .attr('class', 'line')
                          .attr('stroke', 'black')
                          .attr('fill', 'transparent')
                          .attr('d', line(plotData));

      // draw the slider widget
      var dragBehavior =  d3.behavior.drag()
        .on('drag', onDrag)
        .on('dragstart', function() {
          d3.select(d3.event.sourceEvent.target).classed('dragging', true);
        })
        .on('dragend', function() {
          //d3.select(d3.event.sourceEvent.target).classed('dragging', false);
          var handle = chartContent.selectAll('.handle');
          handle.classed('dragging', false);
        });
      var handleWidth = 11;
      var handle = chartContent.selectAll('.handle').data([data]);
      handle.enter().append('circle')
                    .attr('class', 'handle')
                    .attr('r', handleWidth/2)
                    //.attr('y', 0)
                    //attr('width', handleWidth)
                    //.attr('height', yScale(yRange()[0]))
                    .call(dragBehavior);
      handle.attr('cx', function(d) {return xScale(d);})
            .attr('cy', function(d) {return yScale(plotFunction(d));});

      // Add the axis labels (maybe)
      /*
      if(xLabel) {
        var g = chartContent.select('.x.label');
        g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + height + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-1em')
                        .text(xLabel);
      }
      if(yLabel) {
        var g = chartContent.select('.y.label');
        //g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + height + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-1em')
                        .text(yLabel);
      }

      */
      // Update the axes
      /*
      chartContent.select('.x.axis')
                  .attr('transform', 'translate(0,' + yScale.range()[0] + ')')
                  .call(xAxis);
      chartContent.select('.y.axis')
                  .call(yAxis);
      */
    });
  }

  chart.margin = function(m) {
    if(!arguments.length) {
      return margin;
    }
    margin = m;
    return chart;
  };

  chart.width = function(w) {
    if(!arguments.length) {
      return width;
    }
    width = w;
    return chart;
  };

  chart.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    height = h;
    return chart;
  };

  chart.x = function(valFunc) {
    if(!arguments.length) {
      return x;
    }
    x = valFunc;
    return chart;
  };

  chart.xScale = function() {
    return xScale;
  };

  chart.xAxis = function(axis) {
    if(!arguments.length) {
      return xAxis;
    }
    xAxis = axis;
    return chart;
  };

  chart.yAxis = function(axis) {
    if(!arguments.length) {
      return yAxis;
    }
    yAxis = axis;
    return chart;
  };

  chart.xRange = function(rng) {
    if(!arguments.length) {
      return xRange;
    }
    if(rng instanceof Array) {
      xRange = function(data) {return rng;};
    } else {
      xRange = rng;
    }
    return chart;
  };

  chart.yRange = function(rng) {
    if(!arguments.length) {
      return yRange;
    }
    if(rng instanceof Array) {
      yRange = function(data) {return rng;};
    } else {
      yRange = rng;
    }
    return chart;
  };

  chart.xLabel = function(l) {
    if(!arguments.length) {
      return xLabel;
    }
    xLabel = l;
    return chart;
  };

  chart.yLabel = function(l) {
    if(!arguments.length) {
      return yLabel;
    }
    yLabel = l;
    return chart;
  };

  chart.plotFunction = function(f) {
    if(!arguments.length) {
      return plotFunction;
    }
    plotFunction = f;
    return chart;
  };

  chart.onDrag = function(f) {
    if(!arguments.length) {
      return onDrag;
    }
    onDrag = f;
    return chart;
  };

  return chart;
}

module.exports = SparklineSlider;

},{"d3":"9mKXAG","numeric":"x47x03"}],11:[function(require,module,exports){

'use strict';

var d3 = require('d3');


/* ####################
 * ##### Slice SA #####
 * ####################*/
function Scatterplot() {
  var margin = {top: 40, right: 40, bottom: 40, left: 40},
      width = 400,
      height = 400,
      x = function(d) {return d[0];},
      y = function(d) {return d[1];},
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xRange = function(data) {return [0, d3.max(data, function(d) {return d[0];})];},
      yRange = function(data) {return [0, d3.max(data, function(d) {return d[1];})];},
      xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
      yAxis = d3.svg.axis().scale(yScale).orient('left'),
      xLabel = '',
      yLabel = '',
      radius = function(d) {return 6;},
      onClick = function(d, i) {};

  function chart(selection) {
   console.log(selection);
    // selection may be more than one thing
    selection.each(function(data) {
      // Pull out the slices before we throw them away below
      var slices = data.slice();
      // need to convert data to a cannonical represetation...
      data = data.portfolio().map(function(d, i) {
        var ret = [x.call(data, d, i), y.call(data, d, i)];
        ret.allocs = d.allocs;
        
        return ret;
      });

      // update scales
      xScale.range([0, width - margin.left - margin.right])
            .domain(xRange(data));
      yScale.domain(yRange(data))
            .range([height - margin.top - margin.bottom, 0]);

      // Create the svg and bind all data to it
      var svg = d3.select(this).selectAll('svg').data([data]);

      // new charts need to be created
      var newChartArea = svg.enter().append('svg').append('g');
      newChartArea.append('g').attr('class', 'x axis');
      newChartArea.append('g').attr('class', 'y axis');
      newChartArea.append('g').attr('class', 'x label');
      newChartArea.append('g').attr('class', 'y label');

      // update the outside dimensions
      svg.attr('width', width)
         .attr('height', height)
         .attr('class', 'chart');

      var chartContent = svg.select('g');

      // update the inner dimensions
      chartContent.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Update the points
      var points = chartContent.selectAll('.dot')
                               .data(data);
      // Remove unused bars
      points.exit().remove();

      // Create new bars
      points.enter().append('circle')
                    .attr('class', 'dot');

      // Update the bars
      points.attr('cx', function(d) {return xScale(d[0]);})
            .attr('cy', function(d) {return yScale(d[1]);})
            .attr('r', function(d) {return radius(d);})
            .attr('id', function(d, i) {
              if(i==data.length-1) return 'risk-return';
              else                 return 'saved-port-' + i;
            })
            .on('click', onClick);

      // Update the slice lines
      var sliceLinef = d3.svg.line()
        .interpolate('basis')
        .x(function(d) {return xScale(d.expRisk);})
        .y(function(d) {return yScale(d.expReturn);});
      var sliceLines = chartContent.selectAll('.slice')
                                   .data(slices);

      // Remove unused lines
      sliceLines.exit().remove();

      // Create new gradient lines
      sliceLines.enter().append('path');

      // Update the line positions
      sliceLines.attr('d', sliceLinef)
                .attr('class', function(d, i) {return 'slice colorbrewer qualitative-'+(i+1);})
                .attr('stroke-width', 1.5);

      // Add the axis labels (maybe)
      if(xLabel) {
        var g = chartContent.select('.x.label');
        g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + (height-margin.bottom) + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .text(xLabel);
      }
      if(yLabel) {
        var g = chartContent.select('.y.label');
        g.attr('transform', 'translate(0,' +(height-margin.top-margin.bottom)/2 + ') rotate(-90)');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-4em')
                        .text(yLabel);
      }
      // Update the axes
      chartContent.select('.x.axis')
                  .attr('transform', 'translate(0,' + yScale.range()[0] + ')')
                  .call(xAxis);
      chartContent.select('.y.axis')
                  .call(yAxis);
    });
  }

  chart.margin = function(m) {
    if(!arguments.length) {
      return margin;
    }
    margin = m;
    return chart;
  };

  chart.width = function(w) {
    if(!arguments.length) {
      return width;
    }
    width = w;
    return chart;
  };

  chart.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    height = h;
    return chart;
  };

  chart.x = function(valFunc) {
    if(!arguments.length) {
      return x;
    }
    x = valFunc;
    return chart;
  };

  chart.y = function(valFunc) {
    if(!arguments.length) {
      return y;
    }
    y = valFunc;
    return chart;
  };

  chart.xRange = function(rng) {
    if(!arguments.length) {
      return xRange;
    }
    if(rng instanceof Array) {
      xRange = function(data) {return rng;};
    } else {
      xRange = rng;
    }
    return chart;
  };

  chart.yRange = function(rng) {
    if(!arguments.length) {
      return yRange;
    }
    if(rng instanceof Array) {
      yRange = function(data) {return rng;};
    } else {
      yRange = rng;
    }
    return chart;
  };

  chart.xLabel = function(l) {
    if(!arguments.length) {
      return xLabel;
    }
    xLabel = l;
    return chart;
  };

  chart.yLabel = function(l) {
    if(!arguments.length) {
      return yLabel;
    }
    yLabel = l;
    return chart;
  };

  chart.radius = function(r) {
    if(!arguments.length) {
      return r;
    }
    if(r instanceof Function) {
      radius = r;
    } else {
      radius = function(d) {return r;};
    }

    return chart;
  };

  chart.onClick = function(f) {
    if(!arguments.length) {
      return onClick;
    }
    onClick = f;
    return chart;
  };

  return chart;
}

module.exports = Scatterplot;

},{"d3":"9mKXAG"}],12:[function(require,module,exports){

'use strict';

module.exports = {
  lineAngle: function(cx, cy, slope, lineLength) {
    var dx = lineLength / (2*Math.sqrt(slope*slope + 1));
    var dy = slope * dx;
    return {
      x1: cx - dx,
      y1: cy - dy,
      x2: cx + dx,
      y2: cy + dy
    };
  }
};

},{}],13:[function(require,module,exports){

'use strict';

var d3 = require('d3');

function XAxis() {
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 400,
      height = 40,
      xScale = d3.scale.linear(),
      xAxis = d3.svg.axis().orient('bottom'),
      xLabel = '';

  function axis(selection) {
    // selection may be more than one thing
    selection.each(function(data) {

      // update scales
      var xRange = data;
      xScale.domain(xRange)
            .range([0, width-margin.left-margin.right]);
      xAxis.scale(xScale);
      // Create the svg and bind all data to it
      var svg = d3.select(this).selectAll('svg').data([data]);

      // update the outside dimensions
      svg.attr('width', width)
         .attr('height', height)
         .attr('class', 'chart');

      // new charts need to be created
      var newChartArea = svg.enter().append('svg').append('g');
      newChartArea.append('g').attr('class', 'x axis');
      if(xLabel) {
        newChartArea.append('g').attr('class', 'x label');
      }

      var chartContent = svg.select('g');

      // update the inner dimensions
      chartContent.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Add the axis labels (maybe)
      if(xLabel) {
        var g = chartContent.select('.x.label');
        g.attr('transform', 'translate(' + (width-margin.left-margin.right)/2 + ',' + height + ')');

        if(!g.select('text')[0][0]) {
          g.append('text');
        }
        g.select('text').attr('text-anchor', 'middle')
                        .attr('dy', '-1em')
                        .text(xLabel);
      }
      // Update the axes
      if(xAxis) {
        chartContent.select('.x.axis')
                    //.attr('transform', 'translate(0,' + (height-margin.bottom-margin.top) + ')')
                    .call(xAxis);
      }

    });

  }

  axis.margin = function(m) {
    if(!arguments.length) {
      return margin;
    }
    margin = m;
    return axis;
  };

  axis.width = function(w) {
    if(!arguments.length) {
      return width;
    }
    width = w;
    return axis;
  };

  axis.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    height = h;
    return axis;
  };

  axis.x = function(valFunc) {
    if(!arguments.length) {
      return x;
    }
    x = valFunc;
    return axis;
  };

  axis.y = function(valFunc) {
    if(!arguments.length) {
      return y;
    }
    y = valFunc;
    return axis;
  };

  axis.xAxis = function(axis) {
    if(!arguments.length) {
      return xAxis;
    }
    xAxis = axis;
    return axis;
  };

  return axis;
};

module.exports = XAxis;

},{"d3":"9mKXAG"}],14:[function(require,module,exports){

'use strict';

var machina = require('machina');
var router = require('./routes');
var $ = require('jquery');
var apiHost = require('../../config').apiHost;
var mouseTracking = require('./instrumentation/mouse');
var config = require('../../config');

$.urlParam = function(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (!results) { return 0; }
	return results[1] || 0;
};

// TODO: handle errors for missing turk id
var start = function() {
  return new machina.Fsm({
    initialize: function() {
      router.init();
    },

    investingStep: 1,
    turkId: null,

    initialState: 'welcome',

    states: {
      'welcome': {
        _onEnter: function() {
          var turkId = $.urlParam('workerId');
          turkId = turkId;
          this.turkId = turkId;
          var assignmentId = $.urlParam('assignmentId');
          assignmentId = assignmentId ? assignmentId : 'ASSIGNMENT_ID_NOT_AVAILABLE';
					this.assignmentId = assignmentId;
          router.turkId(turkId);
					router.assignmentId(assignmentId);
					if(assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
						router.goto('/welcome');
					} else {
            router.goto('/welcome');
				  }
        },
        beginTest: function() {
          this.transition('demographics');
        }
      },
      'demographics': {
        _onEnter: function() {
          router.goto('/demographics');
        },
        formSuccess: function(data) {
				  router.testType(data.interfaceName);
          this.transition('instructions');
        }
      },
      'finLiteracy': {
        _onEnter: function() {
          router.goto('/literacy');
        },
        formSuccess: function() {
          this.transition('needForCognition');
        }
      },
      'needForCognition': {
        _onEnter: function() {
          router.goto('/need_for_cognition');
        },
        formSuccess: function() {
          this.transition('feedback');
        }
      },
			'instructions': {
				_onEnter: function() {
					router.goto('/instructions');
				},
        instructionsRead: function() {
          this.transition('pretest');
        }
			},
			'pretest': {
        _onEnter: function() {
          var url =  '/pretest';
					router.principal(10000);
          router.goto(url);
        },
        formSuccess: function(data) {
          if(data.approved) {
            this.transition('investing');
          } else {
            this.transition('failed');
          }
        }
			},
      'investing': {
        _onEnter: function() {
          if(config.production) {
					  router.testType(config.debugInvTest);
          }
          var url =  '/test/' + this.investingStep;
					if(this.investingStep === 1) {
						router.principal(10000);
					}
          router.goto(url);
        },
				_onExit: function() {
          mouseTracking.stop();
				},
        formSuccess: function(data) {
				  router.principal(data.remainingCash);
					router.returns(data.returns);
          if(this.investingStep === 5 || router.principal() === 0) {
            this.transition('qualification');
          } else {
            this.investingStep += 1;
            var url =  '/test/' + this.investingStep;
            router.goto(url);
          }
        }
      },
			'qualification': {
        _onEnter: function() {
          router.goto('/qualification');
        },
        formSuccess: function() {
          this.transition('confidence');
        }
			},
      'confidence': {
        _onEnter: function() {
          router.goto('/confidence');
        },
        formSuccess: function() {
          this.transition('finLiteracy');
        }
      },
      'feedback': {
        _onEnter: function() {
          router.goto('/feedback');
        },
        formSuccess: function() {
          this.transition('done');
        }
      },
      'done': {
        _onEnter: function() {
          router.goto('/done');
        }
      },
      'failed': {
        _onEnter: function() {
          router.goto('/failed');
        }
      }
    }
  });
};

var init = function() {
  module.exports.fsm = start();
};

module.exports = {
  fsm: null,
  init: init
};

},{"../../config":1,"./instrumentation/mouse":17,"./routes":21,"jquery":"f0T/ef","machina":"RciBh+"}],15:[function(require,module,exports){

'use strict';

window.ParsleyConfig = {
  validators: {
    mustequal: {
      fn: function(value, requirement) {
        var target = parseFloat(requirement),
            value = parseFloat(value);
        target = Math.round(target*100)/100;
        value = Math.round(value*100)/100;
        //var valid = val === target;
        return value === target;
      },
      priority: 32
    }
  },
  messages: {
    mustequal: 'This value must equal %s'
  },
  excluded: 'input[type=button], input[type=submit], input[type=reset]',
  inputs: 'input, textarea, select, input[type=hidden]'
};

var $ = require('jquery');
var parsley = require('parsleyjs');
var timing = require('./instrumentation/timing');
var ds = require('./view_models/data_store');

$.listen('parsley:form:validate', function(form) {
  form.submitEvent.preventDefault();
  if(form.isValid()) {
    // Indicate that we're submitting
    var submitButton = $(form.$element).find('button[type=submit]')
    var oldButtonText = submitButton.text();
    submitButton.attr("disabled", true);
    submitButton.text('Submitting...');

    // Submit the timing data
    if(form.$element.data('timing')) {
      timing.stop();
      var turkId = $('input[name=turk_id]').val();
      var step = $('input[name=step]').val();
      timing.save(turkId, step);
    }

    // Submit the form
    var flow = require('./flow');
    var service = form.$element.attr('action').slice(5);
    //var data = ds.addData(service, form.$element.serialize());
    var formInputs = form.$element.serializeArray();
    var formData = {};
    formInputs.forEach(function(ip, i) {
      formData[ip.name] = ip.value;
    });
    var data = ds.addData(service, formData);
    flow.fsm.handle('formSuccess', data);
  }

});

var initForm = function(turkId, assignmentId, step) {
  $('input[name=turk_id]').val(turkId);
  $('input[name=assignment_id]').val(assignmentId);
  $('input[name=step]').val(step);

  $('form').parsley();
  if($('form').data('timing')) {
    timing.start();
  }
};

module.exports = initForm;

},{"./flow":14,"./instrumentation/timing":18,"./view_models/data_store":22,"jquery":"f0T/ef","parsleyjs":"aY2YVW"}],16:[function(require,module,exports){
'use strict';

var $ = require('jquery');

var initInstructions = function() {
  $('#next').on('click', function() {
    var flow = require('./flow');
    flow.fsm.handle('instructionsRead');
  });
};

module.exports = initInstructions;

},{"./flow":14,"jquery":"f0T/ef"}],17:[function(require,module,exports){

'use strict';

var $ = require('jquery');
require('getpath');
var ds = require('../view_models/data_store');
var numeric = require('numeric');
require('foundation');

// These are used to track for direction changes
var lastMouseMove1, lastMouseMove2;

function decodeEvent(e) {
  if(e.type !== 'mousemove') {
    lastMouseMove1 = null;
    lastMouseMove2 = null;
    return {
      x: e.pageX,
      y: e.pageY,
      event_type: e.type,
      time: e.timeStamp,
      button: e.which,
      target: $(e.target).attr('id') ||
              $(e.target).attr('name') ||
              $(e.target).getPath()
    };
  } else if(e.which) { // only process if the button is down
    if(lastMouseMove1 == null) {
      lastMouseMove1 = e;
    } else if (lastMouseMove2 == null) {
      lastMouseMove2 = e;
    } else {
      // Where the magic happens
      var v1 = [lastMouseMove2.pageX-lastMouseMove1.pageX,
                lastMouseMove2.pageY-lastMouseMove1.pageY];
      var v2 = [e.pageX-lastMouseMove2.pageX,
                e.pageY-lastMouseMove2.pageY];
      lastMouseMove1 = lastMouseMove2;
      lastMouseMove2 = e;
      if(numeric.dot(v1, v2) <= 0) {
        return decodeEvent({
          pageX: e.pageX,
          pageY: e.pageY,
          type: 'mousedirchange',
          timeStamp: e.timeStamp,
          which: e.which,
          target: e.target
        });
      }
    }
  }
}

var trackEvents = ['mousedown', 'mousemove', 'mouseup', 'click', 'dblclick'];

var savedEvents = [];

function saveEvent(e, turkId, step) {
  var de = decodeEvent(e);
  // only save events when the mouse button is down
  if(de != null && de.button) { 
    savedEvents.push(de);
    // only send events when the user is done with the mouse
    if(de.event_type === 'mouseup' || 
       de.event_type === 'click' || 
       de.event_type === 'dblclick') {
      var evtData = {
        turkId: turkId,
        step: step,
        events: savedEvents
      };
      ds.addMouseData(evtData);
      savedEvents = [];
    }
  }
}

function start(turkId, step) {
  trackEvents.forEach(function(te) {
    $(document).on(te, function(e) {
      if(te==='mousemove') {
        Foundation.utils.throttle(saveEvent(e, turkId, step), 250);
      } else {
        saveEvent(e, turkId, step);
      }
    });
  });
}

function stop() {
  trackEvents.forEach(function(te) {
    $(document).off(te);
  });
}

module.exports = {
  start: start,
  stop: stop
};

},{"../view_models/data_store":22,"foundation":"lpvgfM","getpath":4,"jquery":"f0T/ef","numeric":"x47x03"}],18:[function(require,module,exports){

'use strict';

var ds = require('../view_models/data_store');

var startTime = 0;
var endTime = 0;

var start = function() {
  startTime = new Date().getTime();
};

var stop = function() {
  endTime = new Date().getTime();
};

var save = function(turkId, step) {
  var totalTime = endTime - startTime;
  var timingData = {
    turkId: turkId,
    step: step,
    totalTime: totalTime
  };
  ds.addData('timing-' + step, timingData);
};

module.exports = {
  start: start,
  stop: stop,
  save: save
};
},{"../view_models/data_store":22}],19:[function(require,module,exports){
(function (global){
/**
 * scripts/main.js
 *
 * This is the starting point for your application.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

global.Modernizr = require('browsernizr');

var $ = require('jquery');

var flow = require('./flow');

require('foundation');
//require('parsleyjs');

$(document).ready(function() {
  // initialize foundation
  $(document).foundation();

  // start the fsm
  flow.init();
  var fsm = flow.fsm;

  if("development" !== "production") {
    // Add the navigation menu
    for(var state in fsm.states) {
      if(fsm.states.hasOwnProperty(state)) {
        var e = $('<li><a>' + state + '</a></li>');
        e.select('a').on('click', {state: state}, function(e) {
          fsm.transition(e.data.state);
        });
        $('ul.state-nav').append(e);
      }
    }
  }
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./flow":14,"browsernizr":"W6snuU","foundation":"lpvgfM","jquery":"f0T/ef"}],20:[function(require,module,exports){

'use strict';

var $ = require('jquery');
var ko = require('knockout');
var d3 = require('d3');

var initPortfolio = function(turkId, par) {
  var Portfolio = require('./view_models/portfolio');
  var Scatterplot = require('./charts/scatterplot');
  var SensitivitySP = require('./charts/local_sa_scatterplot');
  var SliceSP = require('./charts/slice_sa_scatterplot');
  var BarChart = require('./charts/bar');
  var XAxis = require('./charts/x_Axis');
  var GradientAngle = require('./charts/angle_line');
  var Sparkline = require('./charts/sl');

  var portfolio = new Portfolio(par);
  var gradBar = new BarChart();
  var gradBarXAxis = new XAxis();
  var gradAngle = new GradientAngle();
  var sparkline = new Sparkline();

  // See if we should add local SA to the risk/return view
  var riskReturn = null;
  if($('#portfolio-stats').hasClass('local-sa')) {
    riskReturn = new SensitivitySP();
    riskReturn.lineLength(60);
  } else if($('#portfolio-stats').hasClass('slice-sa')) {
    riskReturn = new SliceSP();
  } else {
    riskReturn = new Scatterplot();
  }

  riskReturn.onClick(function(d, i) {
    if(d.allocs) {
      d.allocs.forEach(function(a, i) {portfolio.stocks[i].allocation(0);});
      d.allocs.forEach(function(a, i) {portfolio.stocks[i].allocation(a);});
    }
  });

  // These params are the same for both charts
  riskReturn.margin({top: 40, bottom: 45, left: 55, right: 40})
            .width(400)
            .height(390)
            .x(function(d) {return d.expRisk;})
            .y(function(d) {return d.expReturn;})
            .xLabel('Risk (5% chance of losing $)')
            .yLabel('Return ($)')
            .xRange([0, 165])
            .yRange([0, 165])
            .radius(8);

  gradBar.margin({top: 0, bottom: 0, left: 10, right: 10})
         .yAxis(gradBar.yAxis().tickSize(3))
         .xRange([0, 200])
         .width(65)
         .height(24);
  gradBarXAxis.margin({top: 0, bottom: 0, left: 10, right: 10})
         .width(65)
         .height(24);

  gradAngle.margin({top: 5, right: 10, bottom: 35, left: 45})
           .width(120)
           .height(105)
           .x(function(d) {return d.expRisk;})
           .y(function(d) {return d.expReturn;})
           .xLabel('Risk')
           .yLabel('Return')
           .lineLength(1);

  sparkline.margin({top: 10, right: 10, bottom: 10, left: 10})
           .height(50)
           .xRange([0, par])
           .xLabel('Investment')
           .xAxis(sparkline.xAxis().tickSize(3).ticks(5))
           .yAxis(sparkline.yAxis().tickSize(3).ticks(3));

  // Use a binding for updating the chart
  ko.bindingHandlers.points = {
    update: function(element, valueAccessor) {
      var data = ko.unwrap(valueAccessor());
      d3.select(element)
        .datum(data)
        .call(riskReturn);
    }
  };

  ko.bindingHandlers.allocSlice = {
    update: function(element, valueAccessor) {
      var data = ko.unwrap(valueAccessor());
      d3.select(element)
        .datum(data)
        .call(riskReturn);
    }
  };

  ko.bindingHandlers.gradBarWidth = {
    update: function(element, valueAccessor) {
      var data = ko.unwrap(valueAccessor());
      var tmp = [data];
      var parents = $(element).parents();
      
      // Add the exp risk and return axes
      gradBarXAxis.xAxis(d3.svg.axis().orient('bottom').tickSize(3).tickValues([0, 100, 200]));
      d3.select('.expreturn-axis')
        .datum([0, 200])
        .call(gradBarXAxis);
      gradBarXAxis.xAxis(d3.svg.axis().orient('bottom').tickSize(3).tickValues([0, 100, 200]));
      d3.select('.exprisk-axis')
        .datum([0, 200])
        .call(gradBarXAxis);

      d3.select(element)
        .datum(tmp)
        .call(gradBar);
    }
  };

  ko.bindingHandlers.gradAngle = {
    update: function(element, valueAccessor) {
      var data = ko.unwrap(valueAccessor());
      d3.select(element)
        .datum([data])
        .call(gradAngle);
    }
  };

  ko.bindingHandlers.sparkline = {
    update: function(element, valueAccessor) {
      if($(element).hasClass('narrow')) {
        sparkline.width(150)
        if($(element).hasClass('return')) {
          sparkline.yRange([130, 160]);
        } else {
          sparkline.yRange([50, 110]);
        }
      } else {
        sparkline.width(300)
                 .yRange([1.2, 2.5]);
      }
      var data = ko.unwrap(valueAccessor());
      sparkline.onDrag(function() {
        var d3 = require('d3');
        var newPos = Math.max(sparkline.xScale().invert(d3.event.x), 0);
        data.pos(newPos);
      });
      d3.select(element)
        .datum({pos: data.pos(), f: data.f})
        .call(sparkline);
    }
  };

  var form = $('#portfolio-selection');
  if(form.length) {
    // remove the old form processing
    ko.cleanNode($('.investment-test')[0]);
    ko.applyBindings(portfolio, $('.investment-test')[0]);
    // This is needed to keep the sliders from sliding
    // when the values go to high
    $('.alloc-slider').each(function(i, s) {
      var a = portfolio.stocks[i].allocation;
      $(s).on('input', function(e) {
        $(s).val(a());
        return true;
      });
    });
  }

  var invResults = $('#investment-results');
  if(invResults.length) {
    // remove the old form processing
    ko.cleanNode(invResults[0]);
    ko.applyBindings(portfolio, invResults[0]);
  }

  var pretest = $('.pretest-questions');
  if(pretest.length) {

    // Enable knockout listeners on the radio buttons
    var PortSelections = require('./view_models/portfolio_selections');
    var sel = new PortSelections(portfolio);
    ko.applyBindings(sel, pretest[0]);

    // Disable all the sliders
    $('.alloc-slider').prop('disabled', true);

    // Remove the save button
    $('button.save-portfolio').remove();

    // reset selection to trigger events
    sel.selection("1");

  }

  return portfolio;
};

module.exports = initPortfolio;

},{"./charts/angle_line":6,"./charts/bar":7,"./charts/local_sa_scatterplot":8,"./charts/scatterplot":9,"./charts/sl":10,"./charts/slice_sa_scatterplot":11,"./charts/x_Axis":13,"./view_models/portfolio":24,"./view_models/portfolio_selections":25,"d3":"9mKXAG","jquery":"f0T/ef","knockout":"/NukmX"}],21:[function(require,module,exports){

'use strict';

var $ = require('jquery');
var Router = require('director').Router;

var initWelcome = require('./welcome');
var initPortfolio = require('./portfolio');
var initForm = require('./form');
var initInstructions = require('./instructions');
var mouseTracking = require('./instrumentation/mouse');
var sendToAzn = require('./azn');

function render(url, cb) {
  // Override the content
  $('#content').load(url, cb);
  //console.log("loaded " + url);
}

var routes = {
  '/welcome': function() {
    render('partials/welcome.html', function() {
      initWelcome();
    });
  },
  '/demographics': function() {
    render('partials/demographics.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/literacy': function() {
    render('partials/nasd.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/need_for_cognition': function() {
    render('partials/need_for_cognition.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/instructions': function() {
    render('partials/instructions.html', function() {
      initInstructions();
    });
  },
  '/pretest': function() {
    render('partials/pretest/no_sa.html', function() {
      initPortfolio(router.turkId, 10000);
      initForm(router.turkId, router.assignmentId);
    });
  },
  
  '/test/:step': function(step) {
    //render('partials/' + router.testType + '.html', function() {
    render('partials/' + 'global_sa_sl_both' + '.html', function() {
    // render('partials/' + 'slice_sa' + '.html', function() {
      var p = initPortfolio(router.turkId, router.principal);
      router.returns.forEach(function(r, i) {
        p.stocks[i].lastInvestment(parseFloat(r.investment));
        p.stocks[i].lastReturn(parseFloat(r.return));
      });
      p.showReturnSummary(router.returns.length>0);
      initForm(router.turkId, router.assignmentId, step);
      console.log("Start Mousetracking")     
      console.log("Step: " + step)
      if(step === 1){
       // mouseTracking.start(router.turkId, step);
      }
      mouseTracking.start(router.turkId, step);
    });
  },
  '/qualification': function() {
    render('partials/qualification.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/confidence': function() {
    render('partials/conf_questionnaire.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/feedback': function() {
    render('partials/feedback.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/done': function() {
    render('partials/done.html', function() {
     sendToAzn(router.turkId, router.assignmentId);
    });
  },
  '/failed': function() {
    render('partials/failed.html');
  },
  '/rejected': function() {
    render('partials/rejected.html');
  },
  '/preview': function() {
    render('partials/preview.html');
  }
};

var router = new Router(routes);
router.returns = [];


module.exports = {
  init: function(r) {
    router.init(r);
  },
  turkId: function(id) {
    if(!arguments.length) {
      return router.turkId;
    }
    router.turkId = id;
  },
  assignmentId: function(id) {
    if(!arguments.length) {
      return router.assignmentId;
    }
    router.assignmentId = id;
  },
  principal: function(p) {
    if(!arguments.length) {
      return router.principal;
    }
    router.principal = Math.round(parseFloat(p));
  },
  returns: function(r) {
    if(!arguments.length) {
      return router.returns;
    }
    router.returns = r;
  },
  testType: function(t) {router.testType = t;},
  goto: function(p) {router.setRoute(p);}
};

},{"./azn":5,"./form":15,"./instructions":16,"./instrumentation/mouse":17,"./portfolio":20,"./welcome":26,"director":"Wlm1rS","jquery":"f0T/ef"}],22:[function(require,module,exports){

'use strict';

var numeric = require('numeric');
var $ = require('jquery');

var form_data = [{name: 'mouseevents', data: {events: []}}];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getInterface() {
  var interfaces = [
    //'no_sa' 
    // 'local_sa_bars', 
    // 'local_sa_text', 
    // 'local_sa_sp', 
    // 'slice_sa', 
    'global_sa_sl_both' 
    // 'global_sa_text_both'
  ];
  return interfaces[getRandomInt(0, interfaces.length)];
}

function boxMuller(mean, sd) {
  var x = 0, y = 0, radius = 0;
  do {
    x = Math.random() * 2  - 1;
    y = Math.random() * 2  - 1;
    radius = x*x + y*y;
  } while(radius==0 || radius > 1)

  var c = Math.sqrt(-2 * Math.log(radius)/radius);

  // only need one of the pair...
  return sd * (x*c) + mean;
}

var stocks = [
    {expReturn: 0.0141, expRisk: 0.0043},
    {expReturn: 0.0142, expRisk: 0.0029},
    {expReturn: 0.0147, expRisk: 0.0047},
    {expReturn: 0.0134, expRisk: 0.0028},
    {expReturn: 0.0164, expRisk: 0.0056}
  ];

function simulatePortfolio(allocs) {
  allocs = allocs.map(function(a) {return parseFloat(a);});
  var startingCash = numeric.sum(allocs);
  var stockReturns = stocks.map(function(s, i) {
    return boxMuller(s.expReturn, s.expRisk);
  });
  var ttlRets = numeric.mul(stockReturns, allocs);
  var retInfo = [];
  for(var i=0; i<ttlRets.length; i++) {
    retInfo.push({investment: allocs[i], return: ttlRets[i]});
  }
  return {
    stockReturns: retInfo,
    startingCash: startingCash,
    remainingCash: numeric.sum(ttlRets) + startingCash
  };
}

function addData(name, data) {
  var ret;
  if(name=='demographics') {
    data.interfaceName = getInterface();
    ret = {success: true, interfaceName: data.interfaceName};
  } else if(name=='feedback') {
    if(data.comments) {
      data.comments = data.comments.replace(/'/g, '');
    }
  } else if(name=='pretest') {
    ret = {success: true, approved: data.pretest=='2'};
  } else if(name=='portfolio') {
    name = name + '-' + data.step;
    var allocs = [data.a1, data.a2, data.a3, data.a4, data.a5];
    var retData = simulatePortfolio(allocs);
    data.stockReturns = retData.stockReturns;
    data.startingCash = retData.startingCash;
    data.remainingCash = retData.remainingCash;
    ret = {
      success: true, 
      remainingCash: retData.remainingCash, 
      returns: retData.stockReturns
    };
  } else {
    ret = {success: true};
  }
  form_data.push({name: name, data: data});
  return ret;
}

function addMouseData(data) {
  // the mouse data is always first
  form_data[0].data.events.push(data);
}

module.exports = {
  data: form_data,
  addData: addData,
  addMouseData: addMouseData
};

},{"jquery":"f0T/ef","numeric":"x47x03"}],23:[function(require,module,exports){

'use strict';

var numeric = require('numeric');

function gradient(allocs, rets, corMtx) {
  var delta = 1e-5;
  var grads = [];
  for(var i=0; i<allocs.length; i++) {
    // central differencing
    var a1 = allocs.slice(0);
    var a2 = allocs.slice(0);
    a1[i] -= delta;
    a2[i] += delta;
    var rsk1 = numeric.dot(a1, numeric.dot(corMtx, a1));
    var ret1 = numeric.dot(a1, rets);
    var rsk2 = numeric.dot(a2, numeric.dot(corMtx, a2));
    var ret2 = numeric.dot(a2, rets);
    grads[i] = {
      expRisk:   (rsk2-rsk1) / (2*delta),
      expReturn: (ret2-ret1) / (2*delta)
    };
  }
  return grads;
}

// generate an array of n random number such that they sum to 1
function randomSum(n) {
  var xx = numeric.random([n]);  // all between 0 and 1
  var factor = 1;
  for(var d=0; d<(n-1); d++) {
    //var oldX = xx[d];
    xx[d] *= factor;
    factor = Math.max(factor - xx[d], 0);
  }
  // The last element is always what's left
  xx[n-1] = factor;
  return xx;
}

function genAllocs(n, i, x) {
  var ret;
  if(x === 1) {
    ret = numeric.rep([n], 0);
    ret[i] = x;
  } else {
    ret = randomSum(n-1);
    ret = numeric.mul(ret, 1-x);
    ret.splice(i, 0, x);
  }
  return ret;
}

function expReturnIntegral(rets, i, par) {
  var iters = 1000;
  return function(x) {
    var ttl = 0;
    for(var j=0; j<iters; j++) {
      var allocs = genAllocs(rets.length, i, x/par);
      ttl += numeric.dot(allocs, rets);
    }
    return par * ttl / iters;
  };
}

function expRiskIntegral(rets, corMtx, i, par) {
  // 1/6 v w y z (2 a^5 v^2+2 a^4 w^2+2 a^3 z^2+2 a^2 y^2+6 a x^2+3 (2 b x y+2 c x z+2 d w x+2 e v x+f y z+g w y+h v y+i w z+j v z+k v w))
  var iters = 1000;
  return function(x) {
    var ttl = 0;
    for(var j=0; j<iters; j++) {
      var allocs = genAllocs(rets.length, i, x/par);
      ttl += numeric.dot(allocs, numeric.dot(corMtx, allocs));
    }
    return par * 1.96 * (ttl / iters);
  };
}

function globalSA(rets, corMtx) {

  var iters = 10000;
  var retSA = new Array(rets.length);
  var riskSA = new Array(rets.length);
  for(var i=0; i<rets.length; i++) {
    retSA[i] = 0;
    riskSA[i] = 0;
  }
  // monte carlo integration
  for(i=0; i<iters; i++) {
    // get random point in space
    var alloc = numeric.random([rets.length]);
    alloc = numeric.div(alloc, numeric.sum(alloc));

    // compute all the gradients here
    var gradients = gradient(alloc, rets, corMtx);

    // accumulate
    for(var j=0; j<rets.length; j++) {
      // These exponential gradients are recommended
      retSA[j]  += Math.pow(gradients[j].expReturn, 2);
      riskSA[j] += Math.pow(gradients[j].expRisk, 2);
    }
  }

  return {
    expRisk:   numeric.sqrt(numeric.div(riskSA, iters)),
    expReturn: numeric.sqrt(numeric.div(retSA, iters))
  };
}

module.exports = {
  gradient: gradient,
  globalSA: globalSA,
  genAllocs: genAllocs,
  expReturnIntegral: expReturnIntegral,
  expRiskIntegral: expRiskIntegral
};

},{"numeric":"x47x03"}],24:[function(require,module,exports){

'use strict';

var ko = require('knockout');
var numeric = require('numeric');
var portMath = require('./math');

ko.extenders.maxCash = function(target, params) {
  var assets = params.assets,
      index = params.index,
      maxAlloc = params.maxAlloc;

  var result = ko.pureComputed({
    read: function() {
      return target();
    },
    write: function(newValue) {
      var ttl = 0;
      for(var i=0; i<assets.length; i++) {
        if(i!==index) {
          ttl += parseFloat(assets[i].allocation());
        }
      }
      var valueToWrite = Math.min(parseFloat(newValue), maxAlloc - ttl),
          current = target();

      if(valueToWrite !== current) {
        target(valueToWrite);
      }
    }
  }).extend({notify: 'always'});

  // kick things off
  result(target());

  return result;
};

ko.extenders.numeric = function(target) {
  var result = ko.computed({
    read: target,
    write: function(newValue) {
      var current = target(),
          valueAsNum = isNaN(newValue) ? NaN : parseFloat(+newValue);

      if(valueAsNum !== current) {
        target(valueAsNum);
      } else if(newValue !== current) {
        target.notifySubscribers(valueAsNum);
      }
    }
  });

  result(target());

  return result;
};

ko.extenders.currency = function(target) {

  target.formatted = ko.computed({
    read: function() {
      return Math.round(100*parseFloat(target())/100);
    },
    write: function(value) {
      // numbers come back as strings from ko
      value = parseFloat(value);
      target(value);
    },
    owner: this
  });

  return target;
};

var stock = function(name, alloc, eret, ersk) {
  return {
    name: ko.observable(name),
    allocation: ko.observable(alloc), // extend these later
    expReturn: ko.observable(eret),
    expRisk: ko.observable(ersk),
    isSelected: ko.observable(false),
    lastInvestment: ko.observable().extend({currency: true}),
    lastReturn: ko.observable().extend({currency: true}),
    setSelected: function() {
      this.isSelected(true);
    },
    unsetSelected: function() {
      this.isSelected(false);
    }
  };
};

var selection = function(stocks, expRisk, expReturn, gradients) {
  return {
    allocs: stocks,
    expRisk: expRisk,
    expReturn: expReturn,
    gradient: gradients
  };
};

var portfolio = function(totalInvestment) {
  var _ttlInvestment = totalInvestment;
  var _corrMtx = ko.observable([
    [0.004261490, 0.001087416, 0.002174691, 0.001185337, 0.003096662],
    [0.001087416, 0.002933865, 0.001476025, 0.001944271, 0.001520384],
    [0.002174691, 0.001476025, 0.004675134, 0.001551799, 0.002466986],
    [0.001185337, 0.001944271, 0.001551799, 0.002757543, 0.001188911],
    [0.003096662, 0.001520384, 0.002466986, 0.001188911, 0.005630227]
  ]);

  //var perStockInv = totalInvestment / 5;
  var perStockInv = 0;
  var _stocks = [
    new stock('A', perStockInv, 0.0141, 0.0043),
    new stock('B', perStockInv, 0.0142, 0.0029),
    new stock('C', perStockInv, 0.0147, 0.0047),
    new stock('D', perStockInv, 0.0134, 0.0028),
    new stock('E', perStockInv, 0.0164, 0.0056)
  ];
  _stocks.forEach(function(s, i) {
    s.allocation = s.allocation.extend({
      maxCash: {assets: _stocks, index: i, maxAlloc: totalInvestment},
      numeric: true,
      currency: true
    });
  });
  var _totalReturn = ko.computed(function() {
    var ttl = 0;
    _stocks.forEach(function(s) {
      ttl += s.lastReturn();
    });
    return ttl;
  }).extend({currency: true});
  function calcExpReturn(allocs) {
    var rets = _stocks.map(function(s) {return s.expReturn();});
    return numeric.dot(allocs, rets);
  }
  function calcExpRisk(allocs) {
    allocs = numeric.div(allocs, _ttlInvestment);
    var rsk = numeric.dot(allocs, numeric.dot(allocs, _corrMtx()));
    return rsk * 1.96 * _ttlInvestment;
    //return numeric.dot(allocs, numeric.dot(allocs, _corrMtx()));
  }
  var _gradient = ko.computed(function() {
    var allocs = _stocks.map(function(s) {return s.allocation();});
    allocs = numeric.div(allocs, _ttlInvestment);
    var rets = _stocks.map(function(s) {return s.expReturn();});
    var grads = portMath.gradient(allocs, rets, _corrMtx());
    grads = grads.map(function(g, i) {
      g.expRisk = g.expRisk * _ttlInvestment;
      g.expReturn = g.expReturn * _ttlInvestment;
      g.ratio = g.expReturn / g.expRisk;
      g.isSelected = _stocks[i].isSelected;
      return g;
    });
    return grads;
  });
  var _slice = ko.computed(function() {
    console.log("Slice");
    var allocs = _stocks.map(function(s) {return s.allocation();});
    var remInvestment = _ttlInvestment - numeric.sum(allocs);
    var slices = [];
    _stocks.forEach(function(s, i) {
      var candAllocs = numeric.linspace(0, allocs[i]+remInvestment, 11);
      slices[i] = candAllocs.map(function(ca) {
        var ta = allocs.slice();
        ta[i] = ca;
        return {expRisk: calcExpRisk(ta), expReturn: calcExpReturn(ta)};
      });
      console.log(slices[i]);
    });
    console.log(slices);
    return slices;
  });
  var _globalSA = function() {
    var rets = _stocks.map(function(s) {return s.expReturn();});
    var sa = portMath.globalSA(rets, _corrMtx());
    // rescale everything
    sa.expRisk = numeric.mul(sa.expRisk, _ttlInvestment * 1.96);
    sa.expReturn = numeric.mul(sa.expReturn, _ttlInvestment);
    // compute the risk/return ratio
    sa.ratio = numeric.div(sa.expReturn, sa.expRisk);
    return sa;
  };
  var _avgBehavior = function() {
    var rets = _stocks.map(function(s) {return s.expReturn();});
    var expReturn = [];
    var expRisk = [];
    var ratio = [];
    for(var i=0; i<rets.length; i++) {
      var ret = portMath.expReturnIntegral(rets, i, _ttlInvestment);
      var rsk = portMath.expRiskIntegral(rets, _corrMtx(), i, _ttlInvestment);
      expReturn[i] = ret;
      expRisk[i] = rsk;
      ratio[i] = function(x) {
        var rt = ret(x);
        var rk = rsk(x);
        if(rk !== 0) {
          return rt / rk;
        } else {
          return 0;
        }
      };
    }
    return {expReturn: expReturn, expRisk: expRisk, ratio: ratio};
  };
  var _expReturn = ko.computed(function() {
    var allocs = _stocks.map(function(s) {return s.allocation();});
    return calcExpReturn(allocs);
  });
  var _expRisk = ko.computed(function() {
    var allocs = _stocks.map(function(s) {return s.allocation();});
    return calcExpRisk(allocs);
  });
  function computeCash() {
    var ttl = _ttlInvestment;
    for(var i=0; i<_stocks.length; i++) {
      ttl -= _stocks[i].allocation();
    }
    return ttl;
  }
  var _cash = ko.computed(function() {
    return computeCash();
  }).extend({currency: true});

  var _selections = ko.observableArray([]);
  var _showReturnSummary = ko.observable(false);
  return {
    stocks: _stocks,
    cash: _cash,
    selections: _selections,
    totalInvestment: _ttlInvestment,
    totalReturn: _totalReturn,
    showReturnSummary: _showReturnSummary,
    saveSelection: function() {
      var sel = new selection(
        _stocks.map(function(s) {return s.allocation();}),
        _expRisk(),
        _expReturn(),
        _gradient()
      );
      _selections.push(sel);
    },
    gradient: _gradient,
    slice: _slice,
    globalSA: _globalSA(),
    avgBehavior: _avgBehavior(),
    expReturn: _expReturn,
    expRisk: _expRisk,
    portfolio: ko.computed(function() {
      var movingDot = { // This needs to look similar to a selection
        expReturn: _expReturn(),
        expRisk: _expRisk(),
        gradient: _gradient()
      };
      // return the current selection plus all the saved dots
      return _selections().concat([movingDot]);
    }),
  };
};

module.exports = portfolio;

},{"./math":23,"knockout":"/NukmX","numeric":"x47x03"}],25:[function(require,module,exports){
'use strict';

var $ = require('jquery');
var ko = require('knockout');

// Ensure these add up to 1!
var selections = {
  '1': [0.27551136, 0.30819302, 0.04269128, 0.00203494, 0.3715694],
  '2': [0.005426591, 0.2482266, 0.15307153, 0.19078152, 0.4024937],
  '3': [0.2649484, 0.1207372, 0.2589315, 0.02679678, 0.3285861],
  '4': [0.337199, 0.01853858, 0.03914859, 0.1723442, 0.4327696]
};
var dotPositions = {
  '1': {x: 100, y: 100},
  '2': {x: 90.676, y: 27.564},
  '3': {x: 130, y: 130},
  '4': {x: 190, y: 40}
};

var portfolioSelection = function(portfolio) {
  var _selection = ko.observable();

  _selection.subscribe(function(sel) {
    var inv = selections[sel];
    var par = portfolio.totalInvestment;
    // Set everything to 0 to avoid the slider limitation event
    for(var i=0; i<portfolio.stocks.length; i++) {
      portfolio.stocks[i].allocation(0);
    }
    for(i=0; i<portfolio.stocks.length; i++) {
      portfolio.stocks[i].allocation(inv[i] * par);
    }
    // also hack the dot position to make the test easier...
    var dotPos = dotPositions[sel];
    $('#risk-return').attr('cx', dotPos.x);
    $('#risk-return').attr('cy', dotPos.y);
  });

  return {
    selection: _selection
  };
};

module.exports = portfolioSelection;

},{"jquery":"f0T/ef","knockout":"/NukmX"}],26:[function(require,module,exports){

'use strict';

var $ = require('jquery');

var initWelcome = function() {
  $('#next').on('click', function() {
    var flow = require('./flow');
    flow.fsm.handle('beginTest');
  });
};

module.exports = initWelcome;

},{"./flow":14,"jquery":"f0T/ef"}]},{},[19])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxFaWdlbmVEYXRlaWVuXFxEZXNrdG9wXFxCQUNDXFxzdHVkeSBmaWxlc1xcc3R1ZHlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvY29uZmlnLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJEOi9FaWdlbmVEYXRlaWVuL0Rlc2t0b3AvQkFDQy9zdHVkeSBmaWxlcy9zdHVkeS9zcmMvYm93ZXJfY29tcG9uZW50cy9qUXVlcnlHZXRQYXRoL2Rpc3QvanMvalF1ZXJ5R2V0UGF0aC5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2F6bi5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2NoYXJ0cy9hbmdsZV9saW5lLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvc3JjL3NjcmlwdHMvY2hhcnRzL2Jhci5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2NoYXJ0cy9sb2NhbF9zYV9zY2F0dGVycGxvdC5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2NoYXJ0cy9zY2F0dGVycGxvdC5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2NoYXJ0cy9zbC5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2NoYXJ0cy9zbGljZV9zYV9zY2F0dGVycGxvdC5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2NoYXJ0cy91dGlsLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvc3JjL3NjcmlwdHMvY2hhcnRzL3hfQXhpcy5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL2Zsb3cuanMiLCJEOi9FaWdlbmVEYXRlaWVuL0Rlc2t0b3AvQkFDQy9zdHVkeSBmaWxlcy9zdHVkeS9zcmMvc2NyaXB0cy9mb3JtLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvc3JjL3NjcmlwdHMvaW5zdHJ1Y3Rpb25zLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvc3JjL3NjcmlwdHMvaW5zdHJ1bWVudGF0aW9uL21vdXNlLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvc3JjL3NjcmlwdHMvaW5zdHJ1bWVudGF0aW9uL3RpbWluZy5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL21haW4uanMiLCJEOi9FaWdlbmVEYXRlaWVuL0Rlc2t0b3AvQkFDQy9zdHVkeSBmaWxlcy9zdHVkeS9zcmMvc2NyaXB0cy9wb3J0Zm9saW8uanMiLCJEOi9FaWdlbmVEYXRlaWVuL0Rlc2t0b3AvQkFDQy9zdHVkeSBmaWxlcy9zdHVkeS9zcmMvc2NyaXB0cy9yb3V0ZXMuanMiLCJEOi9FaWdlbmVEYXRlaWVuL0Rlc2t0b3AvQkFDQy9zdHVkeSBmaWxlcy9zdHVkeS9zcmMvc2NyaXB0cy92aWV3X21vZGVscy9kYXRhX3N0b3JlLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvc3JjL3NjcmlwdHMvdmlld19tb2RlbHMvbWF0aC5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL3ZpZXdfbW9kZWxzL3BvcnRmb2xpby5qcyIsIkQ6L0VpZ2VuZURhdGVpZW4vRGVza3RvcC9CQUNDL3N0dWR5IGZpbGVzL3N0dWR5L3NyYy9zY3JpcHRzL3ZpZXdfbW9kZWxzL3BvcnRmb2xpb19zZWxlY3Rpb25zLmpzIiwiRDovRWlnZW5lRGF0ZWllbi9EZXNrdG9wL0JBQ0Mvc3R1ZHkgZmlsZXMvc3R1ZHkvc3JjL3NjcmlwdHMvd2VsY29tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbnZhciBwcm9kdWN0aW9uID0gKFwiZGV2ZWxvcG1lbnRcIiA9PT0gJ3Byb2R1Y3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJvd2VyOiAnc3JjL2Jvd2VyX2NvbXBvbmVudHMnLFxuICBzcmM6ICdzcmMnLFxuICBwcm9kdWN0aW9uOiBwcm9kdWN0aW9uLFxuICBkZWJ1Z0ludlRlc3Q6ICdzbGljZV9zYScsXG4gIGRpc3Q6IHByb2R1Y3Rpb24gPyAnZGlzdCcgOiAnYnVpbGQnLFxuXHRwb3J0OiA5MDAwLFxuXHRyb290OiBwYXRoLnJlc29sdmUoJy4vJyksXG4gIG9uRXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgfVxufTtcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJaYmk3Z2JcIikpIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIvKiBnbG9iYWxzIGpRdWVyeSAqL1xualF1ZXJ5LmZuLmV4dGVuZCh7XG4gICAgZ2V0UGF0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgdmFyIHBhdGg7XG4gICAgICAgIHZhciBub2RlID0gdGhpcztcbiAgICAgICAgLypJbmNsdWRlIG9ubHkgbmFtZXMgYW5kIElEcyBzaW5jZSB5b3UgY2FuIGFsd2F5cyBwcm9ncmFtbWF0aWNhbGx5IGFkZC9yZW1vdmUgY2xhc3NlcyovXG4gICAgICAgIHZhciB1bmlxdWVUYWdzID0gWyduYW1lJywgJ2lkJ107XG4gICAgICAgIHdoaWxlIChub2RlLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHJlYWxOb2RlID0gbm9kZVswXSxcbiAgICAgICAgICAgICAgICBuYW1lID0gcmVhbE5vZGUubG9jYWxOYW1lO1xuICAgICAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50KCk7XG4gICAgICAgICAgICB2YXIgdW5pcXVlSWRlbnRpZmllckZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gdW5pcXVlVGFncy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIHZhciB0YWcgPSB1bmlxdWVUYWdzW2ldO1xuICAgICAgICAgICAgICAgIHZhciB0YWdWYWx1ZSA9IG5vZGUuYXR0cih0YWcpO1xuICAgICAgICAgICAgICAgIGlmICh0YWdWYWx1ZSAmJiAodGFnVmFsdWUudHJpbSAhPT0gJycpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSAnWycgKyB0YWcgKyAnPVxcXCInICsgdGFnVmFsdWUgKyAnXFxcIl0nO1xuICAgICAgICAgICAgICAgICAgICAvL3dlJ3ZlIGZvdW5kIGEgdW5pcXVlIGlkZW50aWZpZXIgc28gd2UncmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICB1bmlxdWVJZGVudGlmaWVyRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhazsgLy9leGl0IGZvciBsb29wXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF1bmlxdWVJZGVudGlmaWVyRm91bmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2FtZVRhZ1NpYmxpbmdzID0gcGFyZW50LmNoaWxkcmVuKG5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy9BcyBzb29uIGFzIHlvdSBrbm93IHlvdSBoYXZlIHNpYmxpbmcgbm9kZXMsIHVzZSBudGgtb2YtdHlwZSBzbyB5b3UgY2FuIGJldHRlciBmaW5kIGEgdW5pcXVlIG1hdGNoXG4gICAgICAgICAgICAgICAgaWYgKHNhbWVUYWdTaWJsaW5ncy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhbGxTaWJsaW5ncyA9IHBhcmVudC5jaGlsZHJlbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBhbGxTaWJsaW5ncy5pbmRleChyZWFsTm9kZSkgKyAxO1xuICAgICAgICAgICAgICAgICAgICBuYW1lICs9ICc6bnRoLWNoaWxkKCcgKyBpbmRleCArICcpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGF0aCA9IG5hbWUgKyAocGF0aCA/ICc+JyArIHBhdGggOiAnJyk7XG4gICAgICAgICAgICAgICAgbm9kZSA9IHBhcmVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGF0aCA9IG5hbWUgKyAocGF0aCA/ICc+JyArIHBhdGggOiAnJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vZXhpdCB3aGlsZSBsb29wXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgZHMgPSByZXF1aXJlKCcuL3ZpZXdfbW9kZWxzL2RhdGFfc3RvcmUnKTtcblxudmFyIHNlbmRBem4gPSBmdW5jdGlvbih0dXJrSWQsIGFzc2lnbm1lbnRJZCkge1xuICAkLmVhY2goZHMuZGF0YSwgZnVuY3Rpb24oaSwgZCkge1xuICAgIHZhciBmb3JtTmFtZSA9IGQubmFtZTtcbiAgICB2YXIgZm9ybURhdGEgPSBkLmRhdGE7XG4gICAgJC5lYWNoKGZvcm1EYXRhLCBmdW5jdGlvbihpbnB1dE5hbWUsIGlucHV0VmFsdWUpIHtcbiAgICAgIHZhciBuYW1lID0gZm9ybU5hbWUgKyAnLScgKyBpbnB1dE5hbWU7XG4gICAgICB2YXIgdmFsID0gSlNPTi5zdHJpbmdpZnkoaW5wdXRWYWx1ZSk7XG4gICAgICAkKCcjYXdzLXN1Ym1pdCcpLmFwcGVuZCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIG5hbWUgKyAnXCIgdmFsdWU9XFwnJyArIHZhbCArICdcXCcvPicpO1xuICAgIH0pO1xuICB9KTtcbiAgJCgnI2F3cy1zdWJtaXQnKS5hcHBlbmQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIndvcmtlcklkXCIgdmFsdWU9XCInICsgdHVya0lkICsgJ1wiLz4nKTtcbiAgJCgnI2F3cy1zdWJtaXQnKS5hcHBlbmQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImFzc2lnbm1lbnRJZFwiIHZhbHVlPVwiJyArIGFzc2lnbm1lbnRJZCArICdcIi8+Jyk7XG4gIFxuICAkKCcjYXdzLXN1Ym1pdCcpLmFwcGVuZCgnPHA+Q2xpY2sgdGhlIGJ1dHRvbiBiZWxvdyB0byBzdWJtaXQgdG8gYW1hem9uPC9wPicpO1xuICAkKCcjYXdzLXN1Ym1pdCcpLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwic3VibWl0XCI+U3VibWl0PC9idXR0b24+Jyk7XG4gICQoJy5wYW5lbC5pbmZvIC5zdGF0dXMnKS5yZW1vdmUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2VuZEF6bjtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiBBbmdsZUxpbmUoKSB7XG4gIHZhciBtYXJnaW4gPSB7dG9wOiA1LCByaWdodDogNSwgYm90dG9tOiA1LCBsZWZ0OiA1fSxcbiAgICAgIHdpZHRoID0gMTAwLFxuICAgICAgaGVpZ2h0ID0gMTAwLFxuICAgICAgeCA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTt9LFxuICAgICAgeSA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFsxXTt9LFxuICAgICAgeFNjYWxlID0gZDMuc2NhbGUubGluZWFyKCksXG4gICAgICB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKSxcbiAgICAgIHhSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gWzAsIDFdO30sXG4gICAgICB5UmFuZ2UgPSBmdW5jdGlvbihkYXRhKSB7cmV0dXJuIFswLCAxXTt9LFxuICAgICAgeEF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHhTY2FsZSkub3JpZW50KCdib3R0b20nKSxcbiAgICAgIHlBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh5U2NhbGUpLm9yaWVudCgnbGVmdCcpLFxuICAgICAgeExhYmVsID0gJycsXG4gICAgICB5TGFiZWwgPSAnJyxcbiAgICAgIGxpbmVMZW5ndGggPSAxO1xuXG4gIGZ1bmN0aW9uIGNoYXJ0KHNlbGVjdGlvbikge1xuICAgIC8vIHNlbGVjdGlvbiBtYXkgYmUgbW9yZSB0aGFuIG9uZSB0aGluZ1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIC8vIG5lZWQgdG8gY29udmVydCBkYXRhIHRvIGEgY2Fubm9uaWNhbCByZXByZXNldGF0aW9uLi4uXG4gICAgICBkYXRhID0gZGF0YS5tYXAoZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICByZXR1cm4gW3guY2FsbChkYXRhLCBkLCBpKSwgeS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyB1cGRhdGUgc2NhbGVzXG4gICAgICB4U2NhbGUucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKVxuICAgICAgICAgICAgLmRvbWFpbih4UmFuZ2UoZGF0YSkpO1xuICAgICAgeVNjYWxlLmRvbWFpbih5UmFuZ2UoZGF0YSkpXG4gICAgICAgICAgICAucmFuZ2UoW2hlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLCAwXSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYXhlc1xuICAgICAgeEF4aXMudGlja1ZhbHVlcyh4UmFuZ2UoZGF0YSkpO1xuICAgICAgeUF4aXMudGlja1ZhbHVlcyh5UmFuZ2UoZGF0YSkpO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHN2ZyBhbmQgYmluZCBhbGwgZGF0YSB0byBpdFxuICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3N2ZycpLmRhdGEoW2RhdGFdKTtcblxuICAgICAgLy8gbmV3IGNoYXJ0cyBuZWVkIHRvIGJlIGNyZWF0ZWRcbiAgICAgIHZhciBuZXdDaGFydEFyZWEgPSBzdmcuZW50ZXIoKS5hcHBlbmQoJ3N2ZycpLmFwcGVuZCgnZycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggbGFiZWwnKTtcbiAgICAgIG5ld0NoYXJ0QXJlYS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd5IGxhYmVsJyk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgb3V0c2lkZSBkaW1lbnNpb25zXG4gICAgICBzdmcuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gICAgICAgICAuYXR0cignY2xhc3MnLCAnY2hhcnQnKTtcblxuICAgICAgdmFyIGNoYXJ0Q29udGVudCA9IHN2Zy5zZWxlY3QoJ2cnKTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBpbm5lciBkaW1lbnNpb25zXG4gICAgICBjaGFydENvbnRlbnQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbWFyZ2luLmxlZnQgKyAnLCcgKyBtYXJnaW4udG9wICsgJyknKTtcblxuICAgICAgLy8gVGhlIGNlbnRlciBvZiB0aGUgY2hhcnQgaXMgaW1wb3J0YW50XG4gICAgICAvKlxuICAgICAgdmFyIGN4ID0gKHhTY2FsZS5kb21haW4oKVsxXSAtIHhTY2FsZS5kb21haW4oKVswXSkgLyAyO1xuICAgICAgdmFyIGN5ID0gKHlTY2FsZS5kb21haW4oKVsxXSAtIHlTY2FsZS5kb21haW4oKVswXSkgLyAyO1xuXG4gICAgICAvLyBQbGFjZSB0aGUgY2lyY2xlIGd1YWdlXG4gICAgICB2YXIgZ3VhZ2UgPSBjaGFydENvbnRlbnQuc2VsZWN0QWxsKCcuY2lyY2xlLmd1YWdlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIGd1YWdlIGJvcmRlclxuICAgICAgZ3VhZ2UuZW50ZXIoKS5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2d1YWdlJylcbiAgICAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJ2dyYXknKVxuICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ25vbmUnKVxuICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAxKTtcbiAgICAgIGd1YWdlLmF0dHIoJ2N4JywgeFNjYWxlKGN4KSlcbiAgICAgICAgICAgLmF0dHIoJ2N5JywgeVNjYWxlKGN5KSlcbiAgICAgICAgICAgLmF0dHIoJ3InLCB4U2NhbGUobGluZUxlbmd0aC8yKSk7XG4gICAgICAgICAgICovXG5cbiAgICAgIC8vIGNyZWF0ZSB0aGUgYW5nbGUgaW5kaWNhdG9yXG4gICAgICB2YXIgcmFkaXVzSW5kaWNhdG9yID0gZDMuc3ZnLmFyYygpXG4gICAgICAgIC5pbm5lclJhZGl1cyg0MClcbiAgICAgICAgLm91dGVyUmFkaXVzKDQwKVxuICAgICAgICAuc3RhcnRBbmdsZShNYXRoLlBJLzIpXG4gICAgICAgIC5lbmRBbmdsZShmdW5jdGlvbihkKSB7XG4gICAgICAgICAgaWYoZFswXSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0aGV0YSA9IE1hdGguYXRhbihkWzFdL2RbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguUEkvMiAtIHRoZXRhO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIHZhciBhbmdsZUFyYyA9IGNoYXJ0Q29udGVudC5zZWxlY3RBbGwoJ3BhdGguYXJjJykuZGF0YShkYXRhKTtcblxuICAgICAgYW5nbGVBcmMuZW50ZXIoKS5hcHBlbmQoJ3BhdGgnKVxuICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdhcmMnKVxuICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ25vbmUnKVxuICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2UnLCAnZ3JheScpXG4gICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsIDEpXG4gICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwnICsgeVNjYWxlKDApICsgJyknKTtcblxuICAgICAgYW5nbGVBcmMuYXR0cignZCcsIHJhZGl1c0luZGljYXRvcik7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgbGluZVxuICAgICAgdmFyIGxpbmUgPSBjaGFydENvbnRlbnQuc2VsZWN0QWxsKCcubGluZS5hbmdsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuXG4gICAgICAvLyBDcmVhdGUgbmV3IGxpbmVcbiAgICAgIGxpbmUuZW50ZXIoKS5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmUgYW5nbGUnKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpXG4gICAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgJzInKTtcblxuICAgICAgLypcbiAgICAgIHZhciBuZXdTaGFkb3dzID0gY2hhcnRDb250ZW50LnNlbGVjdEFsbCgnLmxpbmUuc2hhZG93JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEoZGF0YSkuZW50ZXIoKTtcbiAgICAgIG5ld1NoYWRvd3MuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGluZSBzaGFkb3cgeCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsICcyJyk7XG4gICAgICBuZXdTaGFkb3dzLmFwcGVuZCgnbGluZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmUgc2hhZG93IHknKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAnMicpO1xuICAgICAgICAgICAgICAgICovXG5cbiAgICAgIC8vIG5lZWRlZCBmb3IgdGhlIGxpbmUgYmVsb3dcbiAgICAgIGZ1bmN0aW9uIGR4KGQpIHtcbiAgICAgICAgaWYoZFswXSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBzID0gZFsxXSAvIGRbMF07XG4gICAgICAgICAgcmV0dXJuIGxpbmVMZW5ndGggLyAoMipNYXRoLnNxcnQocypzICsgMSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBkeShkKSB7XG4gICAgICAgIGlmKGRbMF0gPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gbGluZUxlbmd0aCAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHMgPSBkWzFdIC8gZFswXTtcbiAgICAgICAgICByZXR1cm4gKGxpbmVMZW5ndGggKiBzKSAvICgyKk1hdGguc3FydChzKnMgKyAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSB0aGUgbGluZVxuICAgICAgbGluZS5hdHRyKCd4MScsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKDApO30pXG4gICAgICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24oZCkge3JldHVybiB4U2NhbGUoMipkeChkKSk7fSlcbiAgICAgICAgICAuYXR0cigneTEnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZSgwKTt9KVxuICAgICAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geVNjYWxlKDIqZHkoZCkpO30pO1xuICAgICAgLypcbiAgICAgIGxpbmUuYXR0cigneDEnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShjeCAtIGR4KGQpKTt9KVxuICAgICAgICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKGN4ICsgZHgoZCkpO30pXG4gICAgICAgICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUoY3kgLSBkeShkKSk7fSlcbiAgICAgICAgICAuYXR0cigneTInLCBmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShjeSArIGR5KGQpKTt9KTtcbiAgICAgICAgICAqLlxuICAgICAgICAgIC8qXG4gICAgICBjaGFydENvbnRlbnQuc2VsZWN0QWxsKCcubGluZS5zaGFkb3cueCcpLmRhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKCd4MScsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKGN4IC0gZHgoZCkpO30pXG4gICAgICAgICAgICAgICAgICAuYXR0cigneDInLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShjeCArIGR4KGQpKTt9KVxuICAgICAgICAgICAgICAgICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUoMCk7fSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geVNjYWxlKDApO30pO1xuICAgICAgY2hhcnRDb250ZW50LnNlbGVjdEFsbCgnLmxpbmUuc2hhZG93LnknKS5kYXRhKGRhdGEpXG4gICAgICAgICAgICAgICAgICAuYXR0cigneDEnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZSgwKTt9KVxuICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24oZCkge3JldHVybiB4U2NhbGUoMCk7fSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geVNjYWxlKGN5IC0gZHkoZCkpO30pXG4gICAgICAgICAgICAgICAgICAuYXR0cigneTInLCBmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShjeSArIGR5KGQpKTt9KTtcbiAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgIC8vIEFkZCB0aGUgYXhpcyBsYWJlbHMgKG1heWJlKVxuICAgICAgaWYoeExhYmVsKSB7XG4gICAgICAgIHZhciBnID0gY2hhcnRDb250ZW50LnNlbGVjdCgnLngubGFiZWwnKTtcbiAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAod2lkdGgtbWFyZ2luLmxlZnQtbWFyZ2luLnJpZ2h0KS8yICsgJywnICsgaGVpZ2h0ICsgJyknKTtcblxuICAgICAgICBpZighZy5zZWxlY3QoJ3RleHQnKVswXVswXSkge1xuICAgICAgICAgIGcuYXBwZW5kKCd0ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5zZWxlY3QoJ3RleHQnKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgJy0xZW0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoeExhYmVsKTtcbiAgICAgIH1cbiAgICAgIGlmKHlMYWJlbCkge1xuICAgICAgICB2YXIgZyA9IGNoYXJ0Q29udGVudC5zZWxlY3QoJy55LmxhYmVsJyk7XG4gICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwJyArICcsJyArKGhlaWdodC1tYXJnaW4udG9wLW1hcmdpbi5ib3R0b20pLzIgKyAgJykgcm90YXRlKC05MCknKTtcblxuICAgICAgICBpZighZy5zZWxlY3QoJ3RleHQnKVswXVswXSkge1xuICAgICAgICAgIGcuYXBwZW5kKCd0ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5zZWxlY3QoJ3RleHQnKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgJy0zZW0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoeUxhYmVsKTtcbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYXhlc1xuICAgICAgY2hhcnRDb250ZW50LnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCcgKyB5U2NhbGUucmFuZ2UoKVswXSArICcpJylcbiAgICAgICAgICAgICAgICAgIC5jYWxsKHhBeGlzKTtcbiAgICAgIGNoYXJ0Q29udGVudC5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgICAgICAgICAgICAgLmNhbGwoeUF4aXMpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhcnQubWFyZ2luID0gZnVuY3Rpb24obSkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbWFyZ2luO1xuICAgIH1cbiAgICBtYXJnaW4gPSBtO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC53aWR0aCA9IGZ1bmN0aW9uKHcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH1cbiAgICB3aWR0aCA9IHc7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKGgpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9XG4gICAgaGVpZ2h0ID0gaDtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueCA9IGZ1bmN0aW9uKHZhbEZ1bmMpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIHggPSB2YWxGdW5jO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55ID0gZnVuY3Rpb24odmFsRnVuYykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geTtcbiAgICB9XG4gICAgeSA9IHZhbEZ1bmM7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnhSYW5nZSA9IGZ1bmN0aW9uKHJuZykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geFJhbmdlO1xuICAgIH1cbiAgICBpZihybmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgeFJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBybmc7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgeFJhbmdlID0gcm5nO1xuICAgIH1cbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueVJhbmdlID0gZnVuY3Rpb24ocm5nKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB5UmFuZ2U7XG4gICAgfVxuICAgIGlmKHJuZyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICB5UmFuZ2UgPSBmdW5jdGlvbihkYXRhKSB7cmV0dXJuIHJuZzt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB5UmFuZ2UgPSBybmc7XG4gICAgfVxuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC54TGFiZWwgPSBmdW5jdGlvbihsKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB4TGFiZWw7XG4gICAgfVxuICAgIHhMYWJlbCA9IGw7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnlMYWJlbCA9IGZ1bmN0aW9uKGwpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHlMYWJlbDtcbiAgICB9XG4gICAgeUxhYmVsID0gbDtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQubGluZUxlbmd0aCA9IGZ1bmN0aW9uKGxlbikge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbGluZUxlbmd0aDtcbiAgICB9XG4gICAgbGluZUxlbmd0aCA9IGxlbjtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgcmV0dXJuIGNoYXJ0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFuZ2xlTGluZTtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiBCYXJDaGFydCgpIHtcbiAgdmFyIG1hcmdpbiA9IHt0b3A6IDQwLCByaWdodDogNDAsIGJvdHRvbTogNDAsIGxlZnQ6IDQwfSxcbiAgICAgIHdpZHRoID0gNDAwLFxuICAgICAgaGVpZ2h0ID0gNDAwLFxuICAgICAgeCA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTt9LFxuICAgICAgeSA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFsxXTt9LFxuICAgICAgeFNjYWxlID0gZDMuc2NhbGUubGluZWFyKCksXG4gICAgICB5U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKCksXG4gICAgICB4UmFuZ2UgPSBmdW5jdGlvbihkYXRhKSB7cmV0dXJuIFswLCBkMy5tYXgoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzBdO30pXTt9LFxuICAgICAgeVJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBkYXRhLm1hcChmdW5jdGlvbihkKSB7cmV0dXJuIGRbMV07fSk7fSxcbiAgICAgIHhBeGlzID0gZDMuc3ZnLmF4aXMoKS5vcmllbnQoJ2JvdHRvbScpLFxuICAgICAgeUF4aXMgPSBkMy5zdmcuYXhpcygpLm9yaWVudCgnbGVmdCcpLFxuICAgICAgeExhYmVsID0gJycsXG4gICAgICB5TGFiZWwgPSAnJztcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICAvLyBzZWxlY3Rpb24gbWF5IGJlIG1vcmUgdGhhbiBvbmUgdGhpbmdcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAvLyBuZWVkIHRvIGNvbnZlcnQgZGF0YSB0byBhIGNhbm5vbmljYWwgcmVwcmVzZXRhdGlvbi4uLlxuICAgICAgZGF0YSA9IGRhdGEubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIFt4LmNhbGwoZGF0YSwgZCwgaSksIHkuY2FsbChkYXRhLCBkLCBpKV07XG4gICAgICB9KTtcblxuICAgICAgLy8gdXBkYXRlIHNjYWxlc1xuICAgICAgeFNjYWxlLmRvbWFpbih4UmFuZ2UoZGF0YSkpXG4gICAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoLW1hcmdpbi5sZWZ0LW1hcmdpbi5yaWdodF0pO1xuICAgICAgeVNjYWxlLmRvbWFpbih5UmFuZ2UoZGF0YSkpXG4gICAgICAgICAgICAucmFuZ2VSb3VuZEJhbmRzKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0sIDAuMDUpO1xuICAgICAgaWYoeEF4aXMpIHtcbiAgICAgICAgeEF4aXMuc2NhbGUoeFNjYWxlKTtcbiAgICAgIH1cbiAgICAgIGlmKHlBeGlzKSB7XG4gICAgICAgIHlBeGlzLnNjYWxlKHlTY2FsZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgc3ZnIGFuZCBiaW5kIGFsbCBkYXRhIHRvIGl0XG4gICAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICAvLyBuZXcgY2hhcnRzIG5lZWQgdG8gYmUgY3JlYXRlZFxuICAgICAgdmFyIG5ld0NoYXJ0QXJlYSA9IHN2Zy5lbnRlcigpLmFwcGVuZCgnc3ZnJykuYXBwZW5kKCdnJyk7XG4gICAgICBuZXdDaGFydEFyZWEuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBheGlzJyk7XG4gICAgICBuZXdDaGFydEFyZWEuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneSBheGlzJyk7XG4gICAgICBuZXdDaGFydEFyZWEuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBsYWJlbCcpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgbGFiZWwnKTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBvdXRzaWRlIGRpbWVuc2lvbnNcbiAgICAgIHN2Zy5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbiAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaGFydCcpO1xuXG4gICAgICB2YXIgY2hhcnRDb250ZW50ID0gc3ZnLnNlbGVjdCgnZycpO1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIGlubmVyIGRpbWVuc2lvbnNcbiAgICAgIGNoYXJ0Q29udGVudC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBtYXJnaW4ubGVmdCArICcsJyArIG1hcmdpbi50b3AgKyAnKScpO1xuXG4gICAgICAvLyBVcGRhdGUgdGhlIGJhcnNcbiAgICAgIHZhciBiYXJzID0gY2hhcnRDb250ZW50LnNlbGVjdEFsbCgnLmJhcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuICAgICAgLy8gUmVtb3ZlIHVudXNlZCBiYXJzXG4gICAgICBiYXJzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgLy8gQ3JlYXRlIG5ldyBiYXJzXG4gICAgICBiYXJzLmVudGVyKCkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdiYXInKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBiYXJzXG4gICAgICBiYXJzLmF0dHIoJ3gnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZS5yYW5nZSgpWzBdO30pXG4gICAgICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShkWzFdKTt9KVxuICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUucmFuZ2VCYW5kKCkpXG4gICAgICAgICAgLmF0dHIoJ3dpZHRoJywgZnVuY3Rpb24oZCkge3JldHVybiB4U2NhbGUoZFswXSk7fSk7XG5cbiAgICAgIC8vIEFkZCB0aGUgYXhpcyBsYWJlbHMgKG1heWJlKVxuICAgICAgaWYoeExhYmVsKSB7XG4gICAgICAgIHZhciBnID0gY2hhcnRDb250ZW50LnNlbGVjdCgnLngubGFiZWwnKTtcbiAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAod2lkdGgtbWFyZ2luLmxlZnQtbWFyZ2luLnJpZ2h0KS8yICsgJywnICsgaGVpZ2h0ICsgJyknKTtcblxuICAgICAgICBpZighZy5zZWxlY3QoJ3RleHQnKVswXVswXSkge1xuICAgICAgICAgIGcuYXBwZW5kKCd0ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5zZWxlY3QoJ3RleHQnKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgJy0xZW0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoeExhYmVsKTtcbiAgICAgIH1cbiAgICAgIGlmKHlMYWJlbCkge1xuICAgICAgICB2YXIgZyA9IGNoYXJ0Q29udGVudC5zZWxlY3QoJy55LmxhYmVsJyk7XG4gICAgICAgIC8vZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAod2lkdGgtbWFyZ2luLmxlZnQtbWFyZ2luLnJpZ2h0KS8yICsgJywnICsgaGVpZ2h0ICsgJyknKTtcblxuICAgICAgICBpZighZy5zZWxlY3QoJ3RleHQnKVswXVswXSkge1xuICAgICAgICAgIGcuYXBwZW5kKCd0ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5zZWxlY3QoJ3RleHQnKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgJy0xZW0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoeUxhYmVsKTtcbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYXhlc1xuICAgICAgaWYoeEF4aXMpIHtcbiAgICAgICAgY2hhcnRDb250ZW50LnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArIChoZWlnaHQtbWFyZ2luLmJvdHRvbS1tYXJnaW4udG9wKSArICcpJylcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoeEF4aXMpO1xuICAgICAgfVxuICAgICAgLy9jaGFydENvbnRlbnQuc2VsZWN0KCcueS5heGlzJylcbiAgICAgICAgICAgICAgICAgIC8vLmNhbGwoeUF4aXMpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhcnQubWFyZ2luID0gZnVuY3Rpb24obSkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbWFyZ2luO1xuICAgIH1cbiAgICBtYXJnaW4gPSBtO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC53aWR0aCA9IGZ1bmN0aW9uKHcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH1cbiAgICB3aWR0aCA9IHc7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKGgpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9XG4gICAgaGVpZ2h0ID0gaDtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueCA9IGZ1bmN0aW9uKHZhbEZ1bmMpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIHggPSB2YWxGdW5jO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55ID0gZnVuY3Rpb24odmFsRnVuYykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geTtcbiAgICB9XG4gICAgeSA9IHZhbEZ1bmM7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnhBeGlzID0gZnVuY3Rpb24oYXhpcykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geEF4aXM7XG4gICAgfVxuICAgIHhBeGlzID0gYXhpcztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueUF4aXMgPSBmdW5jdGlvbihheGlzKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB5QXhpcztcbiAgICB9XG4gICAgeUF4aXMgPSBheGlzO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC54UmFuZ2UgPSBmdW5jdGlvbihybmcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHhSYW5nZTtcbiAgICB9XG4gICAgaWYocm5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHhSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gcm5nO307XG4gICAgfSBlbHNlIHtcbiAgICAgIHhSYW5nZSA9IHJuZztcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnlSYW5nZSA9IGZ1bmN0aW9uKHJuZykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geVJhbmdlO1xuICAgIH1cbiAgICBpZihybmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgeVJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBybmc7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgeVJhbmdlID0gcm5nO1xuICAgIH1cbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueExhYmVsID0gZnVuY3Rpb24obCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geExhYmVsO1xuICAgIH1cbiAgICB4TGFiZWwgPSBsO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55TGFiZWwgPSBmdW5jdGlvbihsKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB5TGFiZWw7XG4gICAgfVxuICAgIHlMYWJlbCA9IGw7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIHJldHVybiBjaGFydDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xudmFyIGxpbmVBbmdsZSA9IHJlcXVpcmUoJy4vdXRpbCcpLmxpbmVBbmdsZTtcblxuZnVuY3Rpb24gU2NhdHRlcnBsb3QoKSB7XG4gIHZhciBtYXJnaW4gPSB7dG9wOiA0MCwgcmlnaHQ6IDQwLCBib3R0b206IDQwLCBsZWZ0OiA0MH0sXG4gICAgICB3aWR0aCA9IDQwMCxcbiAgICAgIGhlaWdodCA9IDQwMCxcbiAgICAgIHggPSBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMF07fSxcbiAgICAgIHkgPSBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMV07fSxcbiAgICAgIHhTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpLFxuICAgICAgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCksXG4gICAgICB4UmFuZ2UgPSBmdW5jdGlvbihkYXRhKSB7cmV0dXJuIFswLCBkMy5tYXgoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzBdO30pXTt9LFxuICAgICAgeVJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBbMCwgZDMubWF4KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFsxXTt9KV07fSxcbiAgICAgIHhBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh4U2NhbGUpLm9yaWVudCgnYm90dG9tJyksXG4gICAgICB5QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeVNjYWxlKS5vcmllbnQoJ2xlZnQnKSxcbiAgICAgIHhMYWJlbCA9ICcnLFxuICAgICAgeUxhYmVsID0gJycsXG4gICAgICByYWRpdXMgPSBmdW5jdGlvbihkKSB7cmV0dXJuIDY7fSxcbiAgICAgIG9uQ2xpY2sgPSBmdW5jdGlvbihkLCBpKSB7fSxcbiAgICAgIGxpbmVMZW5ndGggPSAwLjI7IC8vIGluIGRhdGEgc2l6ZS4uLlxuXG4gIGZ1bmN0aW9uIGNoYXJ0KHNlbGVjdGlvbikge1xuICAgIC8vIHNlbGVjdGlvbiBtYXkgYmUgbW9yZSB0aGFuIG9uZSB0aGluZ1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIC8vIFB1bGwgb3V0IHRoZSBncmFkaWVudHMgYmVmb3JlIHdlIHRocm93IHRoZW0gYXdheSBiZWxvd1xuICAgICAgLy8gbW92aW5nIGRvdCBpcyB0aGUgbGFzdCBpdGVtIGluIHRoZSBhcnJheVxuICAgICAgdmFyIGdyYWRpZW50cyA9IFtkYXRhW2RhdGEubGVuZ3RoLTFdXS5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICAvLyBjb252ZXJ0IHRvIHNsb3BlcyBhcyB3ZWxsXG4gICAgICAgIHJldHVybiBkLmdyYWRpZW50Lm1hcChmdW5jdGlvbihnKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN4OiBkLmV4cFJpc2ssXG4gICAgICAgICAgICBjeTogZC5leHBSZXR1cm4sXG4gICAgICAgICAgICBzbG9wZTogZy5leHBSaXNrPT09MCA/IGcuZXhwUmV0dXJuIC8gMWUtOSA6IGcuZXhwUmV0dXJuIC8gZy5leHBSaXNrLFxuICAgICAgICAgICAgaXNTZWxlY3RlZDogZy5pc1NlbGVjdGVkKCkgLy8gaGFjayBoZXJlXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24oYSxiKSB7cmV0dXJuIGEuY29uY2F0KGIpO30pO1xuICAgICAgLy8gbmVlZCB0byBjb252ZXJ0IGRhdGEgdG8gYSBjYW5ub25pY2FsIHJlcHJlc2V0YXRpb24uLi5cbiAgICAgIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHZhciByZXQgPSBbeC5jYWxsKGRhdGEsIGQsIGkpLCB5LmNhbGwoZGF0YSwgZCwgaSldO1xuICAgICAgICByZXQuYWxsb2NzID0gZC5hbGxvY3M7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gdXBkYXRlIHNjYWxlc1xuICAgICAgeFNjYWxlLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSlcbiAgICAgICAgICAgIC5kb21haW4oeFJhbmdlKGRhdGEpKTtcbiAgICAgIHlTY2FsZS5kb21haW4oeVJhbmdlKGRhdGEpKVxuICAgICAgICAgICAgLnJhbmdlKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0pO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHN2ZyBhbmQgYmluZCBhbGwgZGF0YSB0byBpdFxuICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3N2ZycpLmRhdGEoW2RhdGFdKTtcblxuICAgICAgLy8gbmV3IGNoYXJ0cyBuZWVkIHRvIGJlIGNyZWF0ZWRcbiAgICAgIHZhciBuZXdDaGFydEFyZWEgPSBzdmcuZW50ZXIoKS5hcHBlbmQoJ3N2ZycpLmFwcGVuZCgnZycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggbGFiZWwnKTtcbiAgICAgIG5ld0NoYXJ0QXJlYS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd5IGxhYmVsJyk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgb3V0c2lkZSBkaW1lbnNpb25zXG4gICAgICBzdmcuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gICAgICAgICAuYXR0cignY2xhc3MnLCAnY2hhcnQnKTtcblxuICAgICAgdmFyIGNoYXJ0Q29udGVudCA9IHN2Zy5zZWxlY3QoJ2cnKTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBpbm5lciBkaW1lbnNpb25zXG4gICAgICBjaGFydENvbnRlbnQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbWFyZ2luLmxlZnQgKyAnLCcgKyBtYXJnaW4udG9wICsgJyknKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwb2ludHNcbiAgICAgIHZhciBwb2ludHMgPSBjaGFydENvbnRlbnQuc2VsZWN0QWxsKCcuZG90JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0YShkYXRhKTtcbiAgICAgIC8vIFJlbW92ZSB1bnVzZWQgcG9pbnRzXG4gICAgICBwb2ludHMuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICAvLyBDcmVhdGUgbmV3IHBvaW50c1xuICAgICAgcG9pbnRzLmVudGVyKCkuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnZG90Jyk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgcG9pbnRzXG4gICAgICBwb2ludHMuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShkWzBdKTt9KVxuICAgICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUoZFsxXSk7fSlcbiAgICAgICAgICAgIC5hdHRyKCdyJywgZnVuY3Rpb24oZCkge3JldHVybiByYWRpdXMoZCk7fSlcbiAgICAgICAgICAgIC5hdHRyKCdpZCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICAgICAgaWYoaT09ZGF0YS5sZW5ndGgtMSkgcmV0dXJuICdyaXNrLXJldHVybic7XG4gICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgIHJldHVybiAnc2F2ZWQtcG9ydC0nICsgaTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgb25DbGljayk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgZ3JhZGllbnQgbGluZXNcbiAgICAgIHZhciBncmFkTGluZXMgPSBjaGFydENvbnRlbnQuc2VsZWN0QWxsKCcuZ3JhZGllbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKGdyYWRpZW50cyk7XG5cbiAgICAgIC8vIFJlbW92ZSB1bnVzZWQgbGluZXNcbiAgICAgIGdyYWRMaW5lcy5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAgIC8vIENyZWF0ZSBuZXcgZ3JhZGllbnQgbGluZXNcbiAgICAgIGdyYWRMaW5lcy5lbnRlcigpLmFwcGVuZCgnbGluZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAvLy5hdHRyKCdjbGFzcycsICdncmFkaWVudCcpO1xuXG4gICAgICAvLyBVcGRhdGUgdGhlIGxpbmUgcG9zaXRpb25zXG4gICAgICBncmFkTGluZXMuYXR0cigneDEnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShsaW5lQW5nbGUoZC5jeCwgZC5jeSwgZC5zbG9wZSwgbGluZUxlbmd0aC8xLjUpLngxKTt9KVxuICAgICAgICAgICAgICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUobGluZUFuZ2xlKGQuY3gsIGQuY3ksIGQuc2xvcGUsIGxpbmVMZW5ndGgvMS41KS55MSk7fSlcbiAgICAgICAgICAgICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKGxpbmVBbmdsZShkLmN4LCBkLmN5LCBkLnNsb3BlLCBsaW5lTGVuZ3RoKS54Mik7fSlcbiAgICAgICAgICAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geVNjYWxlKGxpbmVBbmdsZShkLmN4LCBkLmN5LCBkLnNsb3BlLCBsaW5lTGVuZ3RoKS55Mik7fSlcbiAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKGQsIGkpIHtyZXR1cm4gJ2dyYWRpZW50IGNvbG9yYnJld2VyIHF1YWxpdGF0aXZlLScrKGkrMSk7fSlcbiAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAxLjUpO1xuICAgICAgICAgICAgICAgLy8uYXR0cignc3Ryb2tlJywgZnVuY3Rpb24oZCwgaSkge3JldHVybiBjYlsnRGFyazInXVs1XVtpXTt9KVxuICAgICAgICAgICAgICAgLy8uYXR0cignc3Ryb2tlLXdpZHRoJywgZnVuY3Rpb24oZCkge3JldHVybiBkLmlzU2VsZWN0ZWQgPyA0IDogMjt9KTtcblxuICAgICAgLy8gQWRkIHRoZSBheGlzIGxhYmVscyAobWF5YmUpXG4gICAgICBpZih4TGFiZWwpIHtcbiAgICAgICAgdmFyIGcgPSBjaGFydENvbnRlbnQuc2VsZWN0KCcueC5sYWJlbCcpO1xuICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArICh3aWR0aC1tYXJnaW4ubGVmdC1tYXJnaW4ucmlnaHQpLzIgKyAnLCcgKyAoaGVpZ2h0LW1hcmdpbi5ib3R0b20pICsgJyknKTtcblxuICAgICAgICBpZighZy5zZWxlY3QoJ3RleHQnKVswXVswXSkge1xuICAgICAgICAgIGcuYXBwZW5kKCd0ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5zZWxlY3QoJ3RleHQnKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoeExhYmVsKTtcbiAgICAgIH1cbiAgICAgIGlmKHlMYWJlbCkge1xuICAgICAgICB2YXIgZyA9IGNoYXJ0Q29udGVudC5zZWxlY3QoJy55LmxhYmVsJyk7XG4gICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCcgKyhoZWlnaHQtbWFyZ2luLnRvcC1tYXJnaW4uYm90dG9tKS8yICsgJykgcm90YXRlKC05MCknKTtcblxuICAgICAgICBpZighZy5zZWxlY3QoJ3RleHQnKVswXVswXSkge1xuICAgICAgICAgIGcuYXBwZW5kKCd0ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5zZWxlY3QoJ3RleHQnKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgJy0zZW0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoeUxhYmVsKTtcbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYXhlc1xuICAgICAgY2hhcnRDb250ZW50LnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCcgKyB5U2NhbGUucmFuZ2UoKVswXSArICcpJylcbiAgICAgICAgICAgICAgICAgIC5jYWxsKHhBeGlzKTtcbiAgICAgIGNoYXJ0Q29udGVudC5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgICAgICAgICAgICAgLmNhbGwoeUF4aXMpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhcnQubWFyZ2luID0gZnVuY3Rpb24obSkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbWFyZ2luO1xuICAgIH1cbiAgICBtYXJnaW4gPSBtO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC53aWR0aCA9IGZ1bmN0aW9uKHcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH1cbiAgICB3aWR0aCA9IHc7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKGgpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9XG4gICAgaGVpZ2h0ID0gaDtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueCA9IGZ1bmN0aW9uKHZhbEZ1bmMpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIHggPSB2YWxGdW5jO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55ID0gZnVuY3Rpb24odmFsRnVuYykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geTtcbiAgICB9XG4gICAgeSA9IHZhbEZ1bmM7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnhBeGlzID0gZnVuY3Rpb24oYXhpcykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geEF4aXM7XG4gICAgfVxuICAgIHhBeGlzID0gYXhpcztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueUF4aXMgPSBmdW5jdGlvbihheGlzKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB5QXhpcztcbiAgICB9XG4gICAgeUF4aXMgPSBheGlzO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC54UmFuZ2UgPSBmdW5jdGlvbihybmcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHhSYW5nZTtcbiAgICB9XG4gICAgaWYocm5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHhSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gcm5nO307XG4gICAgfSBlbHNlIHtcbiAgICAgIHhSYW5nZSA9IHJuZztcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnlSYW5nZSA9IGZ1bmN0aW9uKHJuZykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geVJhbmdlO1xuICAgIH1cbiAgICBpZihybmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgeVJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBybmc7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgeVJhbmdlID0gcm5nO1xuICAgIH1cbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueExhYmVsID0gZnVuY3Rpb24obCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geExhYmVsO1xuICAgIH1cbiAgICB4TGFiZWwgPSBsO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55TGFiZWwgPSBmdW5jdGlvbihsKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB5TGFiZWw7XG4gICAgfVxuICAgIHlMYWJlbCA9IGw7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnJhZGl1cyA9IGZ1bmN0aW9uKHIpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIGlmKHIgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmFkaXVzID0gcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmFkaXVzID0gZnVuY3Rpb24oZCkge3JldHVybiByO307XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmxpbmVMZW5ndGggPSBmdW5jdGlvbihsZW4pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGxpbmVMZW5ndGg7XG4gICAgfVxuICAgIGxpbmVMZW5ndGggPSBsZW47XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0Lm9uQ2xpY2sgPSBmdW5jdGlvbihmKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBvbkNsaWNrO1xuICAgIH1cbiAgICBvbkNsaWNrID0gZjtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgcmV0dXJuIGNoYXJ0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjYXR0ZXJwbG90O1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbmZ1bmN0aW9uIFNjYXR0ZXJwbG90KCkge1xuICB2YXIgbWFyZ2luID0ge3RvcDogNDAsIHJpZ2h0OiA0MCwgYm90dG9tOiA0MCwgbGVmdDogNDB9LFxuICAgICAgd2lkdGggPSA0MDAsXG4gICAgICBoZWlnaHQgPSA0MDAsXG4gICAgICB4ID0gZnVuY3Rpb24oZCkge3JldHVybiBkWzBdO30sXG4gICAgICB5ID0gZnVuY3Rpb24oZCkge3JldHVybiBkWzFdO30sXG4gICAgICB4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKSxcbiAgICAgIHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpLFxuICAgICAgeFJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBbMCwgZDMubWF4KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTt9KV07fSxcbiAgICAgIHlSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gWzAsIGQzLm1heChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMV07fSldO30sXG4gICAgICB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpLFxuICAgICAgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0JyksXG4gICAgICB4TGFiZWwgPSAnJyxcbiAgICAgIHlMYWJlbCA9ICcnLFxuICAgICAgcmFkaXVzID0gZnVuY3Rpb24oZCkge3JldHVybiA2O30sXG4gICAgICBvbkNsaWNrID0gZnVuY3Rpb24oZCwgaSkge307XG5cbiAgZnVuY3Rpb24gY2hhcnQoc2VsZWN0aW9uKSB7XG4gICAgLy8gc2VsZWN0aW9uIG1heSBiZSBtb3JlIHRoYW4gb25lIHRoaW5nXG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuICAgICAgLy8gbmVlZCB0byBjb252ZXJ0IGRhdGEgdG8gYSBjYW5ub25pY2FsIHJlcHJlc2V0YXRpb24uLi5cbiAgICAgIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHZhciByZXQgPSBbeC5jYWxsKGRhdGEsIGQsIGkpLCB5LmNhbGwoZGF0YSwgZCwgaSldO1xuICAgICAgICByZXQuYWxsb2NzID0gZC5hbGxvY3M7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gdXBkYXRlIHNjYWxlc1xuICAgICAgeFNjYWxlLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSlcbiAgICAgICAgICAgIC5kb21haW4oeFJhbmdlKGRhdGEpKTtcbiAgICAgIHlTY2FsZS5kb21haW4oeVJhbmdlKGRhdGEpKVxuICAgICAgICAgICAgLnJhbmdlKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0pO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHN2ZyBhbmQgYmluZCBhbGwgZGF0YSB0byBpdFxuICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3N2ZycpLmRhdGEoW2RhdGFdKTtcblxuICAgICAgLy8gbmV3IGNoYXJ0cyBuZWVkIHRvIGJlIGNyZWF0ZWRcbiAgICAgIHZhciBuZXdDaGFydEFyZWEgPSBzdmcuZW50ZXIoKS5hcHBlbmQoJ3N2ZycpLmFwcGVuZCgnZycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggbGFiZWwnKTtcbiAgICAgIG5ld0NoYXJ0QXJlYS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd5IGxhYmVsJyk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgb3V0c2lkZSBkaW1lbnNpb25zXG4gICAgICBzdmcuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gICAgICAgICAuYXR0cignY2xhc3MnLCAnY2hhcnQnKTtcblxuICAgICAgdmFyIGNoYXJ0Q29udGVudCA9IHN2Zy5zZWxlY3QoJ2cnKTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBpbm5lciBkaW1lbnNpb25zXG4gICAgICBjaGFydENvbnRlbnQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbWFyZ2luLmxlZnQgKyAnLCcgKyBtYXJnaW4udG9wICsgJyknKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwb2ludHNcbiAgICAgIHZhciBwb2ludHMgPSBjaGFydENvbnRlbnQuc2VsZWN0QWxsKCcuZG90JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0YShkYXRhKTtcbiAgICAgIC8vIFJlbW92ZSB1bnVzZWQgYmFyc1xuICAgICAgcG9pbnRzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgLy8gQ3JlYXRlIG5ldyBiYXJzXG4gICAgICBwb2ludHMuZW50ZXIoKS5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdkb3QnKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBiYXJzXG4gICAgICBwb2ludHMuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShkWzBdKTt9KVxuICAgICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUoZFsxXSk7fSlcbiAgICAgICAgICAgIC5hdHRyKCdyJywgZnVuY3Rpb24oZCkge3JldHVybiByYWRpdXMoZCk7fSlcbiAgICAgICAgICAgIC5hdHRyKCdpZCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICAgICAgaWYoaT09ZGF0YS5sZW5ndGgtMSkgcmV0dXJuICdyaXNrLXJldHVybic7XG4gICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgIHJldHVybiAnc2F2ZWQtcG9ydC0nICsgaTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgb25DbGljayk7XG5cbiAgICAgIC8vIEFkZCB0aGUgYXhpcyBsYWJlbHMgKG1heWJlKVxuICAgICAgaWYoeExhYmVsKSB7XG4gICAgICAgIHZhciBnID0gY2hhcnRDb250ZW50LnNlbGVjdCgnLngubGFiZWwnKTtcbiAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAod2lkdGgtbWFyZ2luLmxlZnQtbWFyZ2luLnJpZ2h0KS8yICsgJywnICsgKGhlaWdodC1tYXJnaW4uYm90dG9tKSArICcpJyk7XG5cbiAgICAgICAgaWYoIWcuc2VsZWN0KCd0ZXh0JylbMF1bMF0pIHtcbiAgICAgICAgICBnLmFwcGVuZCgndGV4dCcpO1xuICAgICAgICB9XG4gICAgICAgIGcuc2VsZWN0KCd0ZXh0JykuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KHhMYWJlbCk7XG4gICAgICB9XG4gICAgICBpZih5TGFiZWwpIHtcbiAgICAgICAgdmFyIGcgPSBjaGFydENvbnRlbnQuc2VsZWN0KCcueS5sYWJlbCcpO1xuICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwnICsoaGVpZ2h0LW1hcmdpbi50b3AtbWFyZ2luLmJvdHRvbSkvMiArICcpIHJvdGF0ZSgtOTApJyk7XG5cbiAgICAgICAgaWYoIWcuc2VsZWN0KCd0ZXh0JylbMF1bMF0pIHtcbiAgICAgICAgICBnLmFwcGVuZCgndGV4dCcpO1xuICAgICAgICB9XG4gICAgICAgIGcuc2VsZWN0KCd0ZXh0JykuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsICctNGVtJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KHlMYWJlbCk7XG4gICAgICB9XG4gICAgICAvLyBVcGRhdGUgdGhlIGF4ZXNcbiAgICAgIGNoYXJ0Q29udGVudC5zZWxlY3QoJy54LmF4aXMnKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwnICsgeVNjYWxlLnJhbmdlKClbMF0gKyAnKScpXG4gICAgICAgICAgICAgICAgICAuY2FsbCh4QXhpcyk7XG4gICAgICBjaGFydENvbnRlbnQuc2VsZWN0KCcueS5heGlzJylcbiAgICAgICAgICAgICAgICAgIC5jYWxsKHlBeGlzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKG0pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG1hcmdpbjtcbiAgICB9XG4gICAgbWFyZ2luID0gbTtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbih3KSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9XG4gICAgd2lkdGggPSB3O1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5oZWlnaHQgPSBmdW5jdGlvbihoKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgfVxuICAgIGhlaWdodCA9IGg7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnggPSBmdW5jdGlvbih2YWxGdW5jKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICB4ID0gdmFsRnVuYztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueSA9IGZ1bmN0aW9uKHZhbEZ1bmMpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHk7XG4gICAgfVxuICAgIHkgPSB2YWxGdW5jO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC54UmFuZ2UgPSBmdW5jdGlvbihybmcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHhSYW5nZTtcbiAgICB9XG4gICAgaWYocm5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHhSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gcm5nO307XG4gICAgfSBlbHNlIHtcbiAgICAgIHhSYW5nZSA9IHJuZztcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnlSYW5nZSA9IGZ1bmN0aW9uKHJuZykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geVJhbmdlO1xuICAgIH1cbiAgICBpZihybmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgeVJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBybmc7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgeVJhbmdlID0gcm5nO1xuICAgIH1cbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueExhYmVsID0gZnVuY3Rpb24obCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geExhYmVsO1xuICAgIH1cbiAgICB4TGFiZWwgPSBsO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55TGFiZWwgPSBmdW5jdGlvbihsKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB5TGFiZWw7XG4gICAgfVxuICAgIHlMYWJlbCA9IGw7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnJhZGl1cyA9IGZ1bmN0aW9uKHIpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIGlmKHIgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmFkaXVzID0gcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmFkaXVzID0gZnVuY3Rpb24oZCkge3JldHVybiByO307XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0Lm9uQ2xpY2sgPSBmdW5jdGlvbihmKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBvbkNsaWNrO1xuICAgIH1cbiAgICBvbkNsaWNrID0gZjtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgcmV0dXJuIGNoYXJ0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjYXR0ZXJwbG90O1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyksXG4gICAgbnVtZXJpYyA9IHJlcXVpcmUoJ251bWVyaWMnKTtcblxuZnVuY3Rpb24gU3BhcmtsaW5lU2xpZGVyKCkge1xuICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAxMCwgbGVmdDogMTB9LFxuICAgICAgd2lkdGggPSAzMDAsXG4gICAgICBoZWlnaHQgPSAxMDAsXG4gICAgICBwbG90RnVuY3Rpb24gPSBmdW5jdGlvbih4KSB7cmV0dXJuIHg7fSxcbiAgICAgIHggPSBmdW5jdGlvbihkKSB7cmV0dXJuIGQucG9zO30sXG4gICAgICB4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKSxcbiAgICAgIHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpLFxuICAgICAgeFJhbmdlID0gZnVuY3Rpb24oZGF0YSkge3JldHVybiBbMCwgMV07fSxcbiAgICAgIHlSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gWzAsIDNdO30sXG4gICAgICB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpLFxuICAgICAgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0JyksXG4gICAgICB4TGFiZWwgPSAnJyxcbiAgICAgIHlMYWJlbCA9ICcnLFxuICAgICAgb25EcmFnID0gZnVuY3Rpb24oKSB7fTtcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICAvLyBzZWxlY3Rpb24gbWF5IGJlIG1vcmUgdGhhbiBvbmUgdGhpbmdcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAvLyBuZWVkIHRvIGNvbnZlcnQgZGF0YSB0byBhIGNhbm5vbmljYWwgcmVwcmVzZXRhdGlvbi4uLlxuICAgICAgcGxvdEZ1bmN0aW9uID0gZGF0YS5mO1xuICAgICAgZGF0YSA9IGRhdGEucG9zO1xuXG4gICAgICAvLyB1cGRhdGUgc2NhbGVzXG4gICAgICB4U2NhbGUucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKVxuICAgICAgICAgICAgLmRvbWFpbih4UmFuZ2UoZGF0YSkpO1xuICAgICAgeVNjYWxlLmRvbWFpbih5UmFuZ2UoZGF0YSkpXG4gICAgICAgICAgICAucmFuZ2UoW2hlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLCAwXSk7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgc3ZnIGFuZCBiaW5kIGFsbCBkYXRhIHRvIGl0XG4gICAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICAvLyBuZXcgY2hhcnRzIG5lZWQgdG8gYmUgY3JlYXRlZFxuICAgICAgdmFyIG5ld0NoYXJ0QXJlYSA9IHN2Zy5lbnRlcigpLmFwcGVuZCgnc3ZnJykuYXBwZW5kKCdnJyk7XG4gICAgICBuZXdDaGFydEFyZWEuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBheGlzJyk7XG4gICAgICBuZXdDaGFydEFyZWEuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneSBheGlzJyk7XG4gICAgICBuZXdDaGFydEFyZWEuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBsYWJlbCcpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgbGFiZWwnKTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBvdXRzaWRlIGRpbWVuc2lvbnNcbiAgICAgIHN2Zy5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbiAgICAgICAgIC5hdHRyKCdjbGFzcycsICdjaGFydCBjb250cm9sJyk7XG5cbiAgICAgIHZhciBjaGFydENvbnRlbnQgPSBzdmcuc2VsZWN0KCdnJyk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgaW5uZXIgZGltZW5zaW9uc1xuICAgICAgY2hhcnRDb250ZW50LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIG1hcmdpbi5sZWZ0ICsgJywnICsgbWFyZ2luLnRvcCArICcpJyk7XG5cbiAgICAgIC8vIERyYXcgdGhlIGxpbmVcbiAgICAgIHZhciBudW1QdHMgPSAxNTtcbiAgICAgIHZhciB4Qm91bmRzID0geFJhbmdlKGRhdGEpLFxuICAgICAgICAgIHhWYWxzID0gbnVtZXJpYy5saW5zcGFjZSh4Qm91bmRzWzBdLCB4Qm91bmRzWzFdLCBudW1QdHMpO1xuICAgICAgdmFyIHBsb3REYXRhID0geFZhbHMubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiBwbG90RnVuY3Rpb24oeCl9O1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKS5pbnRlcnBvbGF0ZSgnYmFzaXMnKVxuICAgICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKGQueCk7fSlcbiAgICAgICAgICAgICAgICAgICAueShmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShkLnkpO30pO1xuICAgICAgY2hhcnRDb250ZW50LnNlbGVjdEFsbCgncGF0aC5saW5lJykuZGF0YShbcGxvdERhdGFdKVxuICAgICAgICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKCdwYXRoJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJ2JsYWNrJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAndHJhbnNwYXJlbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZCcsIGxpbmUocGxvdERhdGEpKTtcblxuICAgICAgLy8gZHJhdyB0aGUgc2xpZGVyIHdpZGdldFxuICAgICAgdmFyIGRyYWdCZWhhdmlvciA9ICBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnJywgb25EcmFnKVxuICAgICAgICAub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGQzLnNlbGVjdChkMy5ldmVudC5zb3VyY2VFdmVudC50YXJnZXQpLmNsYXNzZWQoJ2RyYWdnaW5nJywgdHJ1ZSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJhZ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vZDMuc2VsZWN0KGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRhcmdldCkuY2xhc3NlZCgnZHJhZ2dpbmcnLCBmYWxzZSk7XG4gICAgICAgICAgdmFyIGhhbmRsZSA9IGNoYXJ0Q29udGVudC5zZWxlY3RBbGwoJy5oYW5kbGUnKTtcbiAgICAgICAgICBoYW5kbGUuY2xhc3NlZCgnZHJhZ2dpbmcnLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgdmFyIGhhbmRsZVdpZHRoID0gMTE7XG4gICAgICB2YXIgaGFuZGxlID0gY2hhcnRDb250ZW50LnNlbGVjdEFsbCgnLmhhbmRsZScpLmRhdGEoW2RhdGFdKTtcbiAgICAgIGhhbmRsZS5lbnRlcigpLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2hhbmRsZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdyJywgaGFuZGxlV2lkdGgvMilcbiAgICAgICAgICAgICAgICAgICAgLy8uYXR0cigneScsIDApXG4gICAgICAgICAgICAgICAgICAgIC8vYXR0cignd2lkdGgnLCBoYW5kbGVXaWR0aClcbiAgICAgICAgICAgICAgICAgICAgLy8uYXR0cignaGVpZ2h0JywgeVNjYWxlKHlSYW5nZSgpWzBdKSlcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZHJhZ0JlaGF2aW9yKTtcbiAgICAgIGhhbmRsZS5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKGQpO30pXG4gICAgICAgICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShwbG90RnVuY3Rpb24oZCkpO30pO1xuXG4gICAgICAvLyBBZGQgdGhlIGF4aXMgbGFiZWxzIChtYXliZSlcbiAgICAgIC8qXG4gICAgICBpZih4TGFiZWwpIHtcbiAgICAgICAgdmFyIGcgPSBjaGFydENvbnRlbnQuc2VsZWN0KCcueC5sYWJlbCcpO1xuICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArICh3aWR0aC1tYXJnaW4ubGVmdC1tYXJnaW4ucmlnaHQpLzIgKyAnLCcgKyBoZWlnaHQgKyAnKScpO1xuXG4gICAgICAgIGlmKCFnLnNlbGVjdCgndGV4dCcpWzBdWzBdKSB7XG4gICAgICAgICAgZy5hcHBlbmQoJ3RleHQnKTtcbiAgICAgICAgfVxuICAgICAgICBnLnNlbGVjdCgndGV4dCcpLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZHknLCAnLTFlbScpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGV4dCh4TGFiZWwpO1xuICAgICAgfVxuICAgICAgaWYoeUxhYmVsKSB7XG4gICAgICAgIHZhciBnID0gY2hhcnRDb250ZW50LnNlbGVjdCgnLnkubGFiZWwnKTtcbiAgICAgICAgLy9nLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArICh3aWR0aC1tYXJnaW4ubGVmdC1tYXJnaW4ucmlnaHQpLzIgKyAnLCcgKyBoZWlnaHQgKyAnKScpO1xuXG4gICAgICAgIGlmKCFnLnNlbGVjdCgndGV4dCcpWzBdWzBdKSB7XG4gICAgICAgICAgZy5hcHBlbmQoJ3RleHQnKTtcbiAgICAgICAgfVxuICAgICAgICBnLnNlbGVjdCgndGV4dCcpLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZHknLCAnLTFlbScpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGV4dCh5TGFiZWwpO1xuICAgICAgfVxuXG4gICAgICAqL1xuICAgICAgLy8gVXBkYXRlIHRoZSBheGVzXG4gICAgICAvKlxuICAgICAgY2hhcnRDb250ZW50LnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCcgKyB5U2NhbGUucmFuZ2UoKVswXSArICcpJylcbiAgICAgICAgICAgICAgICAgIC5jYWxsKHhBeGlzKTtcbiAgICAgIGNoYXJ0Q29udGVudC5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgICAgICAgICAgICAgLmNhbGwoeUF4aXMpO1xuICAgICAgKi9cbiAgICB9KTtcbiAgfVxuXG4gIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKG0pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG1hcmdpbjtcbiAgICB9XG4gICAgbWFyZ2luID0gbTtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbih3KSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9XG4gICAgd2lkdGggPSB3O1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5oZWlnaHQgPSBmdW5jdGlvbihoKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgfVxuICAgIGhlaWdodCA9IGg7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnggPSBmdW5jdGlvbih2YWxGdW5jKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICB4ID0gdmFsRnVuYztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueFNjYWxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHhTY2FsZTtcbiAgfTtcblxuICBjaGFydC54QXhpcyA9IGZ1bmN0aW9uKGF4aXMpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHhBeGlzO1xuICAgIH1cbiAgICB4QXhpcyA9IGF4aXM7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnlBeGlzID0gZnVuY3Rpb24oYXhpcykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geUF4aXM7XG4gICAgfVxuICAgIHlBeGlzID0gYXhpcztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueFJhbmdlID0gZnVuY3Rpb24ocm5nKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB4UmFuZ2U7XG4gICAgfVxuICAgIGlmKHJuZyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICB4UmFuZ2UgPSBmdW5jdGlvbihkYXRhKSB7cmV0dXJuIHJuZzt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB4UmFuZ2UgPSBybmc7XG4gICAgfVxuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55UmFuZ2UgPSBmdW5jdGlvbihybmcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHlSYW5nZTtcbiAgICB9XG4gICAgaWYocm5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHlSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gcm5nO307XG4gICAgfSBlbHNlIHtcbiAgICAgIHlSYW5nZSA9IHJuZztcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnhMYWJlbCA9IGZ1bmN0aW9uKGwpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHhMYWJlbDtcbiAgICB9XG4gICAgeExhYmVsID0gbDtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueUxhYmVsID0gZnVuY3Rpb24obCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geUxhYmVsO1xuICAgIH1cbiAgICB5TGFiZWwgPSBsO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5wbG90RnVuY3Rpb24gPSBmdW5jdGlvbihmKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBwbG90RnVuY3Rpb247XG4gICAgfVxuICAgIHBsb3RGdW5jdGlvbiA9IGY7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0Lm9uRHJhZyA9IGZ1bmN0aW9uKGYpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG9uRHJhZztcbiAgICB9XG4gICAgb25EcmFnID0gZjtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgcmV0dXJuIGNoYXJ0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNwYXJrbGluZVNsaWRlcjtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiBTY2F0dGVycGxvdCgpIHtcbiAgdmFyIG1hcmdpbiA9IHt0b3A6IDQwLCByaWdodDogNDAsIGJvdHRvbTogNDAsIGxlZnQ6IDQwfSxcbiAgICAgIHdpZHRoID0gNDAwLFxuICAgICAgaGVpZ2h0ID0gNDAwLFxuICAgICAgeCA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTt9LFxuICAgICAgeSA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFsxXTt9LFxuICAgICAgeFNjYWxlID0gZDMuc2NhbGUubGluZWFyKCksXG4gICAgICB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKSxcbiAgICAgIHhSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gWzAsIGQzLm1heChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMF07fSldO30sXG4gICAgICB5UmFuZ2UgPSBmdW5jdGlvbihkYXRhKSB7cmV0dXJuIFswLCBkMy5tYXgoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzFdO30pXTt9LFxuICAgICAgeEF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHhTY2FsZSkub3JpZW50KCdib3R0b20nKSxcbiAgICAgIHlBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh5U2NhbGUpLm9yaWVudCgnbGVmdCcpLFxuICAgICAgeExhYmVsID0gJycsXG4gICAgICB5TGFiZWwgPSAnJyxcbiAgICAgIHJhZGl1cyA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gNjt9LFxuICAgICAgb25DbGljayA9IGZ1bmN0aW9uKGQsIGkpIHt9O1xuXG4gIGZ1bmN0aW9uIGNoYXJ0KHNlbGVjdGlvbikge1xuICAgIC8vIHNlbGVjdGlvbiBtYXkgYmUgbW9yZSB0aGFuIG9uZSB0aGluZ1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIC8vIFB1bGwgb3V0IHRoZSBzbGljZXMgYmVmb3JlIHdlIHRocm93IHRoZW0gYXdheSBiZWxvd1xuICAgICAgdmFyIHNsaWNlcyA9IGRhdGEuc2xpY2UoKTtcblxuICAgICAgLy8gbmVlZCB0byBjb252ZXJ0IGRhdGEgdG8gYSBjYW5ub25pY2FsIHJlcHJlc2V0YXRpb24uLi5cbiAgICAgIGRhdGEgPSBkYXRhLnBvcnRmb2xpbygpLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHZhciByZXQgPSBbeC5jYWxsKGRhdGEsIGQsIGkpLCB5LmNhbGwoZGF0YSwgZCwgaSldO1xuICAgICAgICByZXQuYWxsb2NzID0gZC5hbGxvY3M7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KTtcblxuICAgICAgLy8gdXBkYXRlIHNjYWxlc1xuICAgICAgeFNjYWxlLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSlcbiAgICAgICAgICAgIC5kb21haW4oeFJhbmdlKGRhdGEpKTtcbiAgICAgIHlTY2FsZS5kb21haW4oeVJhbmdlKGRhdGEpKVxuICAgICAgICAgICAgLnJhbmdlKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0pO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHN2ZyBhbmQgYmluZCBhbGwgZGF0YSB0byBpdFxuICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3N2ZycpLmRhdGEoW2RhdGFdKTtcblxuICAgICAgLy8gbmV3IGNoYXJ0cyBuZWVkIHRvIGJlIGNyZWF0ZWRcbiAgICAgIHZhciBuZXdDaGFydEFyZWEgPSBzdmcuZW50ZXIoKS5hcHBlbmQoJ3N2ZycpLmFwcGVuZCgnZycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuICAgICAgbmV3Q2hhcnRBcmVhLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggbGFiZWwnKTtcbiAgICAgIG5ld0NoYXJ0QXJlYS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd5IGxhYmVsJyk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgb3V0c2lkZSBkaW1lbnNpb25zXG4gICAgICBzdmcuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gICAgICAgICAuYXR0cignY2xhc3MnLCAnY2hhcnQnKTtcblxuICAgICAgdmFyIGNoYXJ0Q29udGVudCA9IHN2Zy5zZWxlY3QoJ2cnKTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBpbm5lciBkaW1lbnNpb25zXG4gICAgICBjaGFydENvbnRlbnQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgbWFyZ2luLmxlZnQgKyAnLCcgKyBtYXJnaW4udG9wICsgJyknKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwb2ludHNcbiAgICAgIHZhciBwb2ludHMgPSBjaGFydENvbnRlbnQuc2VsZWN0QWxsKCcuZG90JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0YShkYXRhKTtcbiAgICAgIC8vIFJlbW92ZSB1bnVzZWQgYmFyc1xuICAgICAgcG9pbnRzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgLy8gQ3JlYXRlIG5ldyBiYXJzXG4gICAgICBwb2ludHMuZW50ZXIoKS5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdkb3QnKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBiYXJzXG4gICAgICBwb2ludHMuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShkWzBdKTt9KVxuICAgICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUoZFsxXSk7fSlcbiAgICAgICAgICAgIC5hdHRyKCdyJywgZnVuY3Rpb24oZCkge3JldHVybiByYWRpdXMoZCk7fSlcbiAgICAgICAgICAgIC5hdHRyKCdpZCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICAgICAgaWYoaT09ZGF0YS5sZW5ndGgtMSkgcmV0dXJuICdyaXNrLXJldHVybic7XG4gICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgIHJldHVybiAnc2F2ZWQtcG9ydC0nICsgaTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgb25DbGljayk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgc2xpY2UgbGluZXNcbiAgICAgIHZhciBzbGljZUxpbmVmID0gZDMuc3ZnLmxpbmUoKVxuICAgICAgICAuaW50ZXJwb2xhdGUoJ2Jhc2lzJylcbiAgICAgICAgLngoZnVuY3Rpb24oZCkge3JldHVybiB4U2NhbGUoZC5leHBSaXNrKTt9KVxuICAgICAgICAueShmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShkLmV4cFJldHVybik7fSk7XG4gICAgICB2YXIgc2xpY2VMaW5lcyA9IGNoYXJ0Q29udGVudC5zZWxlY3RBbGwoJy5zbGljZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKHNsaWNlcyk7XG5cbiAgICAgIC8vIFJlbW92ZSB1bnVzZWQgbGluZXNcbiAgICAgIHNsaWNlTGluZXMuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICAvLyBDcmVhdGUgbmV3IGdyYWRpZW50IGxpbmVzXG4gICAgICBzbGljZUxpbmVzLmVudGVyKCkuYXBwZW5kKCdwYXRoJyk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgbGluZSBwb3NpdGlvbnNcbiAgICAgIHNsaWNlTGluZXMuYXR0cignZCcsIHNsaWNlTGluZWYpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgZnVuY3Rpb24oZCwgaSkge3JldHVybiAnc2xpY2UgY29sb3JicmV3ZXIgcXVhbGl0YXRpdmUtJysoaSsxKTt9KVxuICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAxLjUpO1xuXG4gICAgICAvLyBBZGQgdGhlIGF4aXMgbGFiZWxzIChtYXliZSlcbiAgICAgIGlmKHhMYWJlbCkge1xuICAgICAgICB2YXIgZyA9IGNoYXJ0Q29udGVudC5zZWxlY3QoJy54LmxhYmVsJyk7XG4gICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgKHdpZHRoLW1hcmdpbi5sZWZ0LW1hcmdpbi5yaWdodCkvMiArICcsJyArIChoZWlnaHQtbWFyZ2luLmJvdHRvbSkgKyAnKScpO1xuXG4gICAgICAgIGlmKCFnLnNlbGVjdCgndGV4dCcpWzBdWzBdKSB7XG4gICAgICAgICAgZy5hcHBlbmQoJ3RleHQnKTtcbiAgICAgICAgfVxuICAgICAgICBnLnNlbGVjdCgndGV4dCcpLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGV4dCh4TGFiZWwpO1xuICAgICAgfVxuICAgICAgaWYoeUxhYmVsKSB7XG4gICAgICAgIHZhciBnID0gY2hhcnRDb250ZW50LnNlbGVjdCgnLnkubGFiZWwnKTtcbiAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArKGhlaWdodC1tYXJnaW4udG9wLW1hcmdpbi5ib3R0b20pLzIgKyAnKSByb3RhdGUoLTkwKScpO1xuXG4gICAgICAgIGlmKCFnLnNlbGVjdCgndGV4dCcpWzBdWzBdKSB7XG4gICAgICAgICAgZy5hcHBlbmQoJ3RleHQnKTtcbiAgICAgICAgfVxuICAgICAgICBnLnNlbGVjdCgndGV4dCcpLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZHknLCAnLTRlbScpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGV4dCh5TGFiZWwpO1xuICAgICAgfVxuICAgICAgLy8gVXBkYXRlIHRoZSBheGVzXG4gICAgICBjaGFydENvbnRlbnQuc2VsZWN0KCcueC5heGlzJylcbiAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArIHlTY2FsZS5yYW5nZSgpWzBdICsgJyknKVxuICAgICAgICAgICAgICAgICAgLmNhbGwoeEF4aXMpO1xuICAgICAgY2hhcnRDb250ZW50LnNlbGVjdCgnLnkuYXhpcycpXG4gICAgICAgICAgICAgICAgICAuY2FsbCh5QXhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFydC5tYXJnaW4gPSBmdW5jdGlvbihtKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBtYXJnaW47XG4gICAgfVxuICAgIG1hcmdpbiA9IG07XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LndpZHRoID0gZnVuY3Rpb24odykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gd2lkdGg7XG4gICAgfVxuICAgIHdpZHRoID0gdztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuaGVpZ2h0ID0gZnVuY3Rpb24oaCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH1cbiAgICBoZWlnaHQgPSBoO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC54ID0gZnVuY3Rpb24odmFsRnVuYykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgeCA9IHZhbEZ1bmM7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnkgPSBmdW5jdGlvbih2YWxGdW5jKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB5O1xuICAgIH1cbiAgICB5ID0gdmFsRnVuYztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueFJhbmdlID0gZnVuY3Rpb24ocm5nKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB4UmFuZ2U7XG4gICAgfVxuICAgIGlmKHJuZyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICB4UmFuZ2UgPSBmdW5jdGlvbihkYXRhKSB7cmV0dXJuIHJuZzt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB4UmFuZ2UgPSBybmc7XG4gICAgfVxuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55UmFuZ2UgPSBmdW5jdGlvbihybmcpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHlSYW5nZTtcbiAgICB9XG4gICAgaWYocm5nIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHlSYW5nZSA9IGZ1bmN0aW9uKGRhdGEpIHtyZXR1cm4gcm5nO307XG4gICAgfSBlbHNlIHtcbiAgICAgIHlSYW5nZSA9IHJuZztcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnhMYWJlbCA9IGZ1bmN0aW9uKGwpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHhMYWJlbDtcbiAgICB9XG4gICAgeExhYmVsID0gbDtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueUxhYmVsID0gZnVuY3Rpb24obCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geUxhYmVsO1xuICAgIH1cbiAgICB5TGFiZWwgPSBsO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5yYWRpdXMgPSBmdW5jdGlvbihyKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICBpZihyIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJhZGl1cyA9IHI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhZGl1cyA9IGZ1bmN0aW9uKGQpIHtyZXR1cm4gcjt9O1xuICAgIH1cblxuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5vbkNsaWNrID0gZnVuY3Rpb24oZikge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gb25DbGljaztcbiAgICB9XG4gICAgb25DbGljayA9IGY7XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIHJldHVybiBjaGFydDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTY2F0dGVycGxvdDtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbGluZUFuZ2xlOiBmdW5jdGlvbihjeCwgY3ksIHNsb3BlLCBsaW5lTGVuZ3RoKSB7XG4gICAgdmFyIGR4ID0gbGluZUxlbmd0aCAvICgyKk1hdGguc3FydChzbG9wZSpzbG9wZSArIDEpKTtcbiAgICB2YXIgZHkgPSBzbG9wZSAqIGR4O1xuICAgIHJldHVybiB7XG4gICAgICB4MTogY3ggLSBkeCxcbiAgICAgIHkxOiBjeSAtIGR5LFxuICAgICAgeDI6IGN4ICsgZHgsXG4gICAgICB5MjogY3kgKyBkeVxuICAgIH07XG4gIH1cbn07XG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gWEF4aXMoKSB7XG4gIHZhciBtYXJnaW4gPSB7dG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiAwfSxcbiAgICAgIHdpZHRoID0gNDAwLFxuICAgICAgaGVpZ2h0ID0gNDAsXG4gICAgICB4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKSxcbiAgICAgIHhBeGlzID0gZDMuc3ZnLmF4aXMoKS5vcmllbnQoJ2JvdHRvbScpLFxuICAgICAgeExhYmVsID0gJyc7XG5cbiAgZnVuY3Rpb24gYXhpcyhzZWxlY3Rpb24pIHtcbiAgICAvLyBzZWxlY3Rpb24gbWF5IGJlIG1vcmUgdGhhbiBvbmUgdGhpbmdcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgIC8vIHVwZGF0ZSBzY2FsZXNcbiAgICAgIHZhciB4UmFuZ2UgPSBkYXRhO1xuICAgICAgeFNjYWxlLmRvbWFpbih4UmFuZ2UpXG4gICAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoLW1hcmdpbi5sZWZ0LW1hcmdpbi5yaWdodF0pO1xuICAgICAgeEF4aXMuc2NhbGUoeFNjYWxlKTtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc3ZnIGFuZCBiaW5kIGFsbCBkYXRhIHRvIGl0XG4gICAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIG91dHNpZGUgZGltZW5zaW9uc1xuICAgICAgc3ZnLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxuICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NoYXJ0Jyk7XG5cbiAgICAgIC8vIG5ldyBjaGFydHMgbmVlZCB0byBiZSBjcmVhdGVkXG4gICAgICB2YXIgbmV3Q2hhcnRBcmVhID0gc3ZnLmVudGVyKCkuYXBwZW5kKCdzdmcnKS5hcHBlbmQoJ2cnKTtcbiAgICAgIG5ld0NoYXJ0QXJlYS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd4IGF4aXMnKTtcbiAgICAgIGlmKHhMYWJlbCkge1xuICAgICAgICBuZXdDaGFydEFyZWEuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBsYWJlbCcpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hhcnRDb250ZW50ID0gc3ZnLnNlbGVjdCgnZycpO1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIGlubmVyIGRpbWVuc2lvbnNcbiAgICAgIGNoYXJ0Q29udGVudC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBtYXJnaW4ubGVmdCArICcsJyArIG1hcmdpbi50b3AgKyAnKScpO1xuXG4gICAgICAvLyBBZGQgdGhlIGF4aXMgbGFiZWxzIChtYXliZSlcbiAgICAgIGlmKHhMYWJlbCkge1xuICAgICAgICB2YXIgZyA9IGNoYXJ0Q29udGVudC5zZWxlY3QoJy54LmxhYmVsJyk7XG4gICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgKHdpZHRoLW1hcmdpbi5sZWZ0LW1hcmdpbi5yaWdodCkvMiArICcsJyArIGhlaWdodCArICcpJyk7XG5cbiAgICAgICAgaWYoIWcuc2VsZWN0KCd0ZXh0JylbMF1bMF0pIHtcbiAgICAgICAgICBnLmFwcGVuZCgndGV4dCcpO1xuICAgICAgICB9XG4gICAgICAgIGcuc2VsZWN0KCd0ZXh0JykuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsICctMWVtJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KHhMYWJlbCk7XG4gICAgICB9XG4gICAgICAvLyBVcGRhdGUgdGhlIGF4ZXNcbiAgICAgIGlmKHhBeGlzKSB7XG4gICAgICAgIGNoYXJ0Q29udGVudC5zZWxlY3QoJy54LmF4aXMnKVxuICAgICAgICAgICAgICAgICAgICAvLy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArIChoZWlnaHQtbWFyZ2luLmJvdHRvbS1tYXJnaW4udG9wKSArICcpJylcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoeEF4aXMpO1xuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgfVxuXG4gIGF4aXMubWFyZ2luID0gZnVuY3Rpb24obSkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbWFyZ2luO1xuICAgIH1cbiAgICBtYXJnaW4gPSBtO1xuICAgIHJldHVybiBheGlzO1xuICB9O1xuXG4gIGF4aXMud2lkdGggPSBmdW5jdGlvbih3KSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9XG4gICAgd2lkdGggPSB3O1xuICAgIHJldHVybiBheGlzO1xuICB9O1xuXG4gIGF4aXMuaGVpZ2h0ID0gZnVuY3Rpb24oaCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH1cbiAgICBoZWlnaHQgPSBoO1xuICAgIHJldHVybiBheGlzO1xuICB9O1xuXG4gIGF4aXMueCA9IGZ1bmN0aW9uKHZhbEZ1bmMpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIHggPSB2YWxGdW5jO1xuICAgIHJldHVybiBheGlzO1xuICB9O1xuXG4gIGF4aXMueSA9IGZ1bmN0aW9uKHZhbEZ1bmMpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHk7XG4gICAgfVxuICAgIHkgPSB2YWxGdW5jO1xuICAgIHJldHVybiBheGlzO1xuICB9O1xuXG4gIGF4aXMueEF4aXMgPSBmdW5jdGlvbihheGlzKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB4QXhpcztcbiAgICB9XG4gICAgeEF4aXMgPSBheGlzO1xuICAgIHJldHVybiBheGlzO1xuICB9O1xuXG4gIHJldHVybiBheGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBYQXhpcztcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWFjaGluYSA9IHJlcXVpcmUoJ21hY2hpbmEnKTtcbnZhciByb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcycpO1xudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBhcGlIb3N0ID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnJykuYXBpSG9zdDtcbnZhciBtb3VzZVRyYWNraW5nID0gcmVxdWlyZSgnLi9pbnN0cnVtZW50YXRpb24vbW91c2UnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWcnKTtcblxuJC51cmxQYXJhbSA9IGZ1bmN0aW9uKG5hbWUpe1xuXHR2YXIgcmVzdWx0cyA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIG5hbWUgKyAnPShbXiYjXSopJykuZXhlYyh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cdGlmICghcmVzdWx0cykgeyByZXR1cm4gMDsgfVxuXHRyZXR1cm4gcmVzdWx0c1sxXSB8fCAwO1xufTtcblxuLy8gVE9ETzogaGFuZGxlIGVycm9ycyBmb3IgbWlzc2luZyB0dXJrIGlkXG52YXIgc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBtYWNoaW5hLkZzbSh7XG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICByb3V0ZXIuaW5pdCgpO1xuICAgIH0sXG5cbiAgICBpbnZlc3RpbmdTdGVwOiAxLFxuICAgIHR1cmtJZDogbnVsbCxcblxuICAgIGluaXRpYWxTdGF0ZTogJ3dlbGNvbWUnLFxuXG4gICAgc3RhdGVzOiB7XG4gICAgICAnd2VsY29tZSc6IHtcbiAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciB0dXJrSWQgPSAkLnVybFBhcmFtKCd3b3JrZXJJZCcpO1xuICAgICAgICAgIHR1cmtJZCA9IHR1cmtJZDtcbiAgICAgICAgICB0aGlzLnR1cmtJZCA9IHR1cmtJZDtcbiAgICAgICAgICB2YXIgYXNzaWdubWVudElkID0gJC51cmxQYXJhbSgnYXNzaWdubWVudElkJyk7XG4gICAgICAgICAgYXNzaWdubWVudElkID0gYXNzaWdubWVudElkID8gYXNzaWdubWVudElkIDogJ0FTU0lHTk1FTlRfSURfTk9UX0FWQUlMQUJMRSc7XG5cdFx0XHRcdFx0dGhpcy5hc3NpZ25tZW50SWQgPSBhc3NpZ25tZW50SWQ7XG4gICAgICAgICAgcm91dGVyLnR1cmtJZCh0dXJrSWQpO1xuXHRcdFx0XHRcdHJvdXRlci5hc3NpZ25tZW50SWQoYXNzaWdubWVudElkKTtcblx0XHRcdFx0XHRpZihhc3NpZ25tZW50SWQgPT09ICdBU1NJR05NRU5UX0lEX05PVF9BVkFJTEFCTEUnKSB7XG5cdFx0XHRcdFx0XHRyb3V0ZXIuZ290bygnL3ByZXZpZXcnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuICAgICAgICAgICAgcm91dGVyLmdvdG8oJy93ZWxjb21lJyk7XG5cdFx0XHRcdCAgfVxuICAgICAgICB9LFxuICAgICAgICBiZWdpblRlc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMudHJhbnNpdGlvbignZGVtb2dyYXBoaWNzJyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnZGVtb2dyYXBoaWNzJzoge1xuICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcm91dGVyLmdvdG8oJy9kZW1vZ3JhcGhpY3MnKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9ybVN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0ICByb3V0ZXIudGVzdFR5cGUoZGF0YS5pbnRlcmZhY2VOYW1lKTtcbiAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oJ2luc3RydWN0aW9ucycpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ2ZpbkxpdGVyYWN5Jzoge1xuICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcm91dGVyLmdvdG8oJy9saXRlcmFjeScpO1xuICAgICAgICB9LFxuICAgICAgICBmb3JtU3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy50cmFuc2l0aW9uKCduZWVkRm9yQ29nbml0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnbmVlZEZvckNvZ25pdGlvbic6IHtcbiAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJvdXRlci5nb3RvKCcvbmVlZF9mb3JfY29nbml0aW9uJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1TdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oJ2ZlZWRiYWNrJyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cdFx0XHQnaW5zdHJ1Y3Rpb25zJzoge1xuXHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cm91dGVyLmdvdG8oJy9pbnN0cnVjdGlvbnMnKTtcblx0XHRcdFx0fSxcbiAgICAgICAgaW5zdHJ1Y3Rpb25zUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy50cmFuc2l0aW9uKCdwcmV0ZXN0Jyk7XG4gICAgICAgIH1cblx0XHRcdH0sXG5cdFx0XHQncHJldGVzdCc6IHtcbiAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciB1cmwgPSAgJy9wcmV0ZXN0Jztcblx0XHRcdFx0XHRyb3V0ZXIucHJpbmNpcGFsKDEwMDAwKTtcbiAgICAgICAgICByb3V0ZXIuZ290byh1cmwpO1xuICAgICAgICB9LFxuICAgICAgICBmb3JtU3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGlmKGRhdGEuYXBwcm92ZWQpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbignaW52ZXN0aW5nJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbignZmFpbGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cdFx0XHR9LFxuICAgICAgJ2ludmVzdGluZyc6IHtcbiAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmKCFjb25maWcucHJvZHVjdGlvbikge1xuXHRcdFx0XHRcdCAgcm91dGVyLnRlc3RUeXBlKGNvbmZpZy5kZWJ1Z0ludlRlc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgdXJsID0gICcvdGVzdC8nICsgdGhpcy5pbnZlc3RpbmdTdGVwO1xuXHRcdFx0XHRcdGlmKHRoaXMuaW52ZXN0aW5nU3RlcCA9PT0gMSkge1xuXHRcdFx0XHRcdFx0cm91dGVyLnByaW5jaXBhbCgxMDAwMCk7XG5cdFx0XHRcdFx0fVxuICAgICAgICAgIHJvdXRlci5nb3RvKHVybCk7XG4gICAgICAgIH0sXG5cdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG1vdXNlVHJhY2tpbmcuc3RvcCgpO1xuXHRcdFx0XHR9LFxuICAgICAgICBmb3JtU3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHQgIHJvdXRlci5wcmluY2lwYWwoZGF0YS5yZW1haW5pbmdDYXNoKTtcblx0XHRcdFx0XHRyb3V0ZXIucmV0dXJucyhkYXRhLnJldHVybnMpO1xuICAgICAgICAgIGlmKHRoaXMuaW52ZXN0aW5nU3RlcCA9PT0gNSB8fCByb3V0ZXIucHJpbmNpcGFsKCkgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbigncXVhbGlmaWNhdGlvbicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmludmVzdGluZ1N0ZXAgKz0gMTtcbiAgICAgICAgICAgIHZhciB1cmwgPSAgJy90ZXN0LycgKyB0aGlzLmludmVzdGluZ1N0ZXA7XG4gICAgICAgICAgICByb3V0ZXIuZ290byh1cmwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblx0XHRcdCdxdWFsaWZpY2F0aW9uJzoge1xuICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcm91dGVyLmdvdG8oJy9xdWFsaWZpY2F0aW9uJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1TdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oJ2NvbmZpZGVuY2UnKTtcbiAgICAgICAgfVxuXHRcdFx0fSxcbiAgICAgICdjb25maWRlbmNlJzoge1xuICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcm91dGVyLmdvdG8oJy9jb25maWRlbmNlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1TdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oJ2ZpbkxpdGVyYWN5Jyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnZmVlZGJhY2snOiB7XG4gICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByb3V0ZXIuZ290bygnL2ZlZWRiYWNrJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1TdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oJ2RvbmUnKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdkb25lJzoge1xuICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcm91dGVyLmdvdG8oJy9kb25lJyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnZmFpbGVkJzoge1xuICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcm91dGVyLmdvdG8oJy9mYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBtb2R1bGUuZXhwb3J0cy5mc20gPSBzdGFydCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZzbTogbnVsbCxcbiAgaW5pdDogaW5pdFxufTtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG53aW5kb3cuUGFyc2xleUNvbmZpZyA9IHtcbiAgdmFsaWRhdG9yczoge1xuICAgIG11c3RlcXVhbDoge1xuICAgICAgZm46IGZ1bmN0aW9uKHZhbHVlLCByZXF1aXJlbWVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gcGFyc2VGbG9hdChyZXF1aXJlbWVudCksXG4gICAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICB0YXJnZXQgPSBNYXRoLnJvdW5kKHRhcmdldCoxMDApLzEwMDtcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKjEwMCkvMTAwO1xuICAgICAgICAvL3ZhciB2YWxpZCA9IHZhbCA9PT0gdGFyZ2V0O1xuICAgICAgICByZXR1cm4gdmFsdWUgPT09IHRhcmdldDtcbiAgICAgIH0sXG4gICAgICBwcmlvcml0eTogMzJcbiAgICB9XG4gIH0sXG4gIG1lc3NhZ2VzOiB7XG4gICAgbXVzdGVxdWFsOiAnVGhpcyB2YWx1ZSBtdXN0IGVxdWFsICVzJ1xuICB9LFxuICBleGNsdWRlZDogJ2lucHV0W3R5cGU9YnV0dG9uXSwgaW5wdXRbdHlwZT1zdWJtaXRdLCBpbnB1dFt0eXBlPXJlc2V0XScsXG4gIGlucHV0czogJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBpbnB1dFt0eXBlPWhpZGRlbl0nXG59O1xuXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xudmFyIHBhcnNsZXkgPSByZXF1aXJlKCdwYXJzbGV5anMnKTtcbnZhciB0aW1pbmcgPSByZXF1aXJlKCcuL2luc3RydW1lbnRhdGlvbi90aW1pbmcnKTtcbnZhciBkcyA9IHJlcXVpcmUoJy4vdmlld19tb2RlbHMvZGF0YV9zdG9yZScpO1xuXG4kLmxpc3RlbigncGFyc2xleTpmb3JtOnZhbGlkYXRlJywgZnVuY3Rpb24oZm9ybSkge1xuICBmb3JtLnN1Ym1pdEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGlmKGZvcm0uaXNWYWxpZCgpKSB7XG4gICAgLy8gSW5kaWNhdGUgdGhhdCB3ZSdyZSBzdWJtaXR0aW5nXG4gICAgdmFyIHN1Ym1pdEJ1dHRvbiA9ICQoZm9ybS4kZWxlbWVudCkuZmluZCgnYnV0dG9uW3R5cGU9c3VibWl0XScpXG4gICAgdmFyIG9sZEJ1dHRvblRleHQgPSBzdWJtaXRCdXR0b24udGV4dCgpO1xuICAgIHN1Ym1pdEJ1dHRvbi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgc3VibWl0QnV0dG9uLnRleHQoJ1N1Ym1pdHRpbmcuLi4nKTtcblxuICAgIC8vIFN1Ym1pdCB0aGUgdGltaW5nIGRhdGFcbiAgICBpZihmb3JtLiRlbGVtZW50LmRhdGEoJ3RpbWluZycpKSB7XG4gICAgICB0aW1pbmcuc3RvcCgpO1xuICAgICAgdmFyIHR1cmtJZCA9ICQoJ2lucHV0W25hbWU9dHVya19pZF0nKS52YWwoKTtcbiAgICAgIHZhciBzdGVwID0gJCgnaW5wdXRbbmFtZT1zdGVwXScpLnZhbCgpO1xuICAgICAgdGltaW5nLnNhdmUodHVya0lkLCBzdGVwKTtcbiAgICB9XG5cbiAgICAvLyBTdWJtaXQgdGhlIGZvcm1cbiAgICB2YXIgZmxvdyA9IHJlcXVpcmUoJy4vZmxvdycpO1xuICAgIHZhciBzZXJ2aWNlID0gZm9ybS4kZWxlbWVudC5hdHRyKCdhY3Rpb24nKS5zbGljZSg1KTtcbiAgICAvL3ZhciBkYXRhID0gZHMuYWRkRGF0YShzZXJ2aWNlLCBmb3JtLiRlbGVtZW50LnNlcmlhbGl6ZSgpKTtcbiAgICB2YXIgZm9ybUlucHV0cyA9IGZvcm0uJGVsZW1lbnQuc2VyaWFsaXplQXJyYXkoKTtcbiAgICB2YXIgZm9ybURhdGEgPSB7fTtcbiAgICBmb3JtSW5wdXRzLmZvckVhY2goZnVuY3Rpb24oaXAsIGkpIHtcbiAgICAgIGZvcm1EYXRhW2lwLm5hbWVdID0gaXAudmFsdWU7XG4gICAgfSk7XG4gICAgdmFyIGRhdGEgPSBkcy5hZGREYXRhKHNlcnZpY2UsIGZvcm1EYXRhKTtcbiAgICBmbG93LmZzbS5oYW5kbGUoJ2Zvcm1TdWNjZXNzJywgZGF0YSk7XG4gIH1cblxufSk7XG5cbnZhciBpbml0Rm9ybSA9IGZ1bmN0aW9uKHR1cmtJZCwgYXNzaWdubWVudElkLCBzdGVwKSB7XG4gICQoJ2lucHV0W25hbWU9dHVya19pZF0nKS52YWwodHVya0lkKTtcbiAgJCgnaW5wdXRbbmFtZT1hc3NpZ25tZW50X2lkXScpLnZhbChhc3NpZ25tZW50SWQpO1xuICAkKCdpbnB1dFtuYW1lPXN0ZXBdJykudmFsKHN0ZXApO1xuXG4gICQoJ2Zvcm0nKS5wYXJzbGV5KCk7XG4gIGlmKCQoJ2Zvcm0nKS5kYXRhKCd0aW1pbmcnKSkge1xuICAgIHRpbWluZy5zdGFydCgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRGb3JtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG52YXIgaW5pdEluc3RydWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAkKCcjbmV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBmbG93ID0gcmVxdWlyZSgnLi9mbG93Jyk7XG4gICAgZmxvdy5mc20uaGFuZGxlKCdpbnN0cnVjdGlvbnNSZWFkJyk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbml0SW5zdHJ1Y3Rpb25zO1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdnZXRwYXRoJyk7XG52YXIgZHMgPSByZXF1aXJlKCcuLi92aWV3X21vZGVscy9kYXRhX3N0b3JlJyk7XG52YXIgbnVtZXJpYyA9IHJlcXVpcmUoJ251bWVyaWMnKTtcbnJlcXVpcmUoJ2ZvdW5kYXRpb24nKTtcblxuLy8gVGhlc2UgYXJlIHVzZWQgdG8gdHJhY2sgZm9yIGRpcmVjdGlvbiBjaGFuZ2VzXG52YXIgbGFzdE1vdXNlTW92ZTEsIGxhc3RNb3VzZU1vdmUyO1xuXG5mdW5jdGlvbiBkZWNvZGVFdmVudChlKSB7XG4gIGlmKGUudHlwZSAhPT0gJ21vdXNlbW92ZScpIHtcbiAgICBsYXN0TW91c2VNb3ZlMSA9IG51bGw7XG4gICAgbGFzdE1vdXNlTW92ZTIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICB4OiBlLnBhZ2VYLFxuICAgICAgeTogZS5wYWdlWSxcbiAgICAgIGV2ZW50X3R5cGU6IGUudHlwZSxcbiAgICAgIHRpbWU6IGUudGltZVN0YW1wLFxuICAgICAgYnV0dG9uOiBlLndoaWNoLFxuICAgICAgdGFyZ2V0OiAkKGUudGFyZ2V0KS5hdHRyKCdpZCcpIHx8XG4gICAgICAgICAgICAgICQoZS50YXJnZXQpLmF0dHIoJ25hbWUnKSB8fFxuICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5nZXRQYXRoKClcbiAgICB9O1xuICB9IGVsc2UgaWYoZS53aGljaCkgeyAvLyBvbmx5IHByb2Nlc3MgaWYgdGhlIGJ1dHRvbiBpcyBkb3duXG4gICAgaWYobGFzdE1vdXNlTW92ZTEgPT0gbnVsbCkge1xuICAgICAgbGFzdE1vdXNlTW92ZTEgPSBlO1xuICAgIH0gZWxzZSBpZiAobGFzdE1vdXNlTW92ZTIgPT0gbnVsbCkge1xuICAgICAgbGFzdE1vdXNlTW92ZTIgPSBlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXaGVyZSB0aGUgbWFnaWMgaGFwcGVuc1xuICAgICAgdmFyIHYxID0gW2xhc3RNb3VzZU1vdmUyLnBhZ2VYLWxhc3RNb3VzZU1vdmUxLnBhZ2VYLFxuICAgICAgICAgICAgICAgIGxhc3RNb3VzZU1vdmUyLnBhZ2VZLWxhc3RNb3VzZU1vdmUxLnBhZ2VZXTtcbiAgICAgIHZhciB2MiA9IFtlLnBhZ2VYLWxhc3RNb3VzZU1vdmUyLnBhZ2VYLFxuICAgICAgICAgICAgICAgIGUucGFnZVktbGFzdE1vdXNlTW92ZTIucGFnZVldO1xuICAgICAgbGFzdE1vdXNlTW92ZTEgPSBsYXN0TW91c2VNb3ZlMjtcbiAgICAgIGxhc3RNb3VzZU1vdmUyID0gZTtcbiAgICAgIGlmKG51bWVyaWMuZG90KHYxLCB2MikgPD0gMCkge1xuICAgICAgICByZXR1cm4gZGVjb2RlRXZlbnQoe1xuICAgICAgICAgIHBhZ2VYOiBlLnBhZ2VYLFxuICAgICAgICAgIHBhZ2VZOiBlLnBhZ2VZLFxuICAgICAgICAgIHR5cGU6ICdtb3VzZWRpcmNoYW5nZScsXG4gICAgICAgICAgdGltZVN0YW1wOiBlLnRpbWVTdGFtcCxcbiAgICAgICAgICB3aGljaDogZS53aGljaCxcbiAgICAgICAgICB0YXJnZXQ6IGUudGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG52YXIgdHJhY2tFdmVudHMgPSBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcsICdjbGljaycsICdkYmxjbGljayddO1xuXG52YXIgc2F2ZWRFdmVudHMgPSBbXTtcblxuZnVuY3Rpb24gc2F2ZUV2ZW50KGUsIHR1cmtJZCwgc3RlcCkge1xuICB2YXIgZGUgPSBkZWNvZGVFdmVudChlKTtcbiAgLy8gb25seSBzYXZlIGV2ZW50cyB3aGVuIHRoZSBtb3VzZSBidXR0b24gaXMgZG93blxuICBpZihkZSAhPSBudWxsICYmIGRlLmJ1dHRvbikgeyBcbiAgICBzYXZlZEV2ZW50cy5wdXNoKGRlKTtcbiAgICAvLyBvbmx5IHNlbmQgZXZlbnRzIHdoZW4gdGhlIHVzZXIgaXMgZG9uZSB3aXRoIHRoZSBtb3VzZVxuICAgIGlmKGRlLmV2ZW50X3R5cGUgPT09ICdtb3VzZXVwJyB8fCBcbiAgICAgICBkZS5ldmVudF90eXBlID09PSAnY2xpY2snIHx8IFxuICAgICAgIGRlLmV2ZW50X3R5cGUgPT09ICdkYmxjbGljaycpIHtcbiAgICAgIHZhciBldnREYXRhID0ge1xuICAgICAgICB0dXJrSWQ6IHR1cmtJZCxcbiAgICAgICAgc3RlcDogc3RlcCxcbiAgICAgICAgZXZlbnRzOiBzYXZlZEV2ZW50c1xuICAgICAgfTtcbiAgICAgIGRzLmFkZE1vdXNlRGF0YShldnREYXRhKTtcbiAgICAgIHNhdmVkRXZlbnRzID0gW107XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0KHR1cmtJZCwgc3RlcCkge1xuICB0cmFja0V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHRlKSB7XG4gICAgJChkb2N1bWVudCkub24odGUsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmKHRlPT09J21vdXNlbW92ZScpIHtcbiAgICAgICAgRm91bmRhdGlvbi51dGlscy50aHJvdHRsZShzYXZlRXZlbnQoZSwgdHVya0lkLCBzdGVwKSwgMjUwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhdmVFdmVudChlLCB0dXJrSWQsIHN0ZXApO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc3RvcCgpIHtcbiAgdHJhY2tFdmVudHMuZm9yRWFjaChmdW5jdGlvbih0ZSkge1xuICAgICQoZG9jdW1lbnQpLm9mZih0ZSk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RhcnQ6IHN0YXJ0LFxuICBzdG9wOiBzdG9wXG59O1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkcyA9IHJlcXVpcmUoJy4uL3ZpZXdfbW9kZWxzL2RhdGFfc3RvcmUnKTtcblxudmFyIHN0YXJ0VGltZSA9IDA7XG52YXIgZW5kVGltZSA9IDA7XG5cbnZhciBzdGFydCA9IGZ1bmN0aW9uKCkge1xuICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn07XG5cbnZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG4gIGVuZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn07XG5cbnZhciBzYXZlID0gZnVuY3Rpb24odHVya0lkLCBzdGVwKSB7XG4gIHZhciB0b3RhbFRpbWUgPSBlbmRUaW1lIC0gc3RhcnRUaW1lO1xuICB2YXIgdGltaW5nRGF0YSA9IHtcbiAgICB0dXJrSWQ6IHR1cmtJZCxcbiAgICBzdGVwOiBzdGVwLFxuICAgIHRvdGFsVGltZTogdG90YWxUaW1lXG4gIH07XG4gIGRzLmFkZERhdGEoJ3RpbWluZy0nICsgc3RlcCwgdGltaW5nRGF0YSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RhcnQ6IHN0YXJ0LFxuICBzdG9wOiBzdG9wLFxuICBzYXZlOiBzYXZlXG59OyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKlxuICogc2NyaXB0cy9tYWluLmpzXG4gKlxuICogVGhpcyBpcyB0aGUgc3RhcnRpbmcgcG9pbnQgZm9yIHlvdXIgYXBwbGljYXRpb24uXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmdsb2JhbC5Nb2Rlcm5penIgPSByZXF1aXJlKCdicm93c2Vybml6cicpO1xuXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG52YXIgZmxvdyA9IHJlcXVpcmUoJy4vZmxvdycpO1xuXG5yZXF1aXJlKCdmb3VuZGF0aW9uJyk7XG4vL3JlcXVpcmUoJ3BhcnNsZXlqcycpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgLy8gaW5pdGlhbGl6ZSBmb3VuZGF0aW9uXG4gICQoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcblxuICAvLyBzdGFydCB0aGUgZnNtXG4gIGZsb3cuaW5pdCgpO1xuICB2YXIgZnNtID0gZmxvdy5mc207XG5cbiAgaWYoXCJkZXZlbG9wbWVudFwiICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAgIC8vIEFkZCB0aGUgbmF2aWdhdGlvbiBtZW51XG4gICAgZm9yKHZhciBzdGF0ZSBpbiBmc20uc3RhdGVzKSB7XG4gICAgICBpZihmc20uc3RhdGVzLmhhc093blByb3BlcnR5KHN0YXRlKSkge1xuICAgICAgICB2YXIgZSA9ICQoJzxsaT48YT4nICsgc3RhdGUgKyAnPC9hPjwvbGk+Jyk7XG4gICAgICAgIGUuc2VsZWN0KCdhJykub24oJ2NsaWNrJywge3N0YXRlOiBzdGF0ZX0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBmc20udHJhbnNpdGlvbihlLmRhdGEuc3RhdGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgndWwuc3RhdGUtbmF2JykuYXBwZW5kKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIga28gPSByZXF1aXJlKCdrbm9ja291dCcpO1xudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxudmFyIGluaXRQb3J0Zm9saW8gPSBmdW5jdGlvbih0dXJrSWQsIHBhcikge1xuICB2YXIgUG9ydGZvbGlvID0gcmVxdWlyZSgnLi92aWV3X21vZGVscy9wb3J0Zm9saW8nKTtcbiAgdmFyIFNjYXR0ZXJwbG90ID0gcmVxdWlyZSgnLi9jaGFydHMvc2NhdHRlcnBsb3QnKTtcbiAgdmFyIFNlbnNpdGl2aXR5U1AgPSByZXF1aXJlKCcuL2NoYXJ0cy9sb2NhbF9zYV9zY2F0dGVycGxvdCcpO1xuICB2YXIgU2xpY2VTUCA9IHJlcXVpcmUoJy4vY2hhcnRzL3NsaWNlX3NhX3NjYXR0ZXJwbG90Jyk7XG4gIHZhciBCYXJDaGFydCA9IHJlcXVpcmUoJy4vY2hhcnRzL2JhcicpO1xuICB2YXIgWEF4aXMgPSByZXF1aXJlKCcuL2NoYXJ0cy94X0F4aXMnKTtcbiAgdmFyIEdyYWRpZW50QW5nbGUgPSByZXF1aXJlKCcuL2NoYXJ0cy9hbmdsZV9saW5lJyk7XG4gIHZhciBTcGFya2xpbmUgPSByZXF1aXJlKCcuL2NoYXJ0cy9zbCcpO1xuXG4gIHZhciBwb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvKHBhcik7XG4gIHZhciBncmFkQmFyID0gbmV3IEJhckNoYXJ0KCk7XG4gIHZhciBncmFkQmFyWEF4aXMgPSBuZXcgWEF4aXMoKTtcbiAgdmFyIGdyYWRBbmdsZSA9IG5ldyBHcmFkaWVudEFuZ2xlKCk7XG4gIHZhciBzcGFya2xpbmUgPSBuZXcgU3BhcmtsaW5lKCk7XG5cbiAgLy8gU2VlIGlmIHdlIHNob3VsZCBhZGQgbG9jYWwgU0EgdG8gdGhlIHJpc2svcmV0dXJuIHZpZXdcbiAgdmFyIHJpc2tSZXR1cm4gPSBudWxsO1xuICBpZigkKCcjcG9ydGZvbGlvLXN0YXRzJykuaGFzQ2xhc3MoJ2xvY2FsLXNhJykpIHtcbiAgICByaXNrUmV0dXJuID0gbmV3IFNlbnNpdGl2aXR5U1AoKTtcbiAgICByaXNrUmV0dXJuLmxpbmVMZW5ndGgoNjApO1xuICB9IGVsc2UgaWYoJCgnI3BvcnRmb2xpby1zdGF0cycpLmhhc0NsYXNzKCdzbGljZS1zYScpKSB7XG4gICAgcmlza1JldHVybiA9IG5ldyBTbGljZVNQKCk7XG4gIH0gZWxzZSB7XG4gICAgcmlza1JldHVybiA9IG5ldyBTY2F0dGVycGxvdCgpO1xuICB9XG5cbiAgcmlza1JldHVybi5vbkNsaWNrKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICBpZihkLmFsbG9jcykge1xuICAgICAgZC5hbGxvY3MuZm9yRWFjaChmdW5jdGlvbihhLCBpKSB7cG9ydGZvbGlvLnN0b2Nrc1tpXS5hbGxvY2F0aW9uKDApO30pO1xuICAgICAgZC5hbGxvY3MuZm9yRWFjaChmdW5jdGlvbihhLCBpKSB7cG9ydGZvbGlvLnN0b2Nrc1tpXS5hbGxvY2F0aW9uKGEpO30pO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gVGhlc2UgcGFyYW1zIGFyZSB0aGUgc2FtZSBmb3IgYm90aCBjaGFydHNcbiAgcmlza1JldHVybi5tYXJnaW4oe3RvcDogNDAsIGJvdHRvbTogNDUsIGxlZnQ6IDU1LCByaWdodDogNDB9KVxuICAgICAgICAgICAgLndpZHRoKDQwMClcbiAgICAgICAgICAgIC5oZWlnaHQoMzkwKVxuICAgICAgICAgICAgLngoZnVuY3Rpb24oZCkge3JldHVybiBkLmV4cFJpc2s7fSlcbiAgICAgICAgICAgIC55KGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5leHBSZXR1cm47fSlcbiAgICAgICAgICAgIC54TGFiZWwoJ1Jpc2sgKDUlIGNoYW5jZSBvZiBsb3NpbmcgJCknKVxuICAgICAgICAgICAgLnlMYWJlbCgnUmV0dXJuICgkKScpXG4gICAgICAgICAgICAueFJhbmdlKFswLCAxNjVdKVxuICAgICAgICAgICAgLnlSYW5nZShbMCwgMTY1XSlcbiAgICAgICAgICAgIC5yYWRpdXMoOCk7XG5cbiAgZ3JhZEJhci5tYXJnaW4oe3RvcDogMCwgYm90dG9tOiAwLCBsZWZ0OiAxMCwgcmlnaHQ6IDEwfSlcbiAgICAgICAgIC55QXhpcyhncmFkQmFyLnlBeGlzKCkudGlja1NpemUoMykpXG4gICAgICAgICAueFJhbmdlKFswLCAyMDBdKVxuICAgICAgICAgLndpZHRoKDY1KVxuICAgICAgICAgLmhlaWdodCgyNCk7XG4gIGdyYWRCYXJYQXhpcy5tYXJnaW4oe3RvcDogMCwgYm90dG9tOiAwLCBsZWZ0OiAxMCwgcmlnaHQ6IDEwfSlcbiAgICAgICAgIC53aWR0aCg2NSlcbiAgICAgICAgIC5oZWlnaHQoMjQpO1xuXG4gIGdyYWRBbmdsZS5tYXJnaW4oe3RvcDogNSwgcmlnaHQ6IDEwLCBib3R0b206IDM1LCBsZWZ0OiA0NX0pXG4gICAgICAgICAgIC53aWR0aCgxMjApXG4gICAgICAgICAgIC5oZWlnaHQoMTA1KVxuICAgICAgICAgICAueChmdW5jdGlvbihkKSB7cmV0dXJuIGQuZXhwUmlzazt9KVxuICAgICAgICAgICAueShmdW5jdGlvbihkKSB7cmV0dXJuIGQuZXhwUmV0dXJuO30pXG4gICAgICAgICAgIC54TGFiZWwoJ1Jpc2snKVxuICAgICAgICAgICAueUxhYmVsKCdSZXR1cm4nKVxuICAgICAgICAgICAubGluZUxlbmd0aCgxKTtcblxuICBzcGFya2xpbmUubWFyZ2luKHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMTAsIGxlZnQ6IDEwfSlcbiAgICAgICAgICAgLmhlaWdodCg1MClcbiAgICAgICAgICAgLnhSYW5nZShbMCwgcGFyXSlcbiAgICAgICAgICAgLnhMYWJlbCgnSW52ZXN0bWVudCcpXG4gICAgICAgICAgIC54QXhpcyhzcGFya2xpbmUueEF4aXMoKS50aWNrU2l6ZSgzKS50aWNrcyg1KSlcbiAgICAgICAgICAgLnlBeGlzKHNwYXJrbGluZS55QXhpcygpLnRpY2tTaXplKDMpLnRpY2tzKDMpKTtcblxuICAvLyBVc2UgYSBiaW5kaW5nIGZvciB1cGRhdGluZyB0aGUgY2hhcnRcbiAga28uYmluZGluZ0hhbmRsZXJzLnBvaW50cyA9IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgIHZhciBkYXRhID0ga28udW53cmFwKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICBkMy5zZWxlY3QoZWxlbWVudClcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKHJpc2tSZXR1cm4pO1xuICAgIH1cbiAgfTtcblxuICBrby5iaW5kaW5nSGFuZGxlcnMuYWxsb2NTbGljZSA9IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgIHZhciBkYXRhID0ga28udW53cmFwKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICBkMy5zZWxlY3QoZWxlbWVudClcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKHJpc2tSZXR1cm4pO1xuICAgIH1cbiAgfTtcblxuICBrby5iaW5kaW5nSGFuZGxlcnMuZ3JhZEJhcldpZHRoID0ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgdmFyIGRhdGEgPSBrby51bndyYXAodmFsdWVBY2Nlc3NvcigpKTtcbiAgICAgIHZhciB0bXAgPSBbZGF0YV07XG4gICAgICB2YXIgcGFyZW50cyA9ICQoZWxlbWVudCkucGFyZW50cygpO1xuICAgICAgXG4gICAgICAvLyBBZGQgdGhlIGV4cCByaXNrIGFuZCByZXR1cm4gYXhlc1xuICAgICAgZ3JhZEJhclhBeGlzLnhBeGlzKGQzLnN2Zy5heGlzKCkub3JpZW50KCdib3R0b20nKS50aWNrU2l6ZSgzKS50aWNrVmFsdWVzKFswLCAxMDAsIDIwMF0pKTtcbiAgICAgIGQzLnNlbGVjdCgnLmV4cHJldHVybi1heGlzJylcbiAgICAgICAgLmRhdHVtKFswLCAyMDBdKVxuICAgICAgICAuY2FsbChncmFkQmFyWEF4aXMpO1xuICAgICAgZ3JhZEJhclhBeGlzLnhBeGlzKGQzLnN2Zy5heGlzKCkub3JpZW50KCdib3R0b20nKS50aWNrU2l6ZSgzKS50aWNrVmFsdWVzKFswLCAxMDAsIDIwMF0pKTtcbiAgICAgIGQzLnNlbGVjdCgnLmV4cHJpc2stYXhpcycpXG4gICAgICAgIC5kYXR1bShbMCwgMjAwXSlcbiAgICAgICAgLmNhbGwoZ3JhZEJhclhBeGlzKTtcblxuICAgICAgZDMuc2VsZWN0KGVsZW1lbnQpXG4gICAgICAgIC5kYXR1bSh0bXApXG4gICAgICAgIC5jYWxsKGdyYWRCYXIpO1xuICAgIH1cbiAgfTtcblxuICBrby5iaW5kaW5nSGFuZGxlcnMuZ3JhZEFuZ2xlID0ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgdmFyIGRhdGEgPSBrby51bndyYXAodmFsdWVBY2Nlc3NvcigpKTtcbiAgICAgIGQzLnNlbGVjdChlbGVtZW50KVxuICAgICAgICAuZGF0dW0oW2RhdGFdKVxuICAgICAgICAuY2FsbChncmFkQW5nbGUpO1xuICAgIH1cbiAgfTtcblxuICBrby5iaW5kaW5nSGFuZGxlcnMuc3BhcmtsaW5lID0ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgaWYoJChlbGVtZW50KS5oYXNDbGFzcygnbmFycm93JykpIHtcbiAgICAgICAgc3BhcmtsaW5lLndpZHRoKDE1MClcbiAgICAgICAgaWYoJChlbGVtZW50KS5oYXNDbGFzcygncmV0dXJuJykpIHtcbiAgICAgICAgICBzcGFya2xpbmUueVJhbmdlKFsxMzAsIDE2MF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNwYXJrbGluZS55UmFuZ2UoWzUwLCAxMTBdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3BhcmtsaW5lLndpZHRoKDMwMClcbiAgICAgICAgICAgICAgICAgLnlSYW5nZShbMS4yLCAyLjVdKTtcbiAgICAgIH1cbiAgICAgIHZhciBkYXRhID0ga28udW53cmFwKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICBzcGFya2xpbmUub25EcmFnKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuICAgICAgICB2YXIgbmV3UG9zID0gTWF0aC5tYXgoc3BhcmtsaW5lLnhTY2FsZSgpLmludmVydChkMy5ldmVudC54KSwgMCk7XG4gICAgICAgIGRhdGEucG9zKG5ld1Bvcyk7XG4gICAgICB9KTtcbiAgICAgIGQzLnNlbGVjdChlbGVtZW50KVxuICAgICAgICAuZGF0dW0oe3BvczogZGF0YS5wb3MoKSwgZjogZGF0YS5mfSlcbiAgICAgICAgLmNhbGwoc3BhcmtsaW5lKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGZvcm0gPSAkKCcjcG9ydGZvbGlvLXNlbGVjdGlvbicpO1xuICBpZihmb3JtLmxlbmd0aCkge1xuICAgIC8vIHJlbW92ZSB0aGUgb2xkIGZvcm0gcHJvY2Vzc2luZ1xuICAgIGtvLmNsZWFuTm9kZSgkKCcuaW52ZXN0bWVudC10ZXN0JylbMF0pO1xuICAgIGtvLmFwcGx5QmluZGluZ3MocG9ydGZvbGlvLCAkKCcuaW52ZXN0bWVudC10ZXN0JylbMF0pO1xuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGtlZXAgdGhlIHNsaWRlcnMgZnJvbSBzbGlkaW5nXG4gICAgLy8gd2hlbiB0aGUgdmFsdWVzIGdvIHRvIGhpZ2hcbiAgICAkKCcuYWxsb2Mtc2xpZGVyJykuZWFjaChmdW5jdGlvbihpLCBzKSB7XG4gICAgICB2YXIgYSA9IHBvcnRmb2xpby5zdG9ja3NbaV0uYWxsb2NhdGlvbjtcbiAgICAgICQocykub24oJ2lucHV0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKHMpLnZhbChhKCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGludlJlc3VsdHMgPSAkKCcjaW52ZXN0bWVudC1yZXN1bHRzJyk7XG4gIGlmKGludlJlc3VsdHMubGVuZ3RoKSB7XG4gICAgLy8gcmVtb3ZlIHRoZSBvbGQgZm9ybSBwcm9jZXNzaW5nXG4gICAga28uY2xlYW5Ob2RlKGludlJlc3VsdHNbMF0pO1xuICAgIGtvLmFwcGx5QmluZGluZ3MocG9ydGZvbGlvLCBpbnZSZXN1bHRzWzBdKTtcbiAgfVxuXG4gIHZhciBwcmV0ZXN0ID0gJCgnLnByZXRlc3QtcXVlc3Rpb25zJyk7XG4gIGlmKHByZXRlc3QubGVuZ3RoKSB7XG5cbiAgICAvLyBFbmFibGUga25vY2tvdXQgbGlzdGVuZXJzIG9uIHRoZSByYWRpbyBidXR0b25zXG4gICAgdmFyIFBvcnRTZWxlY3Rpb25zID0gcmVxdWlyZSgnLi92aWV3X21vZGVscy9wb3J0Zm9saW9fc2VsZWN0aW9ucycpO1xuICAgIHZhciBzZWwgPSBuZXcgUG9ydFNlbGVjdGlvbnMocG9ydGZvbGlvKTtcbiAgICBrby5hcHBseUJpbmRpbmdzKHNlbCwgcHJldGVzdFswXSk7XG5cbiAgICAvLyBEaXNhYmxlIGFsbCB0aGUgc2xpZGVyc1xuICAgICQoJy5hbGxvYy1zbGlkZXInKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBzYXZlIGJ1dHRvblxuICAgICQoJ2J1dHRvbi5zYXZlLXBvcnRmb2xpbycpLnJlbW92ZSgpO1xuXG4gICAgLy8gcmVzZXQgc2VsZWN0aW9uIHRvIHRyaWdnZXIgZXZlbnRzXG4gICAgc2VsLnNlbGVjdGlvbihcIjFcIik7XG5cbiAgfVxuXG4gIHJldHVybiBwb3J0Zm9saW87XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRQb3J0Zm9saW87XG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKCdkaXJlY3RvcicpLlJvdXRlcjtcblxudmFyIGluaXRXZWxjb21lID0gcmVxdWlyZSgnLi93ZWxjb21lJyk7XG52YXIgaW5pdFBvcnRmb2xpbyA9IHJlcXVpcmUoJy4vcG9ydGZvbGlvJyk7XG52YXIgaW5pdEZvcm0gPSByZXF1aXJlKCcuL2Zvcm0nKTtcbnZhciBpbml0SW5zdHJ1Y3Rpb25zID0gcmVxdWlyZSgnLi9pbnN0cnVjdGlvbnMnKTtcbnZhciBtb3VzZVRyYWNraW5nID0gcmVxdWlyZSgnLi9pbnN0cnVtZW50YXRpb24vbW91c2UnKTtcbnZhciBzZW5kVG9Bem4gPSByZXF1aXJlKCcuL2F6bicpO1xuXG5mdW5jdGlvbiByZW5kZXIodXJsLCBjYikge1xuICAvLyBPdmVycmlkZSB0aGUgY29udGVudFxuICAkKCcjY29udGVudCcpLmxvYWQodXJsLCBjYik7XG4gIC8vY29uc29sZS5sb2coXCJsb2FkZWQgXCIgKyB1cmwpO1xufVxuXG52YXIgcm91dGVzID0ge1xuICAnL3dlbGNvbWUnOiBmdW5jdGlvbigpIHtcbiAgICByZW5kZXIoJ3BhcnRpYWxzL3dlbGNvbWUuaHRtbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgaW5pdFdlbGNvbWUoKTtcbiAgICB9KTtcbiAgfSxcbiAgJy9kZW1vZ3JhcGhpY3MnOiBmdW5jdGlvbigpIHtcbiAgICByZW5kZXIoJ3BhcnRpYWxzL2RlbW9ncmFwaGljcy5odG1sJywgZnVuY3Rpb24oKSB7XG4gICAgICBpbml0Rm9ybShyb3V0ZXIudHVya0lkLCByb3V0ZXIuYXNzaWdubWVudElkKTtcbiAgICB9KTtcbiAgfSxcbiAgJy9saXRlcmFjeSc6IGZ1bmN0aW9uKCkge1xuICAgIHJlbmRlcigncGFydGlhbHMvbmFzZC5odG1sJywgZnVuY3Rpb24oKSB7XG4gICAgICBpbml0Rm9ybShyb3V0ZXIudHVya0lkLCByb3V0ZXIuYXNzaWdubWVudElkKTtcbiAgICB9KTtcbiAgfSxcbiAgJy9uZWVkX2Zvcl9jb2duaXRpb24nOiBmdW5jdGlvbigpIHtcbiAgICByZW5kZXIoJ3BhcnRpYWxzL25lZWRfZm9yX2NvZ25pdGlvbi5odG1sJywgZnVuY3Rpb24oKSB7XG4gICAgICBpbml0Rm9ybShyb3V0ZXIudHVya0lkLCByb3V0ZXIuYXNzaWdubWVudElkKTtcbiAgICB9KTtcbiAgfSxcbiAgJy9pbnN0cnVjdGlvbnMnOiBmdW5jdGlvbigpIHtcbiAgICByZW5kZXIoJ3BhcnRpYWxzL2luc3RydWN0aW9ucy5odG1sJywgZnVuY3Rpb24oKSB7XG4gICAgICBpbml0SW5zdHJ1Y3Rpb25zKCk7XG4gICAgfSk7XG4gIH0sXG4gICcvcHJldGVzdCc6IGZ1bmN0aW9uKCkge1xuICAgIHJlbmRlcigncGFydGlhbHMvcHJldGVzdC9ub19zYS5odG1sJywgZnVuY3Rpb24oKSB7XG4gICAgICBpbml0UG9ydGZvbGlvKHJvdXRlci50dXJrSWQsIDEwMDAwKTtcbiAgICAgIGluaXRGb3JtKHJvdXRlci50dXJrSWQsIHJvdXRlci5hc3NpZ25tZW50SWQpO1xuICAgIH0pO1xuICB9LFxuICAnL3Rlc3QvOnN0ZXAnOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgcmVuZGVyKCdwYXJ0aWFscy8nICsgcm91dGVyLnRlc3RUeXBlICsgJy5odG1sJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcCA9IGluaXRQb3J0Zm9saW8ocm91dGVyLnR1cmtJZCwgcm91dGVyLnByaW5jaXBhbCk7XG4gICAgICByb3V0ZXIucmV0dXJucy5mb3JFYWNoKGZ1bmN0aW9uKHIsIGkpIHtcbiAgICAgICAgcC5zdG9ja3NbaV0ubGFzdEludmVzdG1lbnQocGFyc2VGbG9hdChyLmludmVzdG1lbnQpKTtcbiAgICAgICAgcC5zdG9ja3NbaV0ubGFzdFJldHVybihwYXJzZUZsb2F0KHIucmV0dXJuKSk7XG4gICAgICB9KTtcbiAgICAgIHAuc2hvd1JldHVyblN1bW1hcnkocm91dGVyLnJldHVybnMubGVuZ3RoPjApO1xuICAgICAgaW5pdEZvcm0ocm91dGVyLnR1cmtJZCwgcm91dGVyLmFzc2lnbm1lbnRJZCwgc3RlcCk7XG4gICAgICBtb3VzZVRyYWNraW5nLnN0YXJ0KHJvdXRlci50dXJrSWQsIHN0ZXApO1xuICAgIH0pO1xuICB9LFxuICAnL3F1YWxpZmljYXRpb24nOiBmdW5jdGlvbigpIHtcbiAgICByZW5kZXIoJ3BhcnRpYWxzL3F1YWxpZmljYXRpb24uaHRtbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgaW5pdEZvcm0ocm91dGVyLnR1cmtJZCwgcm91dGVyLmFzc2lnbm1lbnRJZCk7XG4gICAgfSk7XG4gIH0sXG4gICcvY29uZmlkZW5jZSc6IGZ1bmN0aW9uKCkge1xuICAgIHJlbmRlcigncGFydGlhbHMvY29uZl9xdWVzdGlvbm5haXJlLmh0bWwnLCBmdW5jdGlvbigpIHtcbiAgICAgIGluaXRGb3JtKHJvdXRlci50dXJrSWQsIHJvdXRlci5hc3NpZ25tZW50SWQpO1xuICAgIH0pO1xuICB9LFxuICAnL2ZlZWRiYWNrJzogZnVuY3Rpb24oKSB7XG4gICAgcmVuZGVyKCdwYXJ0aWFscy9mZWVkYmFjay5odG1sJywgZnVuY3Rpb24oKSB7XG4gICAgICBpbml0Rm9ybShyb3V0ZXIudHVya0lkLCByb3V0ZXIuYXNzaWdubWVudElkKTtcbiAgICB9KTtcbiAgfSxcbiAgJy9kb25lJzogZnVuY3Rpb24oKSB7XG4gICAgcmVuZGVyKCdwYXJ0aWFscy9kb25lLmh0bWwnLCBmdW5jdGlvbigpIHtcbiAgICAgIFxuICAgICBcbiAgICAgc2F2ZVRvRmlsZShyb3V0ZXIudHVya0lkLCByb3V0ZXIuYXNzaWdubWVudElkKTtcbiAgICAgc2VuZFRvQXpuKHJvdXRlci50dXJrSWQsIHJvdXRlci5hc3NpZ25tZW50SWQpO1xuICAgIH0pO1xuICB9LFxuICAnL2ZhaWxlZCc6IGZ1bmN0aW9uKCkge1xuICAgIHJlbmRlcigncGFydGlhbHMvZmFpbGVkLmh0bWwnKTtcbiAgfSxcbiAgJy9yZWplY3RlZCc6IGZ1bmN0aW9uKCkge1xuICAgIHJlbmRlcigncGFydGlhbHMvcmVqZWN0ZWQuaHRtbCcpO1xuICB9LFxuICAnL3ByZXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICByZW5kZXIoJ3BhcnRpYWxzL3ByZXZpZXcuaHRtbCcpO1xuICB9XG59O1xuXG52YXIgcm91dGVyID0gbmV3IFJvdXRlcihyb3V0ZXMpO1xucm91dGVyLnJldHVybnMgPSBbXTtcblxuXG5mdW5jdGlvbiBzYXZlVG9GaWxlKGEsIGIpe1xuICBjb25zb2xlLmxvZyhhKTtcbiAgY29uc29sZS5sb2coYik7XG5jb25zb2xlLmxvZyhcIlRFU1RcIik7XG4gIH1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKHIpIHtcbiAgICByb3V0ZXIuaW5pdChyKTtcbiAgfSxcbiAgdHVya0lkOiBmdW5jdGlvbihpZCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcm91dGVyLnR1cmtJZDtcbiAgICB9XG4gICAgcm91dGVyLnR1cmtJZCA9IGlkO1xuICB9LFxuICBhc3NpZ25tZW50SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiByb3V0ZXIuYXNzaWdubWVudElkO1xuICAgIH1cbiAgICByb3V0ZXIuYXNzaWdubWVudElkID0gaWQ7XG4gIH0sXG4gIHByaW5jaXBhbDogZnVuY3Rpb24ocCkge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcm91dGVyLnByaW5jaXBhbDtcbiAgICB9XG4gICAgcm91dGVyLnByaW5jaXBhbCA9IE1hdGgucm91bmQocGFyc2VGbG9hdChwKSk7XG4gIH0sXG4gIHJldHVybnM6IGZ1bmN0aW9uKHIpIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHJvdXRlci5yZXR1cm5zO1xuICAgIH1cbiAgICByb3V0ZXIucmV0dXJucyA9IHI7XG4gIH0sXG4gIHRlc3RUeXBlOiBmdW5jdGlvbih0KSB7cm91dGVyLnRlc3RUeXBlID0gdDt9LFxuICBnb3RvOiBmdW5jdGlvbihwKSB7cm91dGVyLnNldFJvdXRlKHApO31cbn07XG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIG51bWVyaWMgPSByZXF1aXJlKCdudW1lcmljJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG52YXIgZm9ybV9kYXRhID0gW3tuYW1lOiAnbW91c2VldmVudHMnLCBkYXRhOiB7ZXZlbnRzOiBbXX19XTtcblxuZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG59XG5cbmZ1bmN0aW9uIGdldEludGVyZmFjZSgpIHtcbiAgdmFyIGludGVyZmFjZXMgPSBbXG4gICAgJ25vX3NhJywgXG4gICAgJ2xvY2FsX3NhX2JhcnMnLCBcbiAgICAnbG9jYWxfc2FfdGV4dCcsIFxuICAgICdsb2NhbF9zYV9zcCcsIFxuICAgICdzbGljZV9zYScsIFxuICAgICdnbG9iYWxfc2Ffc2xfYm90aCcsIFxuICAgICdnbG9iYWxfc2FfdGV4dF9ib3RoJ1xuICBdO1xuICByZXR1cm4gaW50ZXJmYWNlc1tnZXRSYW5kb21JbnQoMCwgaW50ZXJmYWNlcy5sZW5ndGgpXTtcbn1cblxuZnVuY3Rpb24gYm94TXVsbGVyKG1lYW4sIHNkKSB7XG4gIHZhciB4ID0gMCwgeSA9IDAsIHJhZGl1cyA9IDA7XG4gIGRvIHtcbiAgICB4ID0gTWF0aC5yYW5kb20oKSAqIDIgIC0gMTtcbiAgICB5ID0gTWF0aC5yYW5kb20oKSAqIDIgIC0gMTtcbiAgICByYWRpdXMgPSB4KnggKyB5Knk7XG4gIH0gd2hpbGUocmFkaXVzPT0wIHx8IHJhZGl1cyA+IDEpXG5cbiAgdmFyIGMgPSBNYXRoLnNxcnQoLTIgKiBNYXRoLmxvZyhyYWRpdXMpL3JhZGl1cyk7XG5cbiAgLy8gb25seSBuZWVkIG9uZSBvZiB0aGUgcGFpci4uLlxuICByZXR1cm4gc2QgKiAoeCpjKSArIG1lYW47XG59XG5cbnZhciBzdG9ja3MgPSBbXG4gICAge2V4cFJldHVybjogMC4wMTQxLCBleHBSaXNrOiAwLjAwNDN9LFxuICAgIHtleHBSZXR1cm46IDAuMDE0MiwgZXhwUmlzazogMC4wMDI5fSxcbiAgICB7ZXhwUmV0dXJuOiAwLjAxNDcsIGV4cFJpc2s6IDAuMDA0N30sXG4gICAge2V4cFJldHVybjogMC4wMTM0LCBleHBSaXNrOiAwLjAwMjh9LFxuICAgIHtleHBSZXR1cm46IDAuMDE2NCwgZXhwUmlzazogMC4wMDU2fVxuICBdO1xuXG5mdW5jdGlvbiBzaW11bGF0ZVBvcnRmb2xpbyhhbGxvY3MpIHtcbiAgYWxsb2NzID0gYWxsb2NzLm1hcChmdW5jdGlvbihhKSB7cmV0dXJuIHBhcnNlRmxvYXQoYSk7fSk7XG4gIHZhciBzdGFydGluZ0Nhc2ggPSBudW1lcmljLnN1bShhbGxvY3MpO1xuICB2YXIgc3RvY2tSZXR1cm5zID0gc3RvY2tzLm1hcChmdW5jdGlvbihzLCBpKSB7XG4gICAgcmV0dXJuIGJveE11bGxlcihzLmV4cFJldHVybiwgcy5leHBSaXNrKTtcbiAgfSk7XG4gIHZhciB0dGxSZXRzID0gbnVtZXJpYy5tdWwoc3RvY2tSZXR1cm5zLCBhbGxvY3MpO1xuICB2YXIgcmV0SW5mbyA9IFtdO1xuICBmb3IodmFyIGk9MDsgaTx0dGxSZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmV0SW5mby5wdXNoKHtpbnZlc3RtZW50OiBhbGxvY3NbaV0sIHJldHVybjogdHRsUmV0c1tpXX0pO1xuICB9XG4gIHJldHVybiB7XG4gICAgc3RvY2tSZXR1cm5zOiByZXRJbmZvLFxuICAgIHN0YXJ0aW5nQ2FzaDogc3RhcnRpbmdDYXNoLFxuICAgIHJlbWFpbmluZ0Nhc2g6IG51bWVyaWMuc3VtKHR0bFJldHMpICsgc3RhcnRpbmdDYXNoXG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZERhdGEobmFtZSwgZGF0YSkge1xuICB2YXIgcmV0O1xuICBpZihuYW1lPT0nZGVtb2dyYXBoaWNzJykge1xuICAgIGRhdGEuaW50ZXJmYWNlTmFtZSA9IGdldEludGVyZmFjZSgpO1xuICAgIHJldCA9IHtzdWNjZXNzOiB0cnVlLCBpbnRlcmZhY2VOYW1lOiBkYXRhLmludGVyZmFjZU5hbWV9O1xuICB9IGVsc2UgaWYobmFtZT09J2ZlZWRiYWNrJykge1xuICAgIGlmKGRhdGEuY29tbWVudHMpIHtcbiAgICAgIGRhdGEuY29tbWVudHMgPSBkYXRhLmNvbW1lbnRzLnJlcGxhY2UoLycvZywgJycpO1xuICAgIH1cbiAgfSBlbHNlIGlmKG5hbWU9PSdwcmV0ZXN0Jykge1xuICAgIHJldCA9IHtzdWNjZXNzOiB0cnVlLCBhcHByb3ZlZDogZGF0YS5wcmV0ZXN0PT0nMid9O1xuICB9IGVsc2UgaWYobmFtZT09J3BvcnRmb2xpbycpIHtcbiAgICBuYW1lID0gbmFtZSArICctJyArIGRhdGEuc3RlcDtcbiAgICB2YXIgYWxsb2NzID0gW2RhdGEuYTEsIGRhdGEuYTIsIGRhdGEuYTMsIGRhdGEuYTQsIGRhdGEuYTVdO1xuICAgIHZhciByZXREYXRhID0gc2ltdWxhdGVQb3J0Zm9saW8oYWxsb2NzKTtcbiAgICBkYXRhLnN0b2NrUmV0dXJucyA9IHJldERhdGEuc3RvY2tSZXR1cm5zO1xuICAgIGRhdGEuc3RhcnRpbmdDYXNoID0gcmV0RGF0YS5zdGFydGluZ0Nhc2g7XG4gICAgZGF0YS5yZW1haW5pbmdDYXNoID0gcmV0RGF0YS5yZW1haW5pbmdDYXNoO1xuICAgIHJldCA9IHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgcmVtYWluaW5nQ2FzaDogcmV0RGF0YS5yZW1haW5pbmdDYXNoLCBcbiAgICAgIHJldHVybnM6IHJldERhdGEuc3RvY2tSZXR1cm5zXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXQgPSB7c3VjY2VzczogdHJ1ZX07XG4gIH1cbiAgZm9ybV9kYXRhLnB1c2goe25hbWU6IG5hbWUsIGRhdGE6IGRhdGF9KTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gYWRkTW91c2VEYXRhKGRhdGEpIHtcbiAgLy8gdGhlIG1vdXNlIGRhdGEgaXMgYWx3YXlzIGZpcnN0XG4gIGZvcm1fZGF0YVswXS5kYXRhLmV2ZW50cy5wdXNoKGRhdGEpO1xufVxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vICMjIyMjIyMjIyMgIE1ZIFNUVUZGICAjIyMjIyMjIyMjXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5mdW5jdGlvbiBnZXRGb3JtRGF0YSgpe1xuICBjb25zb2xlLmxvZyhmb3JtX2RhdGEpO1xuICBcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGF0YTogZm9ybV9kYXRhLFxuICBhZGREYXRhOiBhZGREYXRhLFxuICBhZGRNb3VzZURhdGE6IGFkZE1vdXNlRGF0YVxufTtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnVtZXJpYyA9IHJlcXVpcmUoJ251bWVyaWMnKTtcblxuZnVuY3Rpb24gZ3JhZGllbnQoYWxsb2NzLCByZXRzLCBjb3JNdHgpIHtcbiAgdmFyIGRlbHRhID0gMWUtNTtcbiAgdmFyIGdyYWRzID0gW107XG4gIGZvcih2YXIgaT0wOyBpPGFsbG9jcy5sZW5ndGg7IGkrKykge1xuICAgIC8vIGNlbnRyYWwgZGlmZmVyZW5jaW5nXG4gICAgdmFyIGExID0gYWxsb2NzLnNsaWNlKDApO1xuICAgIHZhciBhMiA9IGFsbG9jcy5zbGljZSgwKTtcbiAgICBhMVtpXSAtPSBkZWx0YTtcbiAgICBhMltpXSArPSBkZWx0YTtcbiAgICB2YXIgcnNrMSA9IG51bWVyaWMuZG90KGExLCBudW1lcmljLmRvdChjb3JNdHgsIGExKSk7XG4gICAgdmFyIHJldDEgPSBudW1lcmljLmRvdChhMSwgcmV0cyk7XG4gICAgdmFyIHJzazIgPSBudW1lcmljLmRvdChhMiwgbnVtZXJpYy5kb3QoY29yTXR4LCBhMikpO1xuICAgIHZhciByZXQyID0gbnVtZXJpYy5kb3QoYTIsIHJldHMpO1xuICAgIGdyYWRzW2ldID0ge1xuICAgICAgZXhwUmlzazogICAocnNrMi1yc2sxKSAvICgyKmRlbHRhKSxcbiAgICAgIGV4cFJldHVybjogKHJldDItcmV0MSkgLyAoMipkZWx0YSlcbiAgICB9O1xuICB9XG4gIHJldHVybiBncmFkcztcbn1cblxuLy8gZ2VuZXJhdGUgYW4gYXJyYXkgb2YgbiByYW5kb20gbnVtYmVyIHN1Y2ggdGhhdCB0aGV5IHN1bSB0byAxXG5mdW5jdGlvbiByYW5kb21TdW0obikge1xuICB2YXIgeHggPSBudW1lcmljLnJhbmRvbShbbl0pOyAgLy8gYWxsIGJldHdlZW4gMCBhbmQgMVxuICB2YXIgZmFjdG9yID0gMTtcbiAgZm9yKHZhciBkPTA7IGQ8KG4tMSk7IGQrKykge1xuICAgIC8vdmFyIG9sZFggPSB4eFtkXTtcbiAgICB4eFtkXSAqPSBmYWN0b3I7XG4gICAgZmFjdG9yID0gTWF0aC5tYXgoZmFjdG9yIC0geHhbZF0sIDApO1xuICB9XG4gIC8vIFRoZSBsYXN0IGVsZW1lbnQgaXMgYWx3YXlzIHdoYXQncyBsZWZ0XG4gIHh4W24tMV0gPSBmYWN0b3I7XG4gIHJldHVybiB4eDtcbn1cblxuZnVuY3Rpb24gZ2VuQWxsb2NzKG4sIGksIHgpIHtcbiAgdmFyIHJldDtcbiAgaWYoeCA9PT0gMSkge1xuICAgIHJldCA9IG51bWVyaWMucmVwKFtuXSwgMCk7XG4gICAgcmV0W2ldID0geDtcbiAgfSBlbHNlIHtcbiAgICByZXQgPSByYW5kb21TdW0obi0xKTtcbiAgICByZXQgPSBudW1lcmljLm11bChyZXQsIDEteCk7XG4gICAgcmV0LnNwbGljZShpLCAwLCB4KTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBleHBSZXR1cm5JbnRlZ3JhbChyZXRzLCBpLCBwYXIpIHtcbiAgdmFyIGl0ZXJzID0gMTAwMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgdHRsID0gMDtcbiAgICBmb3IodmFyIGo9MDsgajxpdGVyczsgaisrKSB7XG4gICAgICB2YXIgYWxsb2NzID0gZ2VuQWxsb2NzKHJldHMubGVuZ3RoLCBpLCB4L3Bhcik7XG4gICAgICB0dGwgKz0gbnVtZXJpYy5kb3QoYWxsb2NzLCByZXRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhciAqIHR0bCAvIGl0ZXJzO1xuICB9O1xufVxuXG5mdW5jdGlvbiBleHBSaXNrSW50ZWdyYWwocmV0cywgY29yTXR4LCBpLCBwYXIpIHtcbiAgLy8gMS82IHYgdyB5IHogKDIgYV41IHZeMisyIGFeNCB3XjIrMiBhXjMgel4yKzIgYV4yIHleMis2IGEgeF4yKzMgKDIgYiB4IHkrMiBjIHggeisyIGQgdyB4KzIgZSB2IHgrZiB5IHorZyB3IHkraCB2IHkraSB3IHoraiB2IHorayB2IHcpKVxuICB2YXIgaXRlcnMgPSAxMDAwO1xuICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgIHZhciB0dGwgPSAwO1xuICAgIGZvcih2YXIgaj0wOyBqPGl0ZXJzOyBqKyspIHtcbiAgICAgIHZhciBhbGxvY3MgPSBnZW5BbGxvY3MocmV0cy5sZW5ndGgsIGksIHgvcGFyKTtcbiAgICAgIHR0bCArPSBudW1lcmljLmRvdChhbGxvY3MsIG51bWVyaWMuZG90KGNvck10eCwgYWxsb2NzKSk7XG4gICAgfVxuICAgIHJldHVybiBwYXIgKiAxLjk2ICogKHR0bCAvIGl0ZXJzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2xvYmFsU0EocmV0cywgY29yTXR4KSB7XG5cbiAgdmFyIGl0ZXJzID0gMTAwMDA7XG4gIHZhciByZXRTQSA9IG5ldyBBcnJheShyZXRzLmxlbmd0aCk7XG4gIHZhciByaXNrU0EgPSBuZXcgQXJyYXkocmV0cy5sZW5ndGgpO1xuICBmb3IodmFyIGk9MDsgaTxyZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmV0U0FbaV0gPSAwO1xuICAgIHJpc2tTQVtpXSA9IDA7XG4gIH1cbiAgLy8gbW9udGUgY2FybG8gaW50ZWdyYXRpb25cbiAgZm9yKGk9MDsgaTxpdGVyczsgaSsrKSB7XG4gICAgLy8gZ2V0IHJhbmRvbSBwb2ludCBpbiBzcGFjZVxuICAgIHZhciBhbGxvYyA9IG51bWVyaWMucmFuZG9tKFtyZXRzLmxlbmd0aF0pO1xuICAgIGFsbG9jID0gbnVtZXJpYy5kaXYoYWxsb2MsIG51bWVyaWMuc3VtKGFsbG9jKSk7XG5cbiAgICAvLyBjb21wdXRlIGFsbCB0aGUgZ3JhZGllbnRzIGhlcmVcbiAgICB2YXIgZ3JhZGllbnRzID0gZ3JhZGllbnQoYWxsb2MsIHJldHMsIGNvck10eCk7XG5cbiAgICAvLyBhY2N1bXVsYXRlXG4gICAgZm9yKHZhciBqPTA7IGo8cmV0cy5sZW5ndGg7IGorKykge1xuICAgICAgLy8gVGhlc2UgZXhwb25lbnRpYWwgZ3JhZGllbnRzIGFyZSByZWNvbW1lbmRlZFxuICAgICAgcmV0U0Fbal0gICs9IE1hdGgucG93KGdyYWRpZW50c1tqXS5leHBSZXR1cm4sIDIpO1xuICAgICAgcmlza1NBW2pdICs9IE1hdGgucG93KGdyYWRpZW50c1tqXS5leHBSaXNrLCAyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGV4cFJpc2s6ICAgbnVtZXJpYy5zcXJ0KG51bWVyaWMuZGl2KHJpc2tTQSwgaXRlcnMpKSxcbiAgICBleHBSZXR1cm46IG51bWVyaWMuc3FydChudW1lcmljLmRpdihyZXRTQSwgaXRlcnMpKVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ3JhZGllbnQ6IGdyYWRpZW50LFxuICBnbG9iYWxTQTogZ2xvYmFsU0EsXG4gIGdlbkFsbG9jczogZ2VuQWxsb2NzLFxuICBleHBSZXR1cm5JbnRlZ3JhbDogZXhwUmV0dXJuSW50ZWdyYWwsXG4gIGV4cFJpc2tJbnRlZ3JhbDogZXhwUmlza0ludGVncmFsXG59O1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbnZhciBrbyA9IHJlcXVpcmUoJ2tub2Nrb3V0Jyk7XG52YXIgbnVtZXJpYyA9IHJlcXVpcmUoJ251bWVyaWMnKTtcbnZhciBwb3J0TWF0aCA9IHJlcXVpcmUoJy4vbWF0aCcpO1xuXG5rby5leHRlbmRlcnMubWF4Q2FzaCA9IGZ1bmN0aW9uKHRhcmdldCwgcGFyYW1zKSB7XG4gIHZhciBhc3NldHMgPSBwYXJhbXMuYXNzZXRzLFxuICAgICAgaW5kZXggPSBwYXJhbXMuaW5kZXgsXG4gICAgICBtYXhBbGxvYyA9IHBhcmFtcy5tYXhBbGxvYztcblxuICB2YXIgcmVzdWx0ID0ga28ucHVyZUNvbXB1dGVkKHtcbiAgICByZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0YXJnZXQoKTtcbiAgICB9LFxuICAgIHdyaXRlOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgdmFyIHR0bCA9IDA7XG4gICAgICBmb3IodmFyIGk9MDsgaTxhc3NldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoaSE9PWluZGV4KSB7XG4gICAgICAgICAgdHRsICs9IHBhcnNlRmxvYXQoYXNzZXRzW2ldLmFsbG9jYXRpb24oKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciB2YWx1ZVRvV3JpdGUgPSBNYXRoLm1pbihwYXJzZUZsb2F0KG5ld1ZhbHVlKSwgbWF4QWxsb2MgLSB0dGwpLFxuICAgICAgICAgIGN1cnJlbnQgPSB0YXJnZXQoKTtcblxuICAgICAgaWYodmFsdWVUb1dyaXRlICE9PSBjdXJyZW50KSB7XG4gICAgICAgIHRhcmdldCh2YWx1ZVRvV3JpdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSkuZXh0ZW5kKHtub3RpZnk6ICdhbHdheXMnfSk7XG5cbiAgLy8ga2ljayB0aGluZ3Mgb2ZmXG4gIHJlc3VsdCh0YXJnZXQoKSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmtvLmV4dGVuZGVycy5udW1lcmljID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHZhciByZXN1bHQgPSBrby5jb21wdXRlZCh7XG4gICAgcmVhZDogdGFyZ2V0LFxuICAgIHdyaXRlOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgdmFyIGN1cnJlbnQgPSB0YXJnZXQoKSxcbiAgICAgICAgICB2YWx1ZUFzTnVtID0gaXNOYU4obmV3VmFsdWUpID8gTmFOIDogcGFyc2VGbG9hdCgrbmV3VmFsdWUpO1xuXG4gICAgICBpZih2YWx1ZUFzTnVtICE9PSBjdXJyZW50KSB7XG4gICAgICAgIHRhcmdldCh2YWx1ZUFzTnVtKTtcbiAgICAgIH0gZWxzZSBpZihuZXdWYWx1ZSAhPT0gY3VycmVudCkge1xuICAgICAgICB0YXJnZXQubm90aWZ5U3Vic2NyaWJlcnModmFsdWVBc051bSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXN1bHQodGFyZ2V0KCkpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5rby5leHRlbmRlcnMuY3VycmVuY3kgPSBmdW5jdGlvbih0YXJnZXQpIHtcblxuICB0YXJnZXQuZm9ybWF0dGVkID0ga28uY29tcHV0ZWQoe1xuICAgIHJlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIE1hdGgucm91bmQoMTAwKnBhcnNlRmxvYXQodGFyZ2V0KCkpLzEwMCk7XG4gICAgfSxcbiAgICB3cml0ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIC8vIG51bWJlcnMgY29tZSBiYWNrIGFzIHN0cmluZ3MgZnJvbSBrb1xuICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgIHRhcmdldCh2YWx1ZSk7XG4gICAgfSxcbiAgICBvd25lcjogdGhpc1xuICB9KTtcblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxudmFyIHN0b2NrID0gZnVuY3Rpb24obmFtZSwgYWxsb2MsIGVyZXQsIGVyc2spIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBrby5vYnNlcnZhYmxlKG5hbWUpLFxuICAgIGFsbG9jYXRpb246IGtvLm9ic2VydmFibGUoYWxsb2MpLCAvLyBleHRlbmQgdGhlc2UgbGF0ZXJcbiAgICBleHBSZXR1cm46IGtvLm9ic2VydmFibGUoZXJldCksXG4gICAgZXhwUmlzazoga28ub2JzZXJ2YWJsZShlcnNrKSxcbiAgICBpc1NlbGVjdGVkOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICBsYXN0SW52ZXN0bWVudDoga28ub2JzZXJ2YWJsZSgpLmV4dGVuZCh7Y3VycmVuY3k6IHRydWV9KSxcbiAgICBsYXN0UmV0dXJuOiBrby5vYnNlcnZhYmxlKCkuZXh0ZW5kKHtjdXJyZW5jeTogdHJ1ZX0pLFxuICAgIHNldFNlbGVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaXNTZWxlY3RlZCh0cnVlKTtcbiAgICB9LFxuICAgIHVuc2V0U2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5pc1NlbGVjdGVkKGZhbHNlKTtcbiAgICB9XG4gIH07XG59O1xuXG52YXIgc2VsZWN0aW9uID0gZnVuY3Rpb24oc3RvY2tzLCBleHBSaXNrLCBleHBSZXR1cm4sIGdyYWRpZW50cykge1xuICByZXR1cm4ge1xuICAgIGFsbG9jczogc3RvY2tzLFxuICAgIGV4cFJpc2s6IGV4cFJpc2ssXG4gICAgZXhwUmV0dXJuOiBleHBSZXR1cm4sXG4gICAgZ3JhZGllbnQ6IGdyYWRpZW50c1xuICB9O1xufTtcblxudmFyIHBvcnRmb2xpbyA9IGZ1bmN0aW9uKHRvdGFsSW52ZXN0bWVudCkge1xuICB2YXIgX3R0bEludmVzdG1lbnQgPSB0b3RhbEludmVzdG1lbnQ7XG4gIHZhciBfY29yck10eCA9IGtvLm9ic2VydmFibGUoW1xuICAgIFswLjAwNDI2MTQ5MCwgMC4wMDEwODc0MTYsIDAuMDAyMTc0NjkxLCAwLjAwMTE4NTMzNywgMC4wMDMwOTY2NjJdLFxuICAgIFswLjAwMTA4NzQxNiwgMC4wMDI5MzM4NjUsIDAuMDAxNDc2MDI1LCAwLjAwMTk0NDI3MSwgMC4wMDE1MjAzODRdLFxuICAgIFswLjAwMjE3NDY5MSwgMC4wMDE0NzYwMjUsIDAuMDA0Njc1MTM0LCAwLjAwMTU1MTc5OSwgMC4wMDI0NjY5ODZdLFxuICAgIFswLjAwMTE4NTMzNywgMC4wMDE5NDQyNzEsIDAuMDAxNTUxNzk5LCAwLjAwMjc1NzU0MywgMC4wMDExODg5MTFdLFxuICAgIFswLjAwMzA5NjY2MiwgMC4wMDE1MjAzODQsIDAuMDAyNDY2OTg2LCAwLjAwMTE4ODkxMSwgMC4wMDU2MzAyMjddXG4gIF0pO1xuXG4gIC8vdmFyIHBlclN0b2NrSW52ID0gdG90YWxJbnZlc3RtZW50IC8gNTtcbiAgdmFyIHBlclN0b2NrSW52ID0gMDtcbiAgdmFyIF9zdG9ja3MgPSBbXG4gICAgbmV3IHN0b2NrKCdBJywgcGVyU3RvY2tJbnYsIDAuMDE0MSwgMC4wMDQzKSxcbiAgICBuZXcgc3RvY2soJ0InLCBwZXJTdG9ja0ludiwgMC4wMTQyLCAwLjAwMjkpLFxuICAgIG5ldyBzdG9jaygnQycsIHBlclN0b2NrSW52LCAwLjAxNDcsIDAuMDA0NyksXG4gICAgbmV3IHN0b2NrKCdEJywgcGVyU3RvY2tJbnYsIDAuMDEzNCwgMC4wMDI4KSxcbiAgICBuZXcgc3RvY2soJ0UnLCBwZXJTdG9ja0ludiwgMC4wMTY0LCAwLjAwNTYpXG4gIF07XG4gIF9zdG9ja3MuZm9yRWFjaChmdW5jdGlvbihzLCBpKSB7XG4gICAgcy5hbGxvY2F0aW9uID0gcy5hbGxvY2F0aW9uLmV4dGVuZCh7XG4gICAgICBtYXhDYXNoOiB7YXNzZXRzOiBfc3RvY2tzLCBpbmRleDogaSwgbWF4QWxsb2M6IHRvdGFsSW52ZXN0bWVudH0sXG4gICAgICBudW1lcmljOiB0cnVlLFxuICAgICAgY3VycmVuY3k6IHRydWVcbiAgICB9KTtcbiAgfSk7XG4gIHZhciBfdG90YWxSZXR1cm4gPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcbiAgICB2YXIgdHRsID0gMDtcbiAgICBfc3RvY2tzLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgdHRsICs9IHMubGFzdFJldHVybigpO1xuICAgIH0pO1xuICAgIHJldHVybiB0dGw7XG4gIH0pLmV4dGVuZCh7Y3VycmVuY3k6IHRydWV9KTtcbiAgZnVuY3Rpb24gY2FsY0V4cFJldHVybihhbGxvY3MpIHtcbiAgICB2YXIgcmV0cyA9IF9zdG9ja3MubWFwKGZ1bmN0aW9uKHMpIHtyZXR1cm4gcy5leHBSZXR1cm4oKTt9KTtcbiAgICByZXR1cm4gbnVtZXJpYy5kb3QoYWxsb2NzLCByZXRzKTtcbiAgfVxuICBmdW5jdGlvbiBjYWxjRXhwUmlzayhhbGxvY3MpIHtcbiAgICBhbGxvY3MgPSBudW1lcmljLmRpdihhbGxvY3MsIF90dGxJbnZlc3RtZW50KTtcbiAgICB2YXIgcnNrID0gbnVtZXJpYy5kb3QoYWxsb2NzLCBudW1lcmljLmRvdChhbGxvY3MsIF9jb3JyTXR4KCkpKTtcbiAgICByZXR1cm4gcnNrICogMS45NiAqIF90dGxJbnZlc3RtZW50O1xuICAgIC8vcmV0dXJuIG51bWVyaWMuZG90KGFsbG9jcywgbnVtZXJpYy5kb3QoYWxsb2NzLCBfY29yck10eCgpKSk7XG4gIH1cbiAgdmFyIF9ncmFkaWVudCA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbGxvY3MgPSBfc3RvY2tzLm1hcChmdW5jdGlvbihzKSB7cmV0dXJuIHMuYWxsb2NhdGlvbigpO30pO1xuICAgIGFsbG9jcyA9IG51bWVyaWMuZGl2KGFsbG9jcywgX3R0bEludmVzdG1lbnQpO1xuICAgIHZhciByZXRzID0gX3N0b2Nrcy5tYXAoZnVuY3Rpb24ocykge3JldHVybiBzLmV4cFJldHVybigpO30pO1xuICAgIHZhciBncmFkcyA9IHBvcnRNYXRoLmdyYWRpZW50KGFsbG9jcywgcmV0cywgX2NvcnJNdHgoKSk7XG4gICAgZ3JhZHMgPSBncmFkcy5tYXAoZnVuY3Rpb24oZywgaSkge1xuICAgICAgZy5leHBSaXNrID0gZy5leHBSaXNrICogX3R0bEludmVzdG1lbnQ7XG4gICAgICBnLmV4cFJldHVybiA9IGcuZXhwUmV0dXJuICogX3R0bEludmVzdG1lbnQ7XG4gICAgICBnLnJhdGlvID0gZy5leHBSZXR1cm4gLyBnLmV4cFJpc2s7XG4gICAgICBnLmlzU2VsZWN0ZWQgPSBfc3RvY2tzW2ldLmlzU2VsZWN0ZWQ7XG4gICAgICByZXR1cm4gZztcbiAgICB9KTtcbiAgICByZXR1cm4gZ3JhZHM7XG4gIH0pO1xuICB2YXIgX3NsaWNlID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFsbG9jcyA9IF9zdG9ja3MubWFwKGZ1bmN0aW9uKHMpIHtyZXR1cm4gcy5hbGxvY2F0aW9uKCk7fSk7XG4gICAgdmFyIHJlbUludmVzdG1lbnQgPSBfdHRsSW52ZXN0bWVudCAtIG51bWVyaWMuc3VtKGFsbG9jcyk7XG4gICAgdmFyIHNsaWNlcyA9IFtdO1xuICAgIF9zdG9ja3MuZm9yRWFjaChmdW5jdGlvbihzLCBpKSB7XG4gICAgICB2YXIgY2FuZEFsbG9jcyA9IG51bWVyaWMubGluc3BhY2UoMCwgYWxsb2NzW2ldK3JlbUludmVzdG1lbnQsIDExKTtcbiAgICAgIHNsaWNlc1tpXSA9IGNhbmRBbGxvY3MubWFwKGZ1bmN0aW9uKGNhKSB7XG4gICAgICAgIHZhciB0YSA9IGFsbG9jcy5zbGljZSgpO1xuICAgICAgICB0YVtpXSA9IGNhO1xuICAgICAgICByZXR1cm4ge2V4cFJpc2s6IGNhbGNFeHBSaXNrKHRhKSwgZXhwUmV0dXJuOiBjYWxjRXhwUmV0dXJuKHRhKX07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2xpY2VzO1xuICB9KTtcbiAgdmFyIF9nbG9iYWxTQSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXRzID0gX3N0b2Nrcy5tYXAoZnVuY3Rpb24ocykge3JldHVybiBzLmV4cFJldHVybigpO30pO1xuICAgIHZhciBzYSA9IHBvcnRNYXRoLmdsb2JhbFNBKHJldHMsIF9jb3JyTXR4KCkpO1xuICAgIC8vIHJlc2NhbGUgZXZlcnl0aGluZ1xuICAgIHNhLmV4cFJpc2sgPSBudW1lcmljLm11bChzYS5leHBSaXNrLCBfdHRsSW52ZXN0bWVudCAqIDEuOTYpO1xuICAgIHNhLmV4cFJldHVybiA9IG51bWVyaWMubXVsKHNhLmV4cFJldHVybiwgX3R0bEludmVzdG1lbnQpO1xuICAgIC8vIGNvbXB1dGUgdGhlIHJpc2svcmV0dXJuIHJhdGlvXG4gICAgc2EucmF0aW8gPSBudW1lcmljLmRpdihzYS5leHBSZXR1cm4sIHNhLmV4cFJpc2spO1xuICAgIHJldHVybiBzYTtcbiAgfTtcbiAgdmFyIF9hdmdCZWhhdmlvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXRzID0gX3N0b2Nrcy5tYXAoZnVuY3Rpb24ocykge3JldHVybiBzLmV4cFJldHVybigpO30pO1xuICAgIHZhciBleHBSZXR1cm4gPSBbXTtcbiAgICB2YXIgZXhwUmlzayA9IFtdO1xuICAgIHZhciByYXRpbyA9IFtdO1xuICAgIGZvcih2YXIgaT0wOyBpPHJldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZXQgPSBwb3J0TWF0aC5leHBSZXR1cm5JbnRlZ3JhbChyZXRzLCBpLCBfdHRsSW52ZXN0bWVudCk7XG4gICAgICB2YXIgcnNrID0gcG9ydE1hdGguZXhwUmlza0ludGVncmFsKHJldHMsIF9jb3JyTXR4KCksIGksIF90dGxJbnZlc3RtZW50KTtcbiAgICAgIGV4cFJldHVybltpXSA9IHJldDtcbiAgICAgIGV4cFJpc2tbaV0gPSByc2s7XG4gICAgICByYXRpb1tpXSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgdmFyIHJ0ID0gcmV0KHgpO1xuICAgICAgICB2YXIgcmsgPSByc2soeCk7XG4gICAgICAgIGlmKHJrICE9PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHJ0IC8gcms7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7ZXhwUmV0dXJuOiBleHBSZXR1cm4sIGV4cFJpc2s6IGV4cFJpc2ssIHJhdGlvOiByYXRpb307XG4gIH07XG4gIHZhciBfZXhwUmV0dXJuID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFsbG9jcyA9IF9zdG9ja3MubWFwKGZ1bmN0aW9uKHMpIHtyZXR1cm4gcy5hbGxvY2F0aW9uKCk7fSk7XG4gICAgcmV0dXJuIGNhbGNFeHBSZXR1cm4oYWxsb2NzKTtcbiAgfSk7XG4gIHZhciBfZXhwUmlzayA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbGxvY3MgPSBfc3RvY2tzLm1hcChmdW5jdGlvbihzKSB7cmV0dXJuIHMuYWxsb2NhdGlvbigpO30pO1xuICAgIHJldHVybiBjYWxjRXhwUmlzayhhbGxvY3MpO1xuICB9KTtcbiAgZnVuY3Rpb24gY29tcHV0ZUNhc2goKSB7XG4gICAgdmFyIHR0bCA9IF90dGxJbnZlc3RtZW50O1xuICAgIGZvcih2YXIgaT0wOyBpPF9zdG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHR0bCAtPSBfc3RvY2tzW2ldLmFsbG9jYXRpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIHR0bDtcbiAgfVxuICB2YXIgX2Nhc2ggPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29tcHV0ZUNhc2goKTtcbiAgfSkuZXh0ZW5kKHtjdXJyZW5jeTogdHJ1ZX0pO1xuXG4gIHZhciBfc2VsZWN0aW9ucyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG4gIHZhciBfc2hvd1JldHVyblN1bW1hcnkgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgcmV0dXJuIHtcbiAgICBzdG9ja3M6IF9zdG9ja3MsXG4gICAgY2FzaDogX2Nhc2gsXG4gICAgc2VsZWN0aW9uczogX3NlbGVjdGlvbnMsXG4gICAgdG90YWxJbnZlc3RtZW50OiBfdHRsSW52ZXN0bWVudCxcbiAgICB0b3RhbFJldHVybjogX3RvdGFsUmV0dXJuLFxuICAgIHNob3dSZXR1cm5TdW1tYXJ5OiBfc2hvd1JldHVyblN1bW1hcnksXG4gICAgc2F2ZVNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsID0gbmV3IHNlbGVjdGlvbihcbiAgICAgICAgX3N0b2Nrcy5tYXAoZnVuY3Rpb24ocykge3JldHVybiBzLmFsbG9jYXRpb24oKTt9KSxcbiAgICAgICAgX2V4cFJpc2soKSxcbiAgICAgICAgX2V4cFJldHVybigpLFxuICAgICAgICBfZ3JhZGllbnQoKVxuICAgICAgKTtcbiAgICAgIF9zZWxlY3Rpb25zLnB1c2goc2VsKTtcbiAgICB9LFxuICAgIGdyYWRpZW50OiBfZ3JhZGllbnQsXG4gICAgc2xpY2U6IF9zbGljZSxcbiAgICBnbG9iYWxTQTogX2dsb2JhbFNBKCksXG4gICAgYXZnQmVoYXZpb3I6IF9hdmdCZWhhdmlvcigpLFxuICAgIGV4cFJldHVybjogX2V4cFJldHVybixcbiAgICBleHBSaXNrOiBfZXhwUmlzayxcbiAgICBwb3J0Zm9saW86IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG1vdmluZ0RvdCA9IHsgLy8gVGhpcyBuZWVkcyB0byBsb29rIHNpbWlsYXIgdG8gYSBzZWxlY3Rpb25cbiAgICAgICAgZXhwUmV0dXJuOiBfZXhwUmV0dXJuKCksXG4gICAgICAgIGV4cFJpc2s6IF9leHBSaXNrKCksXG4gICAgICAgIGdyYWRpZW50OiBfZ3JhZGllbnQoKVxuICAgICAgfTtcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudCBzZWxlY3Rpb24gcGx1cyBhbGwgdGhlIHNhdmVkIGRvdHNcbiAgICAgIHJldHVybiBfc2VsZWN0aW9ucygpLmNvbmNhdChbbW92aW5nRG90XSk7XG4gICAgfSksXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvcnRmb2xpbztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBrbyA9IHJlcXVpcmUoJ2tub2Nrb3V0Jyk7XG5cbi8vIEVuc3VyZSB0aGVzZSBhZGQgdXAgdG8gMSFcbnZhciBzZWxlY3Rpb25zID0ge1xuICAnMSc6IFswLjI3NTUxMTM2LCAwLjMwODE5MzAyLCAwLjA0MjY5MTI4LCAwLjAwMjAzNDk0LCAwLjM3MTU2OTRdLFxuICAnMic6IFswLjAwNTQyNjU5MSwgMC4yNDgyMjY2LCAwLjE1MzA3MTUzLCAwLjE5MDc4MTUyLCAwLjQwMjQ5MzddLFxuICAnMyc6IFswLjI2NDk0ODQsIDAuMTIwNzM3MiwgMC4yNTg5MzE1LCAwLjAyNjc5Njc4LCAwLjMyODU4NjFdLFxuICAnNCc6IFswLjMzNzE5OSwgMC4wMTg1Mzg1OCwgMC4wMzkxNDg1OSwgMC4xNzIzNDQyLCAwLjQzMjc2OTZdXG59O1xudmFyIGRvdFBvc2l0aW9ucyA9IHtcbiAgJzEnOiB7eDogMTAwLCB5OiAxMDB9LFxuICAnMic6IHt4OiA5MC42NzYsIHk6IDI3LjU2NH0sXG4gICczJzoge3g6IDEzMCwgeTogMTMwfSxcbiAgJzQnOiB7eDogMTkwLCB5OiA0MH1cbn07XG5cbnZhciBwb3J0Zm9saW9TZWxlY3Rpb24gPSBmdW5jdGlvbihwb3J0Zm9saW8pIHtcbiAgdmFyIF9zZWxlY3Rpb24gPSBrby5vYnNlcnZhYmxlKCk7XG5cbiAgX3NlbGVjdGlvbi5zdWJzY3JpYmUoZnVuY3Rpb24oc2VsKSB7XG4gICAgdmFyIGludiA9IHNlbGVjdGlvbnNbc2VsXTtcbiAgICB2YXIgcGFyID0gcG9ydGZvbGlvLnRvdGFsSW52ZXN0bWVudDtcbiAgICAvLyBTZXQgZXZlcnl0aGluZyB0byAwIHRvIGF2b2lkIHRoZSBzbGlkZXIgbGltaXRhdGlvbiBldmVudFxuICAgIGZvcih2YXIgaT0wOyBpPHBvcnRmb2xpby5zdG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBvcnRmb2xpby5zdG9ja3NbaV0uYWxsb2NhdGlvbigwKTtcbiAgICB9XG4gICAgZm9yKGk9MDsgaTxwb3J0Zm9saW8uc3RvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwb3J0Zm9saW8uc3RvY2tzW2ldLmFsbG9jYXRpb24oaW52W2ldICogcGFyKTtcbiAgICB9XG4gICAgLy8gYWxzbyBoYWNrIHRoZSBkb3QgcG9zaXRpb24gdG8gbWFrZSB0aGUgdGVzdCBlYXNpZXIuLi5cbiAgICB2YXIgZG90UG9zID0gZG90UG9zaXRpb25zW3NlbF07XG4gICAgJCgnI3Jpc2stcmV0dXJuJykuYXR0cignY3gnLCBkb3RQb3MueCk7XG4gICAgJCgnI3Jpc2stcmV0dXJuJykuYXR0cignY3knLCBkb3RQb3MueSk7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc2VsZWN0aW9uOiBfc2VsZWN0aW9uXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvcnRmb2xpb1NlbGVjdGlvbjtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG52YXIgaW5pdFdlbGNvbWUgPSBmdW5jdGlvbigpIHtcbiAgJCgnI25leHQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmxvdyA9IHJlcXVpcmUoJy4vZmxvdycpO1xuICAgIGZsb3cuZnNtLmhhbmRsZSgnYmVnaW5UZXN0Jyk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbml0V2VsY29tZTtcbiJdfQ==
