
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
