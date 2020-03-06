
function getTime(d){
  var xy = filteredData.filter(function(k){return k.id == d;}),
      time = 0;
  for (var j = 1; j< 6; j++){
    time = time + parseInt(xy[0]["timing-"+j+"-totalTime"]);
  }
  return time;
}

function computeDetails(d){
  var xy = filteredData.filter(function(k){return k.id == d;})
  var time = getTime(d);
      
  $('#computerExperience').html(xy[0]["demographics-computer-experience"]);
  $('#investmentExperience').html(xy[0]["demographics-investment-experience"]);
  $('#timeToComplete').html(Math.round(time/600)/100);
  thisDataSet = d;
  $('#checkToCompare').prop("checked", false);
  
  // if(compare.filter(function(k){return k == }
  for ( k in compare){
    if(compare[k] == d){
      $('#checkToCompare').prop("checked", true);
      break;
    }
  }
}

function fillCurrentInfo(d){
  var xy = data.filter(function(k){return k.id == d;})
  var time = getTime(d);

  $('#computerExperienceAct').html(xy[0]["demographics-computer-experience"]);
  $('#investmentExperienceAct').html(xy[0]["demographics-investment-experience"]);
  $('#timeToCompleteAct').html(Math.round(time/600)/100);
}

function addDataSet(d){
  if(data.filter(function(k){return k.id == d;}) !== undefined){ //filteredData.filter
    compare.push(d);
  }
}

function removeDataSet(d){
  for (i in compare){
    if(compare[i] == d){
      compare.splice(i, 1);
      break;
    }
  }
}

function computeOverallDetails(da){
  var output = "<tr style='border-bottom: 1px solid black'><th>Interface</th><th>correl</th><th>mean Age</th><th>mean Return</th><th>mean time</th><th>M/F[%]</th></tr>"; // T-HEADER
  var temp = {};
  for (i in di){
    temp['age'] = 0;
    temp['ret'] = 0;
    temp['genderM'] = 0;
    temp['genderF'] = 0;
    temp['time'] = 0;
    var lf = 0;
    for (j in filteredData){
      if(filteredData[j]["interface"] == di[i]){
        temp['age'] += filteredData[j]['demographics-age'];
        temp['ret'] += filteredData[j]['portfolio-5-remainingCash'];
        if(filteredData[j]['demographics-gender'] == "M") temp['genderM'] +=1 ;
        if(filteredData[j]['demographics-gender'] == "F") temp['genderF'] +=1 ;
        temp['time'] += getTime(filteredData[j].id);
        lf ++;
      }
    }
    output += "<tr><td>"+di[i]+"</td>"+
                  "<td id='correl_"+di[i]+"'></td>"+
                  "<td>"+Math.round(temp['age']/lf*100)/100+"</td>"+
                  "<td>"+Math.round(temp['ret']/lf*100)/100+"</td>"+
                  "<td>"+Math.round((temp['time']/lf)/600)/100+"</td>"+
                  "<td>"+Math.round(temp['genderF'] / (temp['genderF']+temp['genderM'])*100*10)/10+" / "
                        +Math.round(temp['genderM']/ (temp['genderF']+temp['genderM'])*100*10)/10+"</td>"+
              "</tr>";
    
  }
  
    temp['age'] = 0;
    temp['ret'] = 0;
    temp['genderM'] = 0;
    temp['genderF'] = 0;
    temp['time'] = 0;
  
  for (j in filteredData){
    temp['age'] += filteredData[j]['demographics-age'];
    temp['ret'] += filteredData[j]['portfolio-5-remainingCash'];
    if(filteredData[j]['demographics-gender'] == "M") temp['genderM'] +=1 ;
    if(filteredData[j]['demographics-gender'] == "F") temp['genderF'] +=1 ;
    temp['time'] += getTime(filteredData[j].id);
  }
    output += "<tr style='border-top: 1px solid black'><td>Global</td><td></td>"+
                "<td>"+Math.round(temp['age']/filteredData.length*100)/100+"</td>"+
                "<td>"+Math.round(temp['ret']/filteredData.length*100)/100+"</td>"+
                "<td>"+Math.round((temp['time']/filteredData.length)/600)/100+"</td>"+
                "<td>"+Math.round(temp['genderF'] / (temp['genderF']+temp['genderM'])*100*10)/10+" / "
                      +Math.round(temp['genderM']/ (temp['genderF']+temp['genderM'])*100*10)/10+"</td>"+
            "</tr>";
    
  $('#tableDetailsglobal').html(output);
  
  for (i in di){
    console.log("coorel" ,di[i],da)
    $('#correl_'+di[i]).html(Math.round(calcCorrel(da, di[i])*1000)/1000);;
  }
 
  
}
function calcCorrel(da, inter){
  var meanRsk =0, meanRet= 0,a = 0, b = 0, c = 0, d = 0, sumRsk = 0, sumRet = 0;
  for (var i = 0; i < da.length ;i++){
    if(da[i].inter == inter){
      sumRsk += da[i].rsk;
      sumRet += da[i].ret;
      d++;
      
    }
  }
  meanRsk = sumRsk / d;
  meanRet = sumRet / d;
  var a = 0, b = 0, c = 0;
  for (var i = 0; i < da.length ;i++){
    if(da[i].inter == inter){
      a += (da[i].rsk - meanRsk)*(da[i].ret- meanRet);
      b += Math.pow(da[i].rsk - meanRsk, 2);
      c += Math.pow(da[i].ret - meanRet, 2);
    }
  }
  console.log(a ,b,c)
  return correl = a / (Math.sqrt(b*c));
}

  