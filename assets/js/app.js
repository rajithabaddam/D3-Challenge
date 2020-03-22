var svgWidth = 960;
var svgHeight = 500;
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Import Data
d3.csv("assets/data/data.csv").then(function(HealthData) {
  console.log(HealthData)
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    HealthData.forEach(function (data){
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.abbr= data.abbr;

    })
    //console.log(HealthData)
   
   
    // Step 2: Create scale functions
    // ==============================
  var xLinearScale = d3.scaleLinear()
   .domain([d3.min(HealthData,  d => d.poverty), d3.max(HealthData,  d => d.poverty)])
  // .domain(d3.extent(HealthData, d => d.poverty))
   .range([0, width]);
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(HealthData,  d => d.healthcare), d3.max(HealthData,  d => d.healthcare)])
    //.domain(d3.extent(HealthData, d => d.healthcare))
    .range([height, 0]); 
    
    
// Step 3: Create axis functions
    // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis.ticks(8));
  chartGroup.append("g")
    .call(leftAxis)


// Step 5: Create tooltip in the chart
    // ==============================
  
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br> Health care: ${d.healthcare}%<br>poverty: ${d.poverty}%`);
    });
    
      chartGroup.call(toolTip);


// Step 6: Create Circles
    // ==============================
var circlesGroup = chartGroup.selectAll("circle").data(HealthData).enter();

circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d.poverty) )
    .attr("cy", d => yLinearScale(d.healthcare) )
    .attr("r", "10")
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    });
  

    circlesGroup
    .append("text")
    .text(function(d){
      console.log(d.abbr);
      return d.abbr; 
    })
  .attr("class", "stateText")
  .attr("font-size", "10")
  .attr("x",d => xLinearScale(d.poverty))
  .attr("y", d => yLinearScale(d.healthcare))
  .on("mouseover", function(data){
    toolTip.show(data, this);
    })
  .on("mouseout", function(data){
    toolTip.hide(data);
    })
  ; 

  // Step 7:  Create axes labels
    // ==============================
    

    circlesGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .classed("active", true)
      .text("Lacks Healthcare(%)");
      circlesGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .classed("active", true)
      .text("In Poverty(%)"); 
  }).catch(function(error) {
    console.log(error);
  });
