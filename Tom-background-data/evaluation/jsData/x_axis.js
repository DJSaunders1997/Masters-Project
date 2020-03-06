
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
