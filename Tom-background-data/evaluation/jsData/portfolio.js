
'use strict';

var ko = require('knockout');
var numeric = require('numeric');
var portMath = require('./math');

ko.extenders.maxCash = function(target, params) {
  var assets = params.assets,
      index = params.index,
      maxAlloc = params.maxAlloc;

  var result = ko.pureComputed({
    read: function() {
      return target();
    },
    write: function(newValue) {
      var ttl = 0;
      for(var i=0; i<assets.length; i++) {
        if(i!==index) {
          ttl += parseFloat(assets[i].allocation());
        }
      }
      var valueToWrite = Math.min(parseFloat(newValue), maxAlloc - ttl),
          current = target();

      if(valueToWrite !== current) {
        target(valueToWrite);
      }
    }
  }).extend({notify: 'always'});

  // kick things off
  result(target());

  return result;
};

ko.extenders.numeric = function(target) {
  var result = ko.computed({
    read: target,
    write: function(newValue) {
      var current = target(),
          valueAsNum = isNaN(newValue) ? NaN : parseFloat(+newValue);

      if(valueAsNum !== current) {
        target(valueAsNum);
      } else if(newValue !== current) {
        target.notifySubscribers(valueAsNum);
      }
    }
  });

  result(target());

  return result;
};

ko.extenders.currency = function(target) {

  target.formatted = ko.computed({
    read: function() {
      return Math.round(100*parseFloat(target())/100);
    },
    write: function(value) {
      // numbers come back as strings from ko
      value = parseFloat(value);
      target(value);
    },
    owner: this
  });

  return target;
};

var stock = function(name, alloc, eret, ersk) {
  return {
    name: ko.observable(name),
    allocation: ko.observable(alloc), // extend these later
    expReturn: ko.observable(eret),
    expRisk: ko.observable(ersk),
    isSelected: ko.observable(false),
    lastInvestment: ko.observable().extend({currency: true}),
    lastReturn: ko.observable().extend({currency: true}),
    setSelected: function() {
      this.isSelected(true);
    },
    unsetSelected: function() {
      this.isSelected(false);
    }
  };
};

var selection = function(stocks, expRisk, expReturn, gradients) {
  return {
    allocs: stocks,
    expRisk: expRisk,
    expReturn: expReturn,
    gradient: gradients
  };
};

