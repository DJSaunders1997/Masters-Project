
'use strict';

var $ = require('jquery');
require('getpath');
var ds = require('../view_models/data_store');
var numeric = require('numeric');
require('foundation');

// These are used to track for direction changes
var lastMouseMove1, lastMouseMove2;

function decodeEvent(e) {
  if(e.type !== 'mousemove') {
    lastMouseMove1 = null;
    lastMouseMove2 = null;
    return {
      x: e.pageX,
      y: e.pageY,
      event_type: e.type,
      time: e.timeStamp,
      button: e.which,
      target: $(e.target).attr('id') ||
              $(e.target).attr('name') ||
              $(e.target).getPath()
    };
  } else if(e.which) { // only process if the button is down
    if(lastMouseMove1 == null) {
      lastMouseMove1 = e;
    } else if (lastMouseMove2 == null) {
      lastMouseMove2 = e;
    } else {
      // Where the magic happens
      var v1 = [lastMouseMove2.pageX-lastMouseMove1.pageX,
                lastMouseMove2.pageY-lastMouseMove1.pageY];
      var v2 = [e.pageX-lastMouseMove2.pageX,
                e.pageY-lastMouseMove2.pageY];
      lastMouseMove1 = lastMouseMove2;
      lastMouseMove2 = e;
      if(numeric.dot(v1, v2) <= 0) {
        return decodeEvent({
          pageX: e.pageX,
          pageY: e.pageY,
          type: 'mousedirchange',
          timeStamp: e.timeStamp,
          which: e.which,
          target: e.target
        });
      }
    }
  }
}

var trackEvents = ['mousedown', 'mousemove', 'mouseup', 'click', 'dblclick'];

var savedEvents = [];

function saveEvent(e, turkId, step) {
  var de = decodeEvent(e);
  // only save events when the mouse button is down
  if(de != null && de.button) { 
    savedEvents.push(de);
    // only send events when the user is done with the mouse
    if(de.event_type === 'mouseup' || 
       de.event_type === 'click' || 
       de.event_type === 'dblclick') {
      var evtData = {
        turkId: turkId,
        step: step,
        events: savedEvents
      };
      ds.addMouseData(evtData);
      savedEvents = [];
    }
  }
}

function start(turkId, step) {
  trackEvents.forEach(function(te) {
    $(document).on(te, function(e) {
      if(te==='mousemove') {
        Foundation.utils.throttle(saveEvent(e, turkId, step), 250);
      } else {
        saveEvent(e, turkId, step);
      }
    });
  });
}

function stop() {
  trackEvents.forEach(function(te) {
    $(document).off(te);
  });
}

module.exports = {
  start: start,
  stop: stop
};
