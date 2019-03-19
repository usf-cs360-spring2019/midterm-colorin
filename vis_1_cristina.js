
var drawLineGraph = function(data) {
  let dataPoints = {2014:[], 2015:[], 2016:[], 2017:[], 2018:[]};
  for (let i = 0; i<data.length; i++) {
    if (data[i]["Year of Call Date"] in dataPoints) {
      dataPoints[data[i]["Year of Call Date"]].push({
        "x": data[i]["Month of Call Date"],
        "y": parseInt(data[i]["Total Number of Records"].replace(/,/g, "")),
        "y2": parseInt(data[i]["Number of Records (Call Type Group = Fire)"].replace(/,/g, "")),
        "y3": parseInt(data[i]["Number of Records (Call Final Disposition = Fire)"].replace(/,/g, "")),
        "year": data[i]["Year of Call Date"],
      });
    };
  };

  let colors = ["#4E79A7","#F28E2B","#E15759", "#76B7B2", "#59A14F"];
  let colorYears = {
    2014: "#4E79A7",
    2015: "#F28E2B",
    2016: "#E15759",
    2018: "#59A14F",
    2017: "#76B7B2",
    2018: "#59A14F",
  };
  let years = ["2014", "2015", "2016", "2017", "2018"];
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let svg = d3.select("body").select("#vis1");

  let margin = {
    top:    60,
    right:  100,
    bottom: 40,
    left:   60
  };
  let bounds = svg.node().getBoundingClientRect();
  let plotWidth = bounds.width - margin.right - margin.left;
  let plotHeight = bounds.height - margin.top - margin.bottom;

  let countMin = 20000;
  let countMax = 28000;

  let x = d3.scaleBand()
    .domain(months)
    .range([0, plotWidth])
    .paddingOuter(0.2);
  let y = d3.scaleLinear()
    .domain([countMin, countMax])
    .rangeRound([plotHeight, 0]);

  let xAxis = d3.axisBottom(x)
    .tickSize(0);
  let yAxis = d3.axisLeft(y)
    .tickSize(0);

  // fix the plot area
  let plot = svg.append("g").attr("id", "plot");
  plot.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // draw x-axis and y-axis
  plot.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + plotHeight + ")")
    .call(xAxis);
  plot.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis);

  // show gridlines
  var gridlines = d3.axisLeft(y)
    .tickFormat("")
    .tickSize(-plotWidth);
  plot.append("g")
    .call(gridlines)
    .attr("class", "gridlines")
    .attr("color", "#E2E2E2");

  // creating the lines
  let shift = 35;

  var lineFunction = d3.line()
    .x(function(d) { return x(d.x) + shift; })
    .y(function(d) { return y(d.y); });

  plot.append("path")
    .attr("class", "line_2014")
    .attr("d", lineFunction(dataPoints[2014]))
    .attr("stroke", colorYears[2014])
    .attr("stroke-width", 3)
    .attr("fill", "none");
  plot.append("path")
    .attr("class", "line_2015")
    .attr("d", lineFunction(dataPoints[2015]))
    .attr("stroke", colorYears[2015])
    .attr("stroke-width", 3)
    .attr("fill", "none");
  plot.append("path")
    .attr("class", "line_2016")
    .attr("d", lineFunction(dataPoints[2016]))
    .attr("stroke", colorYears[2016])
    .attr("stroke-width", 3)
    .attr("fill", "none");
  plot.append("path")
    .attr("class", "line_2017")
    .attr("d", lineFunction(dataPoints[2017]))
    .attr("stroke", colorYears[2017])
    .attr("stroke-width", 3)
    .attr("fill", "none");
  plot.append("path")
    .attr("class", "line_2018")
    .attr("d", lineFunction(dataPoints[2018]))
    .attr("stroke", colorYears[2018])
    .attr("stroke-width", 3)
    .attr("fill", "none");

  // Add axis and graph titles
  svg.append("text")
    .attr("class", "chart_title")
    .style("font-size", "21")
    .attr("y", margin.top/2 + 4)
    .attr("x", 10)
    .style("text-anchor", "start")
    .text("Total Number of Calls Through the Years 2014-2018 by Month");
  plot.append("text")
    .style("font-size", "14")
    .attr("transform",
        "translate(" + (plotWidth/2) + " ,"
        + (plotHeight + 30) + ")")
    .style("text-anchor", "middle")
    .text("Month of Call");
  plot.append("text")
    .style("font-size", "14")
    .attr("class", "y_axis_title")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 6)
    .attr("x", -(plotHeight/2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Total Number of Calls");

  // Add legend
  let legendTitle = svg.append("text")
    .style("font-size", "10")
    .style("text-anchor", "start")
    .style("font-weight", "bold")
    .attr("transform", "translate(" + (plotWidth + margin.left + 10) + "," + margin.top/2 +  ")")
    .text("Year of Calls");

  let legend = svg.selectAll(".legend")
    .data(colors)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(50," + i * 13 + ")"; });

  legend.append("rect")
    .attr("x", plotWidth - 10)
    .attr("width", 10)
    .attr("height", 10)
    .attr("transform", "translate(33,35)")
    .style("fill", function(d, i) {return colors.slice()[i];});

  legend.append("text")
    .style("font-size", "9")
    .style("text-anchor", "start")
    .attr("x", plotWidth + 5)
    .attr("y", 0)
    .attr("transform", "translate(33,43)")
    .text(function(d, i) { return years[i]; });

  // Add buttons for interactivity
  let allGroup = ["Total Calls Years 2014-2018", "Fire-Related Calls 2014-2018", "Call-Final-Disposition:Fire 2014-2018"];

  var dropdownButton = d3.select("#change_views").append('select');

//class="btn btn-secondary dropdown-toggle"
  // add the options to the button
  dropdownButton
    .selectAll('myOptions')
   	.data(allGroup)
    .enter()
  	.append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; });

  // When the button is changed, run the updateChart function
  dropdownButton.on("change", function(d) {
    var selectedOption = d3.select(this).property("value")
    updateChart(selectedOption);
  });

  function updateChart(chart) {
    if (chart === "Total Calls Years 2014-2018") {
      svg.select(".chart_title").text("Total Number of Calls Through the Years 2014-2018 by Month");
      plot.select(".y_axis_title").text("Total Number of Calls")

      y.domain([20000, 28000]);
      plot.select(".y-axis").call(yAxis);
      gridlines = d3.axisLeft(y)
        .tickFormat("")
        .tickSize(-plotWidth);
      plot.select(".gridlines").call(gridlines);

      lineFunction
        .x(function(d) { return x(d.x) + shift; })
        .y(function(d) { return y(d.y); });

      plot.select(".line_2014").attr("d", lineFunction(dataPoints[2014]));
      plot.select(".line_2015").attr("d", lineFunction(dataPoints[2015]));
      plot.select(".line_2016").attr("d", lineFunction(dataPoints[2016]));
      plot.select(".line_2017").attr("d", lineFunction(dataPoints[2017]));
      plot.select(".line_2018").attr("d", lineFunction(dataPoints[2018]));
    }
    else if (chart === "Call-Final-Disposition:Fire 2014-2018") {
      svg.select(".chart_title").text("Number of Calls with a 'Fire' Call Final Disposition Code Through Years 2014-2018 by Month");
      plot.select(".y_axis_title").text("Number of Calls with Code:Fire")

      y.domain([1000, 9000]);
      plot.select(".y-axis").call(yAxis);
      gridlines = d3.axisLeft(y)
        .tickFormat("")
        .tickSize(-plotWidth);
      plot.select(".gridlines").call(gridlines);

      lineFunction
        .x(function(d) { return x(d.x) + shift; })
        .y(function(d) { return y(d.y3); });

      plot.select(".line_2014").attr("d", lineFunction(dataPoints[2014]));
      plot.select(".line_2015").attr("d", lineFunction(dataPoints[2015]));
      plot.select(".line_2016").attr("d", lineFunction(dataPoints[2016]));
      plot.select(".line_2017").attr("d", lineFunction(dataPoints[2017]));
      plot.select(".line_2018").attr("d", lineFunction(dataPoints[2018]));
    }
    else {
      svg.select(".chart_title").text("Number of Fire-Related Calls Through the Years 2014-2018 by Month");
      plot.select(".y_axis_title").text("Number of Fire-Related Calls")

      y.domain([500, 1200]);
      plot.select(".y-axis").call(yAxis);
      gridlines = d3.axisLeft(y)
        .tickFormat("")
        .tickSize(-plotWidth);
      plot.select(".gridlines").call(gridlines);

      lineFunction
        .x(function(d) { return x(d.x) + shift; })
        .y(function(d) { return y(d.y2); });

      plot.select(".line_2014").attr("d", lineFunction(dataPoints[2014]));
      plot.select(".line_2015").attr("d", lineFunction(dataPoints[2015]));
      plot.select(".line_2016").attr("d", lineFunction(dataPoints[2016]));
      plot.select(".line_2017").attr("d", lineFunction(dataPoints[2017]));
      plot.select(".line_2018").attr("d", lineFunction(dataPoints[2018]));
    }
  };
};

//  https://stackoverflow.com/questions/38633082/d3-getting-invert-value-of-band-scales
function scaleBandInvert(scale) {
  var domain = scale.domain();
  var paddingOuter = scale(domain[0]);
  var eachBand = scale.step();
  return function (value) {
    var index = Math.floor(((value - paddingOuter) / eachBand));
    return domain[Math.max(0,Math.min(index, domain.length-1))];
  }
};
