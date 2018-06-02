
// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
//and shift the latter by left and top margins.
var svg = d3
  .select(".iframeContainer")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object. (The SVG <g> element is used to group SVG shapes together. Once grouped you can transform the whole group of shapes as if it was a single shape).
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);;

// Initial Params
var chosenXAxis = "blw_poverty"

// function used for updating x-scale var upon click on axis label
function xScale(Data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]) * 0.8,
      d3.max(Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width])

  return xLinearScale

};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale)

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis)

  return xAxis
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))

  return circlesGroup
};

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis == "blw_poverty") {
    var label = "% Below Poverty:"
  } else {
    var label = "% Unemployment Rate:"
  }

  var toolTip = d3.tip()//this is all stored in a variable, called below; 
    .attr("class", "tooltip")
    .offset([10, -60])//where the tooltip comes in 
    .html(function (d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);//changes the tooltip based on these variables, state stays the same; label comes in from above; 
    });

  circlesGroup.call(toolTip);//var tooltip above; 

  circlesGroup.on("mouseover", function (data) {
      toolTip.show(data);//calling the tooltip data via fucntion with placholder 'data'
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup
}

// Retrieve data from the CSV file and execute everything below
d3.csv("Data/Data.csv", function (err, Data) {
  if (err) throw err;

  // parse data, read as numbers
  Data.forEach(function (data) {
    data.pct_alcohol = +data.pct_alcohol;
    data.pct_unemploy = +data.pct_unemploy;
    data.blw_poverty = +data.blw_poverty;
    data.pct_disability=+data.pct_disability;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(Data, chosenXAxis)

  // Create y scale function, y scale is constant in this example 
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(Data, d => d.pct_alcohol)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)//called from above var

  // append y axis
  chartGroup.append("g")
    .call(leftAxis)//called from above var

  // append initial circles to chartgroup, your initial 'g' group; 
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.pct_alcohol))
    .attr("r", 10)//radiuse of 10
    .attr("fill", "pink")
    .attr("opacity", ".5")

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`)

  var belowPovLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "blw_poverty") //value to grab for event listener
    .classed("active", true)
    .text("% below Poverty");

  var unemployLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "pct_unemploy") //value to grab for event listener
    .classed("inactive", true)
    .text("% Unemployement Rate");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("% Alcohol Beverage");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup)

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value")
      if (value != chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);//xAxis called from above var

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis == "blw_poverty") {
          belowPovLabel
            .classed("active", true)
            .classed("inactive", false)
          unemployLabel
            .classed("active", false)
            .classed("inactive", true)
        } else {
          belowPovLabel
            .classed("active", false)
            .classed("inactive", true)
          unemployLabel
            .classed("active", true)
            .classed("inactive", false)
        };
      };
    });
});