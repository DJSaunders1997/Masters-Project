
'use strict';

var $ = require('jquery');
var Router = require('director').Router;

var initWelcome = require('./welcome');
var initPortfolio = require('./portfolio');
var initForm = require('./form');
var initInstructions = require('./instructions');
var mouseTracking = require('./instrumentation/mouse');
var sendToAzn = require('./azn');

function render(url, cb) {
  // Override the content
  $('#content').load(url, cb);
  //console.log("loaded " + url);
}

var routes = {
  '/welcome': function() {
    render('partials/welcome.html', function() {
      initWelcome();
    });
  },
  '/demographics': function() {
    render('partials/demographics.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/literacy': function() {
    render('partials/nasd.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/need_for_cognition': function() {
    render('partials/need_for_cognition.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/instructions': function() {
    render('partials/instructions.html', function() {
      initInstructions();
    });
  },
  '/pretest': function() {
    render('partials/pretest/no_sa.html', function() {
      initPortfolio(router.turkId, 10000);
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/test/:step': function(step) {
    render('partials/' + router.testType + '.html', function() {
      var p = initPortfolio(router.turkId, router.principal);
      router.returns.forEach(function(r, i) {
        p.stocks[i].lastInvestment(parseFloat(r.investment));
        p.stocks[i].lastReturn(parseFloat(r.return));
      });
      p.showReturnSummary(router.returns.length>0);
      initForm(router.turkId, router.assignmentId, step);
      mouseTracking.start(router.turkId, step);
    });
  },
  '/qualification': function() {
    render('partials/qualification.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/confidence': function() {
    render('partials/conf_questionnaire.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/feedback': function() {
    render('partials/feedback.html', function() {
      initForm(router.turkId, router.assignmentId);
    });
  },
  '/done': function() {
    render('partials/done.html', function() {
      sendToAzn(router.turkId, router.assignmentId);
    });
  },
  '/failed': function() {
    render('partials/failed.html');
  },
  '/rejected': function() {
    render('partials/rejected.html');
  },
  '/preview': function() {
    render('partials/preview.html');
  }
};

var router = new Router(routes);
router.returns = [];

module.exports = {
  init: function(r) {
    router.init(r);
  },
  turkId: function(id) {
    if(!arguments.length) {
      return router.turkId;
    }
    router.turkId = id;
  },
  assignmentId: function(id) {
    if(!arguments.length) {
      return router.assignmentId;
    }
    router.assignmentId = id;
  },
  principal: function(p) {
    if(!arguments.length) {
      return router.principal;
    }
    router.principal = Math.round(parseFloat(p));
  },
  returns: function(r) {
    if(!arguments.length) {
      return router.returns;
    }
    router.returns = r;
  },
  testType: function(t) {router.testType = t;},
  goto: function(p) {router.setRoute(p);}
};
