
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