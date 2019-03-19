const margin = {
  top: 20,
  bottom: 10,
  left: 70,
  right: 30
};

const svg = d3.select("svg");
const plot = svg.append("g").attr("id", "plot");
const bounds = svg.node().getBoundingClientRect();
plot.attr("transform", translate(margin.left, margin.top + 130));
const width = bounds.width - margin.left - margin.right;
const height = bounds.height - margin.top - margin.bottom;
let callTypes = ["Oil Spill", "Lightning Strike (Investigation)", "Marine Fire","Industrial Accidents" ,
                "Explosion", "HazMat" , "Fuel Spill", "Odor (Strange / Unknown)", "Smoke Investigation (Outside)",
                "Electrical Hazard", "Vehicle Fire", "Gas Leak (Natural and LP Gases)","Outside Fire",
                "Other", "Structure Fire"];
let originalData = {};
var dateParser = d3.timeParse("%m/%d/%Y");
var xScale = {},
    yScale = {};


var x0 = d3.scaleBand()
      .rangeRound([0, width - 200])
      .paddingInner(0.1);

var x1 = d3.scaleBand()
      .padding(0.05);

var y = d3.scaleLinear()
  .domain([0, 3996])
  .range([height - 300, 0])
  .nice();

var tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");

    tooltip.append("text")
      .attr("x", 15)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

var colorScale = d3.scaleOrdinal()
    .range(["#F9A197","#B7B4A9","#E95554","#79726E", "#4979AB", "#4C9B9A", "#E89121", "#D57598",
      "#FEBE70", "#59A04B", "#A1CCF1","#D2C240", "#636FF9",
      "#80BEB5", "#B69A2A"]);

var grayColorScale = d3.scaleOrdinal()
          .range(["#F0F0F0"]);

var stack = d3.stack()
    .order(d3.stackOrderDescending)
    .offset(d3.stackOffsetNone);

d3.csv("Fire_Department_Calls_for_Service.csv", convert).then(drawStackBar);

function drawStackBar(data) {
  originalData = data;
  var filterData = data.filter(function(value) {
    return callTypes.includes(value.callType);
  });
  buildScales(filterData);
  var keys = colorScale.domain();
  var groupData = d3.nest()
  .key(function(d) { return d.month + d.year; })
  .rollup(function(d, i) {
    var d2 = {month: d[0].month, year: d[0].year}
    var counterTypes = {};
    d.forEach(function(d){
      if (counterTypes[d.callType] == null) {
        counterTypes[d.callType] = 1;
      } else {
        counterTypes[d.callType]++;
      }
    })
    for (var i in callTypes) {
      if (counterTypes[callTypes[i]] == null) {
        d2[callTypes[i]] = 0;
      } else {
        d2[callTypes[i]] = counterTypes[callTypes[i]];
      }
    }
    return d2;
  })
  .entries(filterData)
  .map(function(d){ return d.value; });
  var stackData = stack.keys(keys)(groupData);

  var serie = plot.selectAll(".serie")
    .data(stackData)
    .enter().append("g")
      .attr("class", "serie")
      .attr("fill", function(d) { return colorScale(d.key); });

  serie.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      	.attr("class", "serie-rect")
      	.attr("transform", function(d) { return "translate(" + x0(d.data.year) + ",0)"; })
        .attr("x", function(d) { return x1(d.data.month); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x1.bandwidth())
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
          var value = d[1] - d[0];
          var callType = "";
          for (var i in d.data) {
          if (d.data[i] == value) {
              callType = i;
            }
          }
          var xPosition = event.clientX;
          var yPosition = event.clientY;
          tooltip.attr("transform", translate(xPosition , yPosition));
          tooltip.select("text")
                  .text("Call Type :" + callType + "\nCount: " + value);
        });

  drawAxis();
  drawColorScale();
}

