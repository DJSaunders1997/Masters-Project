
'use strict';

var $ = require('jquery');

var initWelcome = function() {
  $('#next').on('click', function() {
    var flow = require('./flow');
    flow.fsm.handle('beginTest');
  });
};

module.exports = initWelcome;
