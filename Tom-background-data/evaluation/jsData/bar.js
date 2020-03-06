
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
