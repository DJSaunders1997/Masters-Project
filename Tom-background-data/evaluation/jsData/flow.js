
'use strict';

var machina = require('machina');
var router = require('./routes');
var $ = require('jquery');
var apiHost = require('../../config').apiHost;
var mouseTracking = require('./instrumentation/mouse');
var config = require('../../config');

$.urlParam = function(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (!results) { return 0; }
	return results[1] || 0;
};

// TODO: handle errors for missing turk id
var start = function() {
  return new machina.Fsm({
    initialize: function() {
      router.init();
    },

    investingStep: 1,
    turkId: null,

    initialState: 'welcome',

    states: {
      'welcome': {
        _onEnter: function() {
          var turkId = $.urlParam('workerId');
          turkId = turkId;
          this.turkId = turkId;
          var assignmentId = $.urlParam('assignmentId');
          assignmentId = assignmentId ? assignmentId : 'ASSIGNMENT_ID_NOT_AVAILABLE';
					this.assignmentId = assignmentId;
          router.turkId(turkId);
					router.assignmentId(assignmentId);
					if(assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
						router.goto('/preview');
					} else {
            router.goto('/welcome');
				  }
        },
        beginTest: function() {
          this.transition('demographics');
        }
      },
      'demographics': {
        _onEnter: function() {
          router.goto('/demographics');
        },
        formSuccess: function(data) {
				  router.testType(data.interfaceName);
          this.transition('instructions');
        }
      },
      'finLiteracy': {
        _onEnter: function() {
          router.goto('/literacy');
        },
        formSuccess: function() {
          this.transition('needForCognition');
        }
      },
      'needForCognition': {
        _onEnter: function() {
          router.goto('/need_for_cognition');
        },
        formSuccess: function() {
          this.transition('feedback');
        }
      },
			'instructions': {
				_onEnter: function() {
					router.goto('/instructions');
				},
        instructionsRead: function() {
          this.transition('pretest');
        }
			},
			'pretest': {
        _onEnter: function() {
          var url =  '/pretest';
					router.principal(10000);
          router.goto(url);
        },
        formSuccess: function(data) {
          if(data.approved) {
            this.transition('investing');
          } else {
            this.transition('failed');
          }
        }
			},
      'investing': {
        _onEnter: function() {
          if(!config.production) {
					  router.testType(config.debugInvTest);
          }
          var url =  '/test/' + this.investingStep;
					if(this.investingStep === 1) {
						router.principal(10000);
					}
          router.goto(url);
        },
				_onExit: function() {
          mouseTracking.stop();
				},
        formSuccess: function(data) {
				  router.principal(data.remainingCash);
					router.returns(data.returns);
          if(this.investingStep === 5 || router.principal() === 0) {
            this.transition('qualification');
          } else {
            this.investingStep += 1;
            var url =  '/test/' + this.investingStep;
            router.goto(url);
          }
        }
      },
			'qualification': {
        _onEnter: function() {
          router.goto('/qualification');
        },
        formSuccess: function() {
          this.transition('confidence');
        }
			},
      'confidence': {
        _onEnter: function() {
          router.goto('/confidence');
        },
        formSuccess: function() {
          this.transition('finLiteracy');
        }
      },
      'feedback': {
        _onEnter: function() {
          router.goto('/feedback');
        },
        formSuccess: function() {
          this.transition('done');
        }
      },
      'done': {
        _onEnter: function() {
          router.goto('/done');
        }
      },
      'failed': {
        _onEnter: function() {
          router.goto('/failed');
        }
      }
    }
  });
};

var init = function() {
  module.exports.fsm = start();
};

module.exports = {
  fsm: null,
  init: init
};
