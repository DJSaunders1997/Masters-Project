
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