function drawColorScale() {
  svg.append("text")
    .attr("x", 935)
    .attr("y", 65)
    .attr("text-anchor", "left")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Call Type");

  var y = 65;
  for (var i in callTypes) {
    svg.append("text")
        .attr("class", "legend-names")
        .attr("x", 960)
        .attr("y", y + 20)
        .attr("text-anchor", "right")
        .style("font-size", "12px")
        .text(callTypes[i])
        .on("mouseover", function() {})
        .on("mouseout", function() {
          plot.selectAll(".serie")
            .attr("fill", function(d) {
              return colorScale(d.key);
            });
          })
        .on("mousemove", function(d) {
              var me = d3.select(this);
              var filter = me.text();
              plot.selectAll(".serie")
                  .attr("fill", function(d) {
                    var selectedColor = colorScale(filter);
                    if (d.key == filter) {
                      return colorScale(d.key);
                    }
                    return grayColorScale(d.key);
                  });
        });
        y += 20;
  }
  y = 53;
  for (var i in callTypes) {
    svg.append("rect")
        .attr("class", "legend-colors")
        .attr("x", 940)
        .attr("y", y + 20)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", colorScale(callTypes[i]));
        y += 20;
      }

}

function buildScales(filterData) {
  x0.domain(filterData.map(function(d) { return d.year; }));
  x1.domain(filterData.map(function(d) { return d.month; }))
    .rangeRound([0, x0.bandwidth()])
    .padding(0.2);
  colorScale.domain(filterData.map(function(d) { return d.callType; }));
  grayColorScale.domain(filterData.map(function(d) { return d.callType; }));
}

function drawAxis() {
  svg.append("text")
        .attr("x", margin.left - 60)
        .attr("y", margin.top + 50)
        .attr("text-anchor", "left")
        .style("font-size", "23px")
        .text("Incidents over the past 5 years (2014 - 2018) by Call Type");

  plot.append("g")
      .attr("class", "axis")
      .attr("transform", translate(0, height - 780))
      .style("stroke-width", "0")
      .call(d3.axisTop(x0));

  plot.append("g")
      .attr("class", "axis")
      .attr("transform", translate(0, height - 300))
      .style("stroke-width", "0")
      .call(d3.axisBottom(x1))
      .selectAll("text")
      .attr("y", -5)
      .attr("x", -30)
      .attr("transform", "rotate(-90)");

  plot.append("g")
      .attr("class", "axis")
      .attr("transform", translate(178, height - 300))
      .style("stroke-width", "0")
      .call(d3.axisBottom(x1))
      .selectAll("text")
      .attr("y", -5)
      .attr("x", -30)
      .attr("transform", "rotate(-90)");;

  plot.append("g")
      .attr("class", "axis")
      .attr("transform", translate(350, height - 300))
      .style("stroke-width", "0")
      .call(d3.axisBottom(x1))
      .selectAll("text")
      .attr("y", -5)
      .attr("x", -30)
      .attr("transform", "rotate(-90)");

  plot.append("g")
      .attr("class", "axis")
      .attr("transform", translate(520, height - 300))
      .style("stroke-width", "0")
      .call(d3.axisBottom(x1))
      .selectAll("text")
      .attr("y", -5)
      .attr("x", -30)
      .attr("transform", "rotate(-90)");

  plot.append("g")
      .attr("class", "axis")
      .attr("transform", translate(700, height - 300))
      .style("stroke-width", "0")
      .call(d3.axisBottom(x1))
      .selectAll("text")
      .attr("y", -5)
      .attr("x", -30)
      .attr("transform", "rotate(-90)");

  var bottom = d3.axisBottom(x0)
          .tickFormat("")
          .tickSize(0);

  plot.append("g")
        .attr("class", "grid")
        .attr("transform", translate(0, height - 300))
        .call(bottom);

  var xPos = 170;
  for (var i = 0; i < 5; i++) {
    var separator = d3.axisLeft(y)
            .tickFormat("")
            .tickSize(0);

    plot.append("g")
          .attr("class", "grid")
          .attr("transform", translate(xPos, height - 772))
          .call(separator);
    xPos += 170;
  }

  plot.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y));
}


function convert(row) {
  let keep = {};
  var dateParsed = dateParser(row.Call_Date);
  var year = dateParsed.getUTCFullYear();
  var month = monthName(dateParsed.getMonth());
  keep.callType = row.Call_Type;
  keep.neighborhood = row.Neighborhooods;
  keep.year = year;
  keep.month = month;
  return keep;
}

function translate(x, y) {
  return "translate(" + String(x) + "," + String(y) + ")";
}

function monthName(month){
  monthNames = ["September", "October", "November"];
  return monthNames[month - 8];
};
