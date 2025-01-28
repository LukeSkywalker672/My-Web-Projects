const g_state = {
  data: [],
  passengerClass: "",
  selectedSex: null,
};

function createHistogram(svgSelector) {
  //console.log("createHistogram() called");
  const margin = {
    top: 40,
    bottom: 10,
    left: 120,
    right: 20,
  };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Creates sources <svg> element
  const svg = d3
    .select(svgSelector)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Group used to enforce margin
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales setup
  const xscale = d3.scaleLinear().range([0, width]);
  const yscale = d3.scaleLinear().range([0, height]);

  // Axis setup
  const xaxis = d3.axisTop().scale(xscale);
  const g_xaxis = g.append("g").attr("class", "x axis");
  const yaxis = d3.axisLeft().scale(yscale);
  const g_yaxis = g.append("g").attr("class", "y axis");

  function update_nested(new_data) {
    //console.log("update_nested() called");
    //: (IPerson[] & {x0: number, x1: number})[]
    //update the scales
    xscale.domain([0, d3.max(new_data, (d) => d.length)]);
    yscale.domain([new_data[0].x0, new_data[new_data.length - 1].x1]);
    //render the axis
    g_xaxis.transition().call(xaxis);
    g_yaxis.transition().call(yaxis);

    // Render the chart with new data

    // DATA JOIN
    const rect = g
      .selectAll("rect")
      .data(new_data)
      .join(
        (enter) => {
          // ENTER
          // new elements
          const rect_enter = enter
            .append("rect")
            .attr("x", 0) //set intelligent default values for animation
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", 0);
          rect_enter.append("title");
          return rect_enter;
        },
        // UPDATE
        // update existing elements
        (update) => update,
        // EXIT
        // elements that aren't associated with data
        (exit) => exit.remove()
      );

    // ENTER + UPDATE
    // both old and new elements
    rect
      .transition()
      .attr("height", (d) => yscale(d.x1) - yscale(d.x0) - 2)
      .attr("width", (d) => xscale(d.length))
      .attr("y", (d) => yscale(d.x0) + 1);

    rect.select("title").text((d) => `${d.x0}: ${d.length}`);
  }

  return update_nested;
}

/////////////////////////

const g_ageHistogram = createHistogram("#age"); //The update_nested() function is in the variable

function filterData() {
  console.log("filterData() called");
  return g_state.data.filter((d) => {
    if (g_state.passengerClass && d.pclass !== g_state.passengerClass) return false;
    if (g_state.selectedSex && d.sex !== g_state.selectedSex) return false;
    return true;
  });
}

function wrangleData(filtered) {
  console.log("wrangleData() called");
  const ageHistogram = d3
    .bin()
    .domain([0, 100])
    .thresholds(10)
    .value((d) => d.age);

  const ageHistogramData = ageHistogram(filtered);
  const sexPieData = ["female", "male"].map((key) => ({
    key,
    values: filtered.filter((d) => d.sex === key),
   }));
   console.log("--->",sexPieData);
   g_sexPieChart(sexPieData);
  return { ageHistogramData, sexPieData };
}

function updateApp() {
  console.log("updateApp() called");
  const filtered = filterData();

  const { ageHistogramData } = wrangleData(filtered);
  //console.log(ageHistogramData);
  g_ageHistogram(ageHistogramData);
  //sexPieChart(sexPieData);
  d3.select("#selectedSex").text(g_state.selectedSex || "None");

  //This function is in other file, so I check if its there first.
  if(typeof processFareSurvivor === 'function') processFareSurvivor();
  else console.warn("processFareSurvivor() missing");
}

d3.csv("titanic3.csv").then((parsed) => {
  console.log(parsed);
  g_state.data = parsed.map((row) => {
    row.age = parseInt(row.age, 10);
    row.fare = parseFloat(row.fare);
    row.survived = parseInt(row.survived);
    return row;
  });

  updateApp();

  //This function is in other file, so I check if its there first.
  if(typeof initFare === 'function') initFare(); //The function in the other file, for the lower diagrams
  else console.warn("initFare() missing");
});

//interactivity
d3.select("#passenger-class").on("change", function () {
  const selected = d3.select(this).property("value");
  g_state.passengerClass = selected;
  updateApp();
});

function createPieChart(svgSelector, redGreen = false) {
  console.log("createPieChart() called");
  const margin = 10;
  const radius = 100;
  // Creates sources <svg> element
  const svg = d3
    .select(svgSelector)
    .attr("width", radius * 2 + margin * 2)
    .attr("height", radius * 2 + margin * 2);

  // Group used to enforce margin
  const g = svg
    .append("g")
    .attr("transform", `translate(${radius + margin},${radius + margin})`);

  //pie is a function?!?!
  const pie = d3
    .pie()
    .value((d) => d.values.length)
    .sortValues(null)
    .sort(null);
  const arc = d3.arc().outerRadius(radius).innerRadius(0);
  const cscale = redGreen ? d3.scaleOrdinal().domain([0, 1]).range(["#F44336", "#4CAF50"]) : d3.scaleOrdinal(d3.schemeSet3);
  /*if(redGreen) cscale = d3.scaleOrdinal()
      .domain([0, 1]) // Survived and Did not survive
      .range(["#F44336", "#4CAF50"]); // Red and Green
  else cscale = d3.scaleOrdinal(d3.schemeSet3);*/

  // 1. TODO
  function updatePie_nest(new_data) {
    //console.log("updatePie_nest() called");
    const pied = pie(new_data);

    // Render the chart with new data
    cscale.domain(new_data.map((d) => d.key));

    // DATA JOIN
    const path = g
      .selectAll("path")
      .data(pied, (d) => d.data.key)
      .join((enter) => {
        const path_enter = enter.append("path");
        // TODO register click handler to change selected sex in
        // state and call updateApp()
        path_enter.append("title");

        path_enter.on("click", (e, d) => {
          if (g_state.selectedSex === d.data.key) {
            g_state.selectedSex = null;
          } else {
            g_state.selectedSex = d.data.key;
          }
          updateApp();
        });

        return path_enter;
      });
      path
        .classed("selected", (d) => d.data.key === g_state.selectedSex)
        .attr("d", arc) 
        .style("fill", (d) => cscale(d.data.key));
  }
  return updatePie_nest;
}

const g_sexPieChart = createPieChart("#sex");

/*------------------------------------------------------------------------------------*/