var portfolio = function(totalInvestment) {
  var _ttlInvestment = totalInvestment;
  var _corrMtx = ko.observable([
    [0.004261490, 0.001087416, 0.002174691, 0.001185337, 0.003096662],
    [0.001087416, 0.002933865, 0.001476025, 0.001944271, 0.001520384],
    [0.002174691, 0.001476025, 0.004675134, 0.001551799, 0.002466986],
    [0.001185337, 0.001944271, 0.001551799, 0.002757543, 0.001188911],
    [0.003096662, 0.001520384, 0.002466986, 0.001188911, 0.005630227]
  ]);

  //var perStockInv = totalInvestment / 5;
  var perStockInv = 0;
  var _stocks = [
    new stock('A', perStockInv, 0.0141, 0.0043),
    new stock('B', perStockInv, 0.0142, 0.0029),
    new stock('C', perStockInv, 0.0147, 0.0047),
    new stock('D', perStockInv, 0.0134, 0.0028),
    new stock('E', perStockInv, 0.0164, 0.0056)
  ];
  _stocks.forEach(function(s, i) {
    s.allocation = s.allocation.extend({
      maxCash: {assets: _stocks, index: i, maxAlloc: totalInvestment},
      numeric: true,
      currency: true
    });
  });
  var _totalReturn = ko.computed(function() {
    var ttl = 0;
    _stocks.forEach(function(s) {
      ttl += s.lastReturn();
    });
    return ttl;
  }).extend({currency: true});
  function calcExpReturn(allocs) {
    var rets = _stocks.map(function(s) {return s.expReturn();});
    return numeric.dot(allocs, rets);
  }
  function calcExpRisk(allocs) {
    allocs = numeric.div(allocs, _ttlInvestment);
    var rsk = numeric.dot(allocs, numeric.dot(allocs, _corrMtx()));
    return rsk * 1.96 * _ttlInvestment;
    //return numeric.dot(allocs, numeric.dot(allocs, _corrMtx()));
  }
  var _gradient = ko.computed(function() {
    var allocs = _stocks.map(function(s) {return s.allocation();});
    allocs = numeric.div(allocs, _ttlInvestment);
    var rets = _stocks.map(function(s) {return s.expReturn();});
    var grads = portMath.gradient(allocs, rets, _corrMtx());
    grads = grads.map(function(g, i) {
      g.expRisk = g.expRisk * _ttlInvestment;
      g.expReturn = g.expReturn * _ttlInvestment;
      g.ratio = g.expReturn / g.expRisk;
      g.isSelected = _stocks[i].isSelected;
      return g;
    });
    return grads;
  });
  var _slice = ko.computed(function() {
    var allocs = _stocks.map(function(s) {return s.allocation();});
    var remInvestment = _ttlInvestment - numeric.sum(allocs);
    var slices = [];
    _stocks.forEach(function(s, i) {
      var candAllocs = numeric.linspace(0, allocs[i]+remInvestment, 11);
      slices[i] = candAllocs.map(function(ca) {
        var ta = allocs.slice();
        ta[i] = ca;
        return {expRisk: calcExpRisk(ta), expReturn: calcExpReturn(ta)};
      });
    });
    return slices;
  });
  var _globalSA = function() {
    var rets = _stocks.map(function(s) {return s.expReturn();});
    var sa = portMath.globalSA(rets, _corrMtx());
    // rescale everything
    sa.expRisk = numeric.mul(sa.expRisk, _ttlInvestment * 1.96);
    sa.expReturn = numeric.mul(sa.expReturn, _ttlInvestment);
    // compute the risk/return ratio
    sa.ratio = numeric.div(sa.expReturn, sa.expRisk);
    return sa;
  };
  var _avgBehavior = function() {
    var rets = _stocks.map(function(s) {return s.expReturn();});
    var expReturn = [];
    var expRisk = [];
    var ratio = [];
    for(var i=0; i<rets.length; i++) {
      var ret = portMath.expReturnIntegral(rets, i, _ttlInvestment);
      var rsk = portMath.expRiskIntegral(rets, _corrMtx(), i, _ttlInvestment);
      expReturn[i] = ret;
      expRisk[i] = rsk;
      ratio[i] = function(x) {
        var rt = ret(x);
        var rk = rsk(x);
        if(rk !== 0) {
          return rt / rk;
        } else {
          return 0;
        }
      };
    }
    return {expReturn: expReturn, expRisk: expRisk, ratio: ratio};
  };
  var _expReturn = ko.computed(function() {
    var allocs = _stocks.map(function(s) {return s.allocation();});
    return calcExpReturn(allocs);
  });
  var _expRisk = ko.computed(function() {
    var allocs = _stocks.map(function(s) {return s.allocation();});
    return calcExpRisk(allocs);
  });
  function computeCash() {
    var ttl = _ttlInvestment;
    for(var i=0; i<_stocks.length; i++) {
      ttl -= _stocks[i].allocation();
    }
    return ttl;
  }
  var _cash = ko.computed(function() {
    return computeCash();
  }).extend({currency: true});

  var _selections = ko.observableArray([]);
  var _showReturnSummary = ko.observable(false);
  return {
    stocks: _stocks,
    cash: _cash,
    selections: _selections,
    totalInvestment: _ttlInvestment,
    totalReturn: _totalReturn,
    showReturnSummary: _showReturnSummary,
    saveSelection: function() {
      var sel = new selection(
        _stocks.map(function(s) {return s.allocation();}),
        _expRisk(),
        _expReturn(),
        _gradient()
      );
      _selections.push(sel);
    },
    gradient: _gradient,
    slice: _slice,
    globalSA: _globalSA(),
    avgBehavior: _avgBehavior(),
    expReturn: _expReturn,
    expRisk: _expRisk,
    portfolio: ko.computed(function() {
      var movingDot = { // This needs to look similar to a selection
        expReturn: _expReturn(),
        expRisk: _expRisk(),
        gradient: _gradient()
      };
      // return the current selection plus all the saved dots
      return _selections().concat([movingDot]);
    }),
  };
};

module.exports = portfolio;
