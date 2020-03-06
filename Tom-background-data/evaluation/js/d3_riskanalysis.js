function riskAnalysisDots(data){ 
  var svg = d3.select("#svg_riskanalysis");
  
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      // width = parseInt(svg.style("width")) - margin.left - margin.right,
      width = 400 - margin.left - margin.right,
      // height = parseInt(svg.style("width")) - margin.top - margin.bottom,
      height = 400 - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var xmax = d3.max(data, function(d){ return +d.rsk}),
      xmin = d3.min(data, function(d){ return +d.rsk}),
      ymax = d3.max(data, function(d){ return +d.ret}),
      ymin = d3.min(data, function(d){ return +d.ret});   
  
  var x = d3.scaleLinear()  
    // .domain([0,180])
    .domain([(xmin -10),(xmax +10)])
    .range([0, width]);
  
  var y = d3.scaleLinear()
  // .domain([0,180])
    .domain([(ymin -10),(ymax+10)])
    .range([ height,0]);

  var z = d3.scaleOrdinal()
      .range(["#ff8c00", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);  
  
  
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  g.selectAll(".dot")
    .append("g")
    .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("interface", function(d){ var x = filteredData.filter(function(k){ return k.id == d.id;}); return x[0]['interface']}) 
      .attr("fill",function(d){ var x = filteredData.filter(function(k){ return k.id == d.id;}); return z(x[0]['interface'])}) 
    .attr("id", function(d){return d.id})
      .attr("r", 4)
      .attr("cx", function(d){return x(d.rsk);})
      .attr("cy", function(d){return y(d.ret);})
      .on("mouseover", function(d) {
        fillCurrentInfo(d.id);
        div.transition()
          .duration(200)
          .style("opacity", 1);
        div.html(d.inter + "<br>" + d.id)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        
        d3.selectAll(".dot")
          .style("opacity", 0.3)
          .style("r", 3)
        d3.selectAll('circle[interface='+d['inter']+']')
           .style("r", 5)
           .style("opacity", 1)
        
        //for highligting the line in overviewgraph
        d3.selectAll(".line2")
          .style("opacity", 0.3)
          
        d3.select('path[id="'+d.id+'"]')
           .style("stroke-width", 4)
           .style("opacity", 1)
           .style("stroke", "black")
           
        d3.select(this)
          .attr("fill", "black")
        
        $('.actualDistance').html('');
        var x = allmin.filter(function(k){ return k.id == d.id;});
        $('#actualDistance_'+d.inter).html(Math.round(x[0].dist*100)/100);
           })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
                  
        d3.selectAll('.dot')
          .style("opacity", 1)
          .style("r", 4)
          
        d3.select(this)
          .attr("fill",function(d){ var x = filteredData.filter(function(k){ return k.id == d.id;}); return z(x[0]['interface'])}) 
        
        //highlight overview lines
        d3.select('path[id="'+d.id+'"]')
          .style("stroke-width", 2)
          .style("stroke", color(d.id))
        d3.selectAll('.line2')
          .style("opacity", 1)
        d3.selectAll("path[clicked=yes]")
          .style("stroke-width", 3)
          .style("stroke", "black")
        d3.selectAll("path[clicked=no")
          .style("opacity", 1)
      })
      .on("click", function(d) {
        if (d.id != "mean"){
          d3.selectAll("path[clicked=yes]")
            .attr("clicked","no")
            .style("stroke", color(d.id))
          d3.select('#'+d.inter+"-"+d.id)
            .attr("clicked", "yes")
            .style("stroke", "black")
            .style("stroke-width", 3)
            
            $( "#"+d.inter+"-"+d.id).trigger( "click" );
            updateDetailGraphs(d.id);
            fillCurrentInfo(d.id);
            $('#toCompareCheckbox').show();
        }
      });
      
  g.append("g")            // x Axis
    .attr("class", "x_axis axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")           // y Axis
    .attr("class", "y_axis axis")
    .style("fill", "black")
    .call(d3.axisLeft(y));	  
    
  
  
  //Optimal Line
  
  var optlinedata = [];
      // o = [1890, 3120, 1020, 3120, 850];      //Computed optimal Stocks in Steps of 10! for 100000
      // o = [2835, 4680, 1530, 4680, 1275];      //Computed optimal Stocks in Steps of 10! for 110000

      // 27,685*X^0.5 Optimal Curve Eqn with Stocks of 110000
  
  for (var i = xmin-10; i< xmax+10; i+=1){
    if((27.685*(Math.pow(i,0.5))) > ymin-10){
      optlinedata.push({"rsk": i, "ret":  (27.685*(Math.pow(i,0.5)))});
    }
  }

  var optline = d3.line()
    .x(function(d) {return x(d.rsk); })
    .y(function(d) {return y(d.ret); });
  
  // g.append("g")
    // .selectAll("optline")
    // .data([optlinedata])
    // .enter().append("path")
    // .attr("class", "optline")
    // .style("stroke", "blue")
    // .attr("d",function (d) {return optline(d); })
    // .attr("fill", "none")

  // computing minimum Distance to Curve foreach dot foreach interface
  // data = dots [id, rsk, ret, inter]
  //computing distance on x  
  //computing distance on y  
  //computing each distance on curve between intersections to dot
  // y = 27.685*X^0.5 // curve
  
  var allmin = [];
  for(d of data){
    var yd = d.ret,
        xd = d.rsk,    
        Xc = Math.pow(yd/27.685, 2),
        Yc = 27.685*Math.sqrt(xd),
        max = Math.pow(Yc/27.685, 2),
        min = 1000000,
        tempX = 0,
        tempY = 0;
      
    for (i = Math.ceil(Xc) ; i < max; i+= 1){
      
      Yc = 27.685*Math.sqrt(i);
      var l = Math.sqrt(Math.pow((i-xd),2) + Math.pow((Yc-yd),2));
      if(l < min) {
        min = l;
        tempX = i;
        tempY = 27.685*Math.sqrt(i);
      }
    }
    allmin.push({"id": d.id, "inter": d.inter, "dist": min,"X": tempX, "Y": tempY}) // x,y positions on the curve
    
    
  } 
  //distinct interfaces
  var flags = [], output = [], l = allmin.length, i;
  for( i=0; i<l; i++) {
      if( flags[allmin[i].inter]) continue;
      flags[allmin[i].inter] = true;
      output.push(allmin[i].inter);
  }
  // Distinct Code from http://stackoverflow.com/questions/15125920/how-to-get-distinct-values-from-an-array-of-objects-in-javascript

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")    
      .data(output)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
      .attr("interface", function(d){ return d});
  
  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", colorLegend)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
    

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
      
      
  function handleMouseOver(d, i) {
    d3.selectAll(".dot")
      .style("opacity", 0.3)
      .style("r", 3)
    d3.selectAll('circle[interface='+d+']')
       .style("r", 5)
       .style("opacity", 1)
  };    
  function handleMouseOut(d, i) {
    div.transition()
      .duration(500)
      .style("opacity", 0);
        
    d3.selectAll('.dot')
      .style("opacity", 1)
      .style("r", 4)};    
  
  // Measurements in tabelarian
  
  /* For each Dot compute distance //allmin[]
     increase count for this interface
     compute mean distance per portfoio
     display values 
     on mouseover display this distance in tabel */
    
    var temp = {};
    for (var i = 0; i < allmin.length; i++){
      if(temp[allmin[i].inter] === undefined) {temp[allmin[i].inter] = 0};
      temp[allmin[i].inter] += allmin[i].dist;
      if(temp[allmin[i].inter + "_count"] === undefined) {temp[allmin[i].inter + "_count"] = 0};
      temp[allmin[i].inter + "_count"] += 1
    }

  var meanDist = [];
  for (i in output){
    meanDist.push({inter: output[i], mean: temp[output[i]]/temp[output[i]+"_count"] });
  }
  
  var tabeloutput = "<tbody id='tableDetails'><tr><th><i>Interface</i></th><th><i>Correlation</i></th><th><i>Mean Distance</i></th><th><i>Actual Distance</i></th></tr>";
  for (i in meanDist){
    tabeloutput += "<tr><td>"+meanDist[i].inter+"</td><td id='correl_"+meanDist[i].inter+"'></td><td>"+Math.round(meanDist[i].mean*100)/100+"</td><td class='actualDistance' id='actualDistance_"+meanDist[i].inter+"'</tr>";
  }
  tabeloutput +="</tbody>";
  // $('#tbl_riskdot_mean').html(tabeloutput);
  
  //computing correlaton coefficient
  
  // printDistance(data)
}

function printDistance(data){
  
  var mean = {};
  for(i in di){
    mean[di[i]] = 0;
    mean[di[i]+"_lf"] = 0
  }
  var o = {};
  o.rsk = calcExpRisk([1900,3100,1000,3100,900],10000);
  o.ret = calcExpReturn([1900,3100,1000,3100,900]);
  // console.log(o);
  for (i in data){
        
    mean[data[i].inter] += distance = Math.sqrt(Math.pow((data[i].rsk-o.rsk),2) + Math.pow((data[i].ret-o.ret),2));
    mean[data[i].inter+"_lf"] += 1
    // console.log("dist", distance);
    
  }
  // for (i in di) {
    // console.log(di[i], (mean[di[i]]/(mean[di[i]+"_lf"])));
  // }
  // console.log(mean)
}
