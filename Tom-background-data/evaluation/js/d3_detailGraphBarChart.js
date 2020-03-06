function detailBarChart(container){
  var svg = d3.select("#svg_detailGraphBarChart"),
      margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = parseInt(svg.style("width")) - margin.left - margin.right,
      height = parseInt(svg.style("height")) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x0 = d3.scaleBand()
      .range([0, width])
      .paddingInner(0.1);

  var x1 = d3.scaleBand()
      .padding(0.05);

  var y = d3.scaleLinear()
      .domain([0, 10000])
      .rangeRound([height, 0]);
      
  var z = d3.scaleOrdinal()
      .range(["#ff8c00", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  container.columns = ["Step", "a1", "a2", "a3", "a4", "a5"];
  var keys = container.columns.slice(1);

  x0.domain(container.map(function(d) { return d.Step; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
 
  var maxes =[];
  for (i in container){
    var temp = container[i]
    for (j in temp) {
      if(typeof(temp[j]) != "string"){
        maxes.push(temp[j]);   
      }
    }
  }
  y.domain([0, d3.max(maxes)+500]);
  
  g.append('text')
  .attr('class', 'title')
  .attr('x', (width) / 2)
  .attr('y', 25)
  .attr('text-anchor', 'middle')
  .text('Stocks picked / Step')
  //barchart
  g.append("g")
    .selectAll("g")
    .data(container)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.Step) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return z(d.key); })
      .attr("class", "bar");

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

  g.append("g")           // y Axis
      .attr("class", "y axis")
      .style("fill", "black")
      .call(d3.axisLeft(y))
  var legend = g.append("g")
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