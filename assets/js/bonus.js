
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(HealthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
     .domain([d3.min(HealthData, d => d[chosenXAxis]) * 0.90,
      d3.max(HealthData, d => d[chosenXAxis]) * 1.10
    ]) 
  //  .domain(d3.extent(HealthData, d => d[chosenXAxis]))
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(HealthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
     .domain([d3.min(HealthData, d => d[chosenYAxis]) * 0.90 ,
      d3.max(HealthData, d => d[chosenYAxis]) * 1.10 
    ]) 
    //.domain(d3.extent(HealthData, d => d[chosenYAxis]))
    .range([height, 0]); 

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis.ticks(10));

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis.ticks(10));

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis,newYScale,chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))
    

  return circlesGroup;
}

//new function for printing state in circles

function renderStates(stateGroup, newXscale, newYscale, chosenXaxis, chosenYaxis) {
  stateGroup.transition()
      .duration(1000)
      .attr("x", d => newXscale(d[chosenXaxis]))
      .attr("y", d => newYscale(d[chosenYaxis]));
  return stateGroup;
};


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age:";
  }
  else {
    xlabel = "Income:";
  }

  // ylabel

  if (chosenYAxis === "healthcare") {
    ylabel = "Healthcare:";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "Smoke:";
  }
  else {
    ylabel = "Obesity:";
  }

   var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}% <br>${ylabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    }); 

  return circlesGroup;
}

// Defulat it will run first

// Retrieve data from the CSV file and execute everything below


d3.csv("assets/data/data.csv").then(function(HealthData, err) {
  if (err) throw err;

  // parse data
  HealthData.forEach(function(data) {
    data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = + data.obesity;
        
        data.abbr= data.abbr;
        console.log(data)
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(HealthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(HealthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

    // Create group for  3 x- axis labels
  var XlabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var PovertyLabel = XlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("In Poverty(%)");

var AgeLabel = XlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");
var HouseholdLabel = XlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household income (Median)");


// Y axis

// Create group for  3 y- axis labels
var YlabelsGroup = chartGroup.append("g")
.attr("transform", "rotate(-90)");

var HealthcareLabel = YlabelsGroup.append("text")
.attr("y", 50 - margin.left)
.attr("x",  0 - (height / 2))
.attr("value", "healthcare") // value to grab for event listener
.attr("dy", "1em")
// .classed("axistext", true)
.classed("active", true)
.text("Lacks healthcare(%)");

var SmokeLabel = YlabelsGroup.append("text")
  .attr("y", 30 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("value", "smokes") // value to grab for event listener
 // .classed("axistext", true)
  .classed("inactive", true)
  .text("Smoke (%)");

var ObeseLabel = YlabelsGroup.append("text")
  .attr("y", 10 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("value", "obesity") // value to grab for event listener
//  .classed("axistext", true)
  .classed("inactive", true)
  .text("Obese(%)");

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle").data(HealthData).enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    });

    // append state abbr inside the circle 

    var stateGroup = chartGroup.selectAll("null")
            .data(HealthData)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("class", "stateText")
            .attr("font-size", "10")
            .attr("x",d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]));
    
  

  // updateToolTip function above csv import
   var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

  // x axis labels event listener
  XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

         console.log(chosenXAxis,chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(HealthData, chosenXAxis);
        yLinearScale = yScale(HealthData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates circles with new state abbr values

        stateGroup =   renderStates (stateGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

        // changes  x classes to change bold text

        if (chosenXAxis === "poverty") {
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
            AgeLabel
            .classed("active", false)
            .classed("inactive", true);
            HouseholdLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          AgeLabel
            .classed("active", true)
            .classed("inactive", false);
            PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
            HouseholdLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          
            HouseholdLabel
            .classed("active", true)
            .classed("inactive", false);
            AgeLabel
            .classed("active", false)
            .classed("inactive", true);
            PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }

      }
    });
 
    // x axis labels event listener

    YlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");

      
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

         //console.log(chosenXAxis,chosenYAxis);

        // functions here found above csv import
        // updates x and y scales for new data
        xLinearScale = xScale(HealthData, chosenXAxis);
        yLinearScale = yScale(HealthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);;
        stateGroup =   renderStates (stateGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
        

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

      // changes Y classes to change bold text

      if (chosenYAxis === "healthcare") {
        HealthcareLabel
          .classed("active", true)
          .classed("inactive", false);
          SmokeLabel
          .classed("active", false)
          .classed("inactive", true);
          ObeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        SmokeLabel
          .classed("active", true)
          .classed("inactive", false);
          HealthcareLabel
          .classed("active", false)
          .classed("inactive", true);
          ObeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        
        ObeseLabel
          .classed("active", true)
          .classed("inactive", false);
          SmokeLabel
          .classed("active", false)
          .classed("inactive", true);
          HealthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }

      }
    });
 

}).catch(function(error) {
  console.log(error);
});
