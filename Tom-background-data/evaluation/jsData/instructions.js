'use strict';

var $ = require('jquery');

var initInstructions = function() {
  $('#next').on('click', function() {
    var flow = require('./flow');
    flow.fsm.handle('instructionsRead');
  });
};

module.exports = initInstructions;
