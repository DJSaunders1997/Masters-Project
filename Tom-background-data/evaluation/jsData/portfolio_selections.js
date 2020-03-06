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
