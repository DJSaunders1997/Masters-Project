
'use strict';

var numeric = require('numeric');
var $ = require('jquery');

var form_data = [{name: 'mouseevents', data: {events: []}}];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getInterface() {
  var interfaces = [
    'no_sa', 
    'local_sa_bars', 
    'local_sa_text', 
    'local_sa_sp', 
    'slice_sa', 
    'global_sa_sl_both', 
    'global_sa_text_both'
  ];
  return interfaces[getRandomInt(0, interfaces.length)];
}

function boxMuller(mean, sd) {
  var x = 0, y = 0, radius = 0;
  do {
    x = Math.random() * 2  - 1;
    y = Math.random() * 2  - 1;
    radius = x*x + y*y;
  } while(radius==0 || radius > 1)

  var c = Math.sqrt(-2 * Math.log(radius)/radius);

  // only need one of the pair...
  return sd * (x*c) + mean;
}

var stocks = [
    {expReturn: 0.0141, expRisk: 0.0043},
    {expReturn: 0.0142, expRisk: 0.0029},
    {expReturn: 0.0147, expRisk: 0.0047},
    {expReturn: 0.0134, expRisk: 0.0028},
    {expReturn: 0.0164, expRisk: 0.0056}
  ];

function simulatePortfolio(allocs) {
  allocs = allocs.map(function(a) {return parseFloat(a);});
  var startingCash = numeric.sum(allocs);
  var stockReturns = stocks.map(function(s, i) {
    return boxMuller(s.expReturn, s.expRisk);
  });
  var ttlRets = numeric.mul(stockReturns, allocs);
  var retInfo = [];
  for(var i=0; i<ttlRets.length; i++) {
    retInfo.push({investment: allocs[i], return: ttlRets[i]});
  }
  return {
    stockReturns: retInfo,
    startingCash: startingCash,
    remainingCash: numeric.sum(ttlRets) + startingCash
  };
}

function addData(name, data) {
  var ret;
  if(name=='demographics') {
    data.interfaceName = getInterface();
    ret = {success: true, interfaceName: data.interfaceName};
  } else if(name=='feedback') {
    if(data.comments) {
      data.comments = data.comments.replace(/'/g, '');
    }
  } else if(name=='pretest') {
    ret = {success: true, approved: data.pretest=='2'};
  } else if(name=='portfolio') {
    name = name + '-' + data.step;
    var allocs = [data.a1, data.a2, data.a3, data.a4, data.a5];
    var retData = simulatePortfolio(allocs);
    data.stockReturns = retData.stockReturns;
    data.startingCash = retData.startingCash;
    data.remainingCash = retData.remainingCash;
    ret = {
      success: true, 
      remainingCash: retData.remainingCash, 
      returns: retData.stockReturns
    };
  } else {
    ret = {success: true};
  }
  form_data.push({name: name, data: data});
  return ret;
}

function addMouseData(data) {
  // the mouse data is always first
  form_data[0].data.events.push(data);
}

module.exports = {
  data: form_data,
  addData: addData,
  addMouseData: addMouseData
};
