  
var _corrMtx = [
  [0.004261490, 0.001087416, 0.002174691, 0.001185337, 0.003096662],
  [0.001087416, 0.002933865, 0.001476025, 0.001944271, 0.001520384],
  [0.002174691, 0.001476025, 0.004675134, 0.001551799, 0.002466986],
  [0.001185337, 0.001944271, 0.001551799, 0.002757543, 0.001188911],
  [0.003096662, 0.001520384, 0.002466986, 0.001188911, 0.005630227]
  ];
  
var stocks = [];
    stocks.push({'Stock' : 'A','ttlInv' : 0, "ret" : 0.0141, 'rsk' : 0.0043});
    stocks.push({'Stock' : 'B','ttlInv' : 0, "ret" : 0.0142, 'rsk' : 0.0029});
    stocks.push({'Stock' : 'C','ttlInv' : 0, "ret" : 0.0147, 'rsk' : 0.0047});
    stocks.push({'Stock' : 'D','ttlInv' : 0, "ret" : 0.0134, 'rsk' : 0.0028});
    stocks.push({'Stock' : 'E','ttlInv' : 0, "ret" : 0.0164, 'rsk' : 0.0056});

    
function randomSum(n) {
  var xx = numeric.random([n]);  // all between 0 and 1
  var factor = 1;
  for(var d=0; d<(n-1); d++) {
    var oldX = xx[d];
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



var expRiskIntegral = function(rets, _corrMtx, i, par) {
  // 1/6 v w y z (2 a^5 v^2+2 a^4 w^2+2 a^3 z^2+2 a^2 y^2+6 a x^2+3 (2 b x y+2 c x z+2 d w x+2 e v x+f y z+g w y+h v y+i w z+j v z+k v w))
  var iters = 5000;
  return function(x) {
    var ttl = 0;
    for(var j=0; j<iters; j++) {
      var allocs = genAllocs(rets.length, i, x/par);
      ttl += numeric.dot(allocs, numeric.dot(_corrMtx, allocs));
    }
    return par * 1.96 * (ttl / iters);
  };
}

var expReturnIntegral = function(rets, i, par) {
  var iters = 5000;
  return function(x) {
    var ttl = 0;
    for(var j=0; j<iters; j++) {
      var allocs = genAllocs(rets.length, i, x/par);
      ttl += numeric.dot(allocs, rets);
    }
    return par * ttl / iters;
  };
}

var _avgBehavior = function(ttlnvstmnt) {
  var rets = stocks.map(function(s) {return s.ret;});
  var expReturn = [];
  var expRisk = [];
  var ratio = [];
  for(var i=0; i<rets.length; i++) {
    var ret = expReturnIntegral(rets, i, ttlnvstmnt);
    var rsk = expRiskIntegral(rets, _corrMtx, i, ttlnvstmnt);
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
    // console.log(expReturn,expRisk);
  }
  return {expReturn: expReturn, expRisk: expRisk, ratio: ratio};
};
  
  /*
   * #####################
   * computing Dot positions for Rsk/Ret analyisis
   */

  //Allocs =  Array[Amount Stock A, Amount Stock B, Amount Stock C, Amount Stock D, Amount Stock E];
function calcExpRisk(allocs, _ttlInvestment) {
    allocs = numeric.div(allocs, _ttlInvestment);
    var rsk = numeric.dot(allocs, numeric.dot(allocs, _corrMtx));
    return rsk * 1.96 * _ttlInvestment;
  }
  
function calcExpReturn(allocs) {
    var rets = stocks.map(function(s) {return s.ret;});
    return numeric.dot(allocs, rets);
  }
  
function calcOptimalCurve(){
  var jumps = 1;
  var ttl = 100;
  var amountleft = 100;
  var stocks = [0,0,0,0,0];
  var best = [0,0,0,0,0];
  var lastRsk = 1, lastRet = 1;
  var update = 0;
  for (var i = 0; i <= amountleft; i += jumps){
    stocks[0] = i;
    var amountleftB = ttl-(stocks[0]);
    for (var j = 0; j <= amountleftB; j += jumps){
      stocks[1] = j;
      var amountleftC = ttl-(stocks[0]+stocks[1]);
      for (var k = 0; k <= amountleftC; k += jumps){
        stocks[2] = k;
        var amountleftD = ttl-(stocks[0]+stocks[1]+stocks[2]);
        for (var l = 0; l <= amountleftD; l += jumps){
          stocks[3] = l;
          var amountleftE = ttl-(stocks[0]+stocks[1]+stocks[2]+stocks[3]);
          for (var m = 0; m <= amountleftE; m += jumps){
            stocks[4] = m;
            var amountleft_total = ttl-(stocks[0]+stocks[1]+stocks[2]+stocks[3]+stocks[4]);
            if(amountleft_total == 0){
              var rsk = calcExpRisk(stocks, ttl);
              var ret = calcExpReturn(stocks);
              if((ret/rsk) > (lastRet/lastRsk)){ 
                lastRsk = rsk; 
                lastRet = ret;
                best = JSON.parse(JSON.stringify(stocks));
                update ++;
              }
            }
          }
        }
      }
    }
  }
  
  console.log("update", update);
  return best;
 //[1900, 3100, 1000, 3150, 850]
}     

function calcCurve(){
  var rets = stocks.map(function(s) {return s.ret;});
  var ttls = [1900,3100,1000,3100,900],
      A = [],  B = [], C = [], D = [], E = []
      rr = [];
      rr.push(A,B,C,D,E);
      console.log(rr["A"]);
  var avg = _avgBehavior(10000);
  for ( var i = 0; i < 3200; i+=100){  
    if(i<ttls[0]) rr[0].push({rsk: avg.expRisk[0](i), ret: avg.expReturn[0](i), ratio: avg.ratio[0](i)})
    if(i<ttls[1]) rr[1].push({rsk: avg.expRisk[1](i), ret: avg.expReturn[1](i), ratio: avg.ratio[1](i)})
    if(i<ttls[2]) rr[2].push({rsk: avg.expRisk[2](i), ret: avg.expReturn[2](i), ratio: avg.ratio[2](i)})
    if(i<ttls[3]) rr[3].push({rsk: avg.expRisk[3](i), ret: avg.expReturn[3](i), ratio: avg.ratio[3](i)})
    if(i<ttls[4]) rr[4].push({rsk: avg.expRisk[4](i), ret: avg.expReturn[4](i), ratio: avg.ratio[4](i)})
    
  }
  for (i in rr[0]){
    console.log(rr[0][i].ret, rr[0][i].rsk)
  }
  console.log("-")
  for (i in rr[1]){
    console.log(rr[1][i].ret, rr[1][i].rsk)
  }
  console.log("-")
  for (i in rr[2]){
    console.log(rr[2][i].ret, rr[2][i].rsk)
  }
  console.log("-")
  for (i in rr[3]){
    console.log(rr[3][i].ret, rr[3][i].rsk)
  }
  console.log("-")
  for (i in rr[4]){
    console.log(rr[4][i].ret, rr[4][i].rsk)
  }
  
} 



  