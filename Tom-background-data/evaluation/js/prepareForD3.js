function prepareOverView(data){ // data for OverviewGraph
  var line = prepareLine(data);
  overViewGraph(line[0], line[1]);
}

function prepareDetailsLine(d){ //line Chart Details
  var nameContainer = [],
      container = [],
      step1 = {},  step2 = {}, step3 = {}, step4 = {}, step5 = {};
  container.push(step1,step2,step3,step4,step5);
  for(i in container) container[i]["Step"] = "step"+i;
  
  var xy = filteredData.filter(function(k){return k.id == d;})   
  for(var j =1 ; j<6; j++){
      var saname = "a" +j;
      step1[saname] = xy[0]["portfolio-1-a"+j];
      step2[saname] = xy[0]["portfolio-2-a"+j];
      step3[saname] = xy[0]["portfolio-3-a"+j];
      step4[saname] = xy[0]["portfolio-4-a"+j];
      step5[saname] = xy[0]["portfolio-5-a"+j];
      nameContainer.push("step"+j);
  }
  detailGraph(container, nameContainer);
}

function prepareDetailsBar(d){ //bar Chart Details
  var container = [],
      step1 = {},  step2 = {}, step3 = {}, step4 = {}, step5 = {};
  container.push(step1,step2,step3,step4,step5);
  for(i in container) container[i]["Step"] = "step"+i;
  var xy = filteredData.filter(function(k){return k.id == d;})
  for(var j =1 ; j<6; j++){
    var saname = "a" +j;
    step1[saname] = xy[0]["portfolio-1-a"+j];
    step2[saname] = xy[0]["portfolio-2-a"+j];
    step3[saname] = xy[0]["portfolio-3-a"+j];
    step4[saname] = xy[0]["portfolio-4-a"+j];
    step5[saname] = xy[0]["portfolio-5-a"+j]
  }
  detailBarChart(container);
}

function calcRskRet(data){ //data = filtered Data
  // computing an array for Drawing dots
  var dots = [];
  for(i in data){ // computing Rsk ret for each portfolio
    dots.push({id: data[i].id, 
               rsk: calcExpRisk([data[i]["portfolio-5-a1"],
                                 data[i]["portfolio-5-a2"],
                                 data[i]["portfolio-5-a3"],
                                 data[i]["portfolio-5-a4"],
                                 data[i]["portfolio-5-a5"]],
                                 data[i]["portfolio-5-remainingCash"]),
               ret: calcExpReturn([data[i]["portfolio-5-a1"],
                                   data[i]["portfolio-5-a2"],
                                   data[i]["portfolio-5-a3"],
                                   data[i]["portfolio-5-a4"],
                                   data[i]["portfolio-5-a5"]]),
               inter: data[i]['interface']
              })
  }
  // dots.push({id:1, rsk: calcExpRisk([1900,3100,1000,3100,900],10000), ret: calcExpReturn([1900,3100,1000,3100,900]), inter: "local"});
  // dots.push({id:1,rsk: calcExpRisk([0,0,0,10000,0],10000), ret: calcExpReturn([0,0,0,10000,0]), inter: "local"});
  // dots.push({id:2, rsk: calcExpRisk([0,0,0,0,10000],10000), ret: calcExpReturn([0,0,0,0,10000]), inter: "local"});
  // dots.push({id:3, rsk: 40, ret: 145, inter:"local"});
  return dots;
}

function prepareCompareGraph(){ // data for comparelineChart
  var data2 = [];
  for (i in compare){
    if(data.filter(function(k){ return k.id == compare[i]}) !== undefined){
      data2.push(data.filter(function(k){ return k.id == compare[i]})[0]);
    }
  }
  var line = prepareLine(data2);
  compareOverViewGraph(line[0],line[1]);
}

function prepareLine(data){ // calc Data or LineCharts with Steps on X
  var container = [];
  var nameContainer = [];
  var step1 = {}, step2 = {}, step3 = {}, step4 = {}, step5 = {};
      
  container.push(step1,step2,step3,step4,step5);
  step1['mean'] = 0;
  step2['mean'] = 0;
  step3['mean'] = 0;
  step4['mean'] = 0;
  step5['mean'] = 0;
  nameContainer.push("Step");
  nameContainer.push("mean");
  for(i in container) container[i]["Step"] = "step"+i;
  for(i in data){
    var saname = data[i]["id"];
    step1[saname] = data[i]["portfolio-1-remainingCash"];
    step2[saname] = data[i]["portfolio-2-remainingCash"];
    step3[saname] = data[i]["portfolio-3-remainingCash"];
    step4[saname] = data[i]["portfolio-4-remainingCash"];
    step5[saname] = data[i]["portfolio-5-remainingCash"];
    nameContainer.push(saname);
  }
  //computing mean
  var meanlength = 0;
  for(i in data){
    step1['mean'] = data[i]["portfolio-1-remainingCash"] + step1['mean'];
    step2['mean'] = data[i]["portfolio-2-remainingCash"] + step2['mean'];
    step3['mean'] = data[i]["portfolio-3-remainingCash"] + step3['mean'];
    step4['mean'] = data[i]["portfolio-4-remainingCash"] + step4['mean'];
    step5['mean'] = data[i]["portfolio-5-remainingCash"] + step5['mean'];
    meanlength += 1;
  }
    step1['mean'] = step1['mean'] / (meanlength);
    step2['mean'] = step2['mean'] / (meanlength);
    step3['mean'] = step3['mean'] / (meanlength);
    step4['mean'] = step4['mean'] / (meanlength);
    step5['mean'] = step5['mean'] / (meanlength);
    return [container, nameContainer];
}


