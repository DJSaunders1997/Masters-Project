
'use strict';

var numeric = require('numeric');

function gradient(allocs, rets, corMtx) {
  var delta = 1e-5;
  var grads = [];
  for(var i=0; i<allocs.length; i++) {
    // central differencing
    var a1 = allocs.slice(0);
    var a2 = allocs.slice(0);
    a1[i] -= delta;
    a2[i] += delta;
    var rsk1 = numeric.dot(a1, numeric.dot(corMtx, a1));
    var ret1 = numeric.dot(a1, rets);
    var rsk2 = numeric.dot(a2, numeric.dot(corMtx, a2));
    var ret2 = numeric.dot(a2, rets);
    grads[i] = {
      expRisk:   (rsk2-rsk1) / (2*delta),
      expReturn: (ret2-ret1) / (2*delta)
    };
  }
  return grads;
}

// generate an array of n random number such that they sum to 1
function randomSum(n) {
  var xx = numeric.random([n]);  // all between 0 and 1
  var factor = 1;
  for(var d=0; d<(n-1); d++) {
    //var oldX = xx[d];
    xx[d] *= factor;
    factor = Math.max(factor - xx[d], 0);
  }
  // The last element is always what's left
  xx[n-1] = factor;
  return xx;
}

function genAllocs(n, i, x) {
  var ret;
  if(x === 1) {
    ret = numeric.rep([n], 0);
    ret[i] = x;
  } else {
    ret = randomSum(n-1);
    ret = numeric.mul(ret, 1-x);
    ret.splice(i, 0, x);
  }
  return ret;
}

function expReturnIntegral(rets, i, par) {
  var iters = 1000;
  return function(x) {
    var ttl = 0;
    for(var j=0; j<iters; j++) {
      var allocs = genAllocs(rets.length, i, x/par);
      ttl += numeric.dot(allocs, rets);
    }
    return par * ttl / iters;
  };
}

function expRiskIntegral(rets, corMtx, i, par) {
  // 1/6 v w y z (2 a^5 v^2+2 a^4 w^2+2 a^3 z^2+2 a^2 y^2+6 a x^2+3 (2 b x y+2 c x z+2 d w x+2 e v x+f y z+g w y+h v y+i w z+j v z+k v w))
  var iters = 1000;
  return function(x) {
    var ttl = 0;
    for(var j=0; j<iters; j++) {
      var allocs = genAllocs(rets.length, i, x/par);
      ttl += numeric.dot(allocs, numeric.dot(corMtx, allocs));
    }
    return par * 1.96 * (ttl / iters);
  };
}

function globalSA(rets, corMtx) {

  var iters = 10000;
  var retSA = new Array(rets.length);
  var riskSA = new Array(rets.length);
  for(var i=0; i<rets.length; i++) {
    retSA[i] = 0;
    riskSA[i] = 0;
  }
  // monte carlo integration
  for(i=0; i<iters; i++) {
    // get random point in space
    var alloc = numeric.random([rets.length]);
    alloc = numeric.div(alloc, numeric.sum(alloc));

    // compute all the gradients here
    var gradients = gradient(alloc, rets, corMtx);

    // accumulate
    for(var j=0; j<rets.length; j++) {
      // These exponential gradients are recommended
      retSA[j]  += Math.pow(gradients[j].expReturn, 2);
      riskSA[j] += Math.pow(gradients[j].expRisk, 2);
    }
  }

  return {
    expRisk:   numeric.sqrt(numeric.div(riskSA, iters)),
    expReturn: numeric.sqrt(numeric.div(retSA, iters))
  };
}

module.exports = {
  gradient: gradient,
  globalSA: globalSA,
  genAllocs: genAllocs,
  expReturnIntegral: expReturnIntegral,
  expRiskIntegral: expRiskIntegral
};
