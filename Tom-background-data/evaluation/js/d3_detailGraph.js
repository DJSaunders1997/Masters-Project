function detailGraph(container, n){
  var svg = d3.select("#svg_detailGraph"),
      margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = parseInt(svg.style("width")) - margin.left - margin.right,
      height = parseInt(svg.style("height")) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");  
  
  var x = d3.scaleBand()
		.range([0, width])
    .domain(container.map(function(d) { return d.Step; }))
    
	var y = d3.scaleLinear()
    .domain([9900,11200])
    .range([ height,0]);
    
  var y1 = d3.scaleLinear()
    .domain([-300,10000])
    .range([ height,0]);
  var bandSize = x.bandwidth();
 
  var z = d3.scaleOrdinal()
      .range(["#ff8c00", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var valueline = d3.line() 
    .x(function(d) {return x(d.steps); })
    .y(function(d) {return y1(d.value); });
  
  var svg = d3.select("#svg_detailGraph")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
  container.columns = ["Step", "a1", "a2", "a3", "a4", "a5"];

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  
  var keys = container.columns.slice(1);
  
  var linedata = container.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: container.map(function(d) {
        return {steps: d.Step, value: d[id]};
      })
    };
  });
  var maxes =[];
  for (i in container){
    var temp = container[i]
    for (j in temp) {
      if(typeof(temp[j]) != "string"){
        maxes.push(temp[j]);   
      }
    }
  }
  
  y1.domain([-50, d3.max(maxes)+500]);
  
  
  g.append("g")            // Add the X Axis
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")           // y Axis
    .attr("class", "y axis")
    .style("fill", "black")
    .call(d3.axisLeft(y1));	
    
  g.selectAll("gChart")
    .data(linedata)
    .enter().append("path")
      .attr("transform", "translate("+bandSize/2+",0)")
      .attr("class", function(d){return ("line4 " + d.id);})
      .attr("fill", "none")
      .attr("d",function (d) {return valueline(d.values); })
      .style("stroke", function(d) {return z(d.id)})
      .on("mouseover", function(d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(d.id + "<br>" + Math.round(d.values[d.values.length - 1].value * 100) / 100)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        d3.select(this)
           .style("stroke-width", 3)
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
        d3.select(this)
           .style("stroke-width", 2)
      }) 
    g.selectAll("gChart")
      .append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.steps) + "," + y(d.value.value) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

   var legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
    
}