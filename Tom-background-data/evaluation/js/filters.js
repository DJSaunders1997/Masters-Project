function filterreset(){
  filteredData = JSON.parse(JSON.stringify(data));
}

function applyFilters(name, rad){
  if(name == "radio_invExp"){
    filter_invExp(filteredData, rad);
  }
  if(name == "radio_comExp"){
    filter_comExp(filteredData, rad);
  }
  if(name == "radio_gender"){
    filter_gender(filteredData, rad);
  }
  if(name == "radio_age"){
    filter_age(filteredData, rad);
  }
  if(name == "radio_dataset"){
    filter_dataset(filteredData, rad);
  }
}


function filter_invExp(d, f){
  var data = [];
  for(i in d){
    if (f != d[i]['demographics-investment-experience']){
      data.push(d[i]);
    }
  }
  filteredData = data;
}

function filter_comExp(d, f){
  var data = [];
  for(i in d){
    if (f != d[i]['demographics-computer-experience']){
      data.push(d[i]);
    }
  }
  filteredData = data;
}

function filter_gender(d, f){
  var data = [];
  for(i in d){
    if (f != d[i]['demographics-gender']){
      data.push(d[i]);
    }
  }
  filteredData = data;
}

function filter_age(d, f){
  var data = [];
  for(i in d){
    
    if(f == 1){
      if(d[i]['demographics-age'] > 20){
        data.push(d[i]);
      }
    }
    else if(f == 2){
      if(20 >= d[i]['demographics-age'] || d[i]['demographics-age'] > 30){
        data.push(d[i]);
      }
    }      
    else if (f == 3){
      if(d[i]['demographics-age'] <= 30){
        data.push(d[i]);
      }
    }
  }
  filteredData = data;
}

function filter_dataset(d, f){
  /*alle daten Vorhanden
   * ausgewähltes muss weg --> alles data.push das NICHT ausgewähltem entspricht
  */
  var data = [];
  for(i in d){
    if(f.split("-")[0].toLowerCase() != d[i]['dataset-type'].toLowerCase()){
      data.push(d[i]);
    }
    else if(f.split("-")[1] != d[i]['interface']){
      data.push(d[i]);
    }
  }
  filteredData = data;
}