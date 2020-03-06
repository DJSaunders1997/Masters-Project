function overViewGraph(container, nameContainer){
  var svg = d3.select("#svg_overviewGraph"),
      margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = parseInt(svg.style("width")) - margin.left - margin.right,
      height = parseInt(svg.style("height")) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
  x = d3.scaleBand()
		.rangeRound([0, width])
    .domain(container.map(function(d) { return d.Step; }));

  var bandSize = x.bandwidth();  
    
  var y = d3.scaleLinear()
    .domain([10000,11000])
    .range([ height,0]);

  var valueline = d3.line() 
    .x(function(d) {return x(d.steps); })
    .y(function(d) {return y(d.value); });
  
  var div = d3.select(".tooltip");
    
  container.columns = nameContainer;
  var linedata = container.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: container.map(function(d) {
        return {steps: d.Step, value: d[id]};
      })
    };
  });
  g.append('text')
  .attr('class', 'title')
  .attr('x', width / 2)
  // .attr('y', 25)
  .attr('text-anchor', 'middle')
  .text('Overview to Returnvalues')
  
  g.append("g")            // Add the X Axis
    .attr("class", "x_axis axis")
    .attr("transform", "translate(0," + height + ")")
    
    .call(d3.axisBottom(x));

  g.append("g")           // y Axis
    .attr("class", "y_axis axis")
    .style("fill", "black")
    .call(d3.axisLeft(y));	
  
  g.append("g")
    .selectAll("g")
    .data(linedata)
    .enter().append("path")
      .attr("transform", "translate("+bandSize/2+",0)") 
      .attr("class", function(d){ if(d.id == "mean") return "mean line2"; return ("line2 "+ d.id)})
      .attr("fill", "none")
      .attr("max",function(d){return Math.round(d.values[d.values.length - 1].value * 100) / 100})
      .attr("clicked","no")
      .attr("id", function(d){return d.id})
      .attr("interface", function(d){ if(d.id == "mean"){return "mean";}var xy = filteredData.filter(function(k){ return k.id == d.id;}); return xy[0]['interface']}) 
      .style("stroke-dasharray", function(d) {if(d.id == "mean") return("3, 3"); return("0,0"); })
      .style("stroke", function(d) {return color(d.id)})
      .attr("d",function (d) { return valueline(d.values); })
      .on("mouseover", onlineOver)
      .on("mouseout", onlineOut)
      .on("click", onlineClick);
      
      
  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")    
      .data(di)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
      .attr("interface", function(d){ return d});
  
  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", colorLegend)
      .on("mouseover", legendeMouseOver)
      .on("mouseout", legendeMouseOut);
    

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
      
  //Mouseaction
  function legendeMouseOver(d, i) {    
        d3.selectAll(".line2")
          .style("opacity", 0.1)
          .attr("stroke-width", 0.2)
        d3.selectAll('path[interface='+d+']')
           .style("opacity", 1)
           .attr("stroke-width", 1)
    
  };    
  function legendeMouseOut(d, i) {
    div.transition()
          .duration(500)
          .style("opacity", 0);       
          
        d3.selectAll('.path')
          .style("opacity", 1)
          .style("r", 4)
          .attr("stroke-width", 1)

  }    
  function onlineOver(d) {
    fillCurrentInfo(d.id);
    div.transition()
      .duration(200)
      .style("opacity", 1);
    div.html(d.id + "<br>" + Math.round(d.values[d.values.length - 1].value * 100) / 100)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    d3.selectAll(".line2")
      .style("opacity", 0.1)
      .attr("stroke-width", 0.2)
    d3.select(this)
       .style("stroke-width", 2)
       .style("opacity", 1)
       .style("stroke", "black")
       
    d3.select('circle[id="'+d.id+'"]')
      .attr("fill", "black");
  }
  function onlineOut(d) {
    div.transition()
      .duration(500)
      .style("opacity", 0);
    d3.select(this)
      .style("stroke", color(d.id))
    d3.selectAll('.line2')
      .style("opacity", 1)
      .attr("stroke-width", 2)

    d3.selectAll("path[clicked=yes]")
      .style("stroke-width", 3)
      .style("stroke", "black")
    d3.selectAll("path[clicked=no")
      .style("opacity", 1)
      
     d3.select('circle[id="'+d.id+'"]')
     .attr("fill",function(d){ var x = filteredData.filter(function(k){ return k.id == d.id;}); return colorLegend(x[0]['interface'])})
  }      
  function onlineClick(d) {
    $('#svg_detailGraph').html('');
    $('#svg_detailGraphBarChart').html('');
    $('#overviewDetails').show();
    if (d.id != "mean"){
      d3.selectAll("path[clicked=yes]")
        .attr("clicked","no")
        .style("stroke", color(d.id))
      d3.select(this)
        .attr("clicked", "yes")
        .style("stroke", "black")
    
      d3.select(this)
        .style("stroke-width", 3)
      
      updateDetailGraphs(d.id);
      fillCurrentInfo(d.id);
      $('#toCompareCheckbox').show();
    }
  };
           
}
