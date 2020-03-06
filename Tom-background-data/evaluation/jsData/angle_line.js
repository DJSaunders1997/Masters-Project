
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
