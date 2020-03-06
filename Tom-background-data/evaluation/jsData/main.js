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

  if(process.env.NODE_ENV !== "production") {
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
