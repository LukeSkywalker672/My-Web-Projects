/** @format */

let g_data = [];
let g_countryData = [];
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

document.addEventListener("DOMContentLoaded", init);

function init() {
    console.log("----------  INIT()  ----------");
    d3.csv("1900_2021_DISASTERS_ascii_cleaned.csv").then((parsed) => {
        g_data = parsed.map((row) => {
            row.Year = parseInt(row.Year); //Could also use date
            row.Seq = parseInt(row.Seq);
            row.Total_Affected =
                row.Total_Affected === "" ? 0 : parseInt(row.Total_Affected);
            return row;
        });
        //console.log(g_data);
        generateCountryList();
        makeDiagramms();
    });
    console.log("----------  END INIT()  ----------");
}

function generateCountryList() {
    let countries = {};
    g_data.forEach((entry) => (countries[entry.Country] = entry.ISO));
    let countryArray = Object.entries(countries);
    countryArray.sort((a, b) => a[0].localeCompare(b[0]));
    let str = "";
    countryArray.forEach(
        (c) => (str += `<option value="${c[1]}">${c[0]}</option>`)
    );
    document.getElementById("nation").innerHTML = str;
}

function makeDiagramms() {
    //console.log("makeDiagramms() called");
    g_countryData = filterByCountry(g_data);
    //console.log(g_countryData);
    makeBarChart();
    makeLineChart();
    drawStackedAreaChart();
}

function filterByCountry(input) {
    let ISO = document.getElementById("nation").value;
    return input.filter((row) => row.ISO === ISO);
}

function makeBarChart() {
    const leftHeight = height*2 + 120;
    const disasterCounts = d3.rollup(
        g_countryData,
        (v) => v.length,
        (d) => d.Disaster_Type
    );
    const data = Array.from(disasterCounts, ([type, count]) => ({
        type,
        count,
    }));
    //console.log(data);

    // Define dimensions

    //Destory previous
    d3.select("#barChart").select("svg").remove();
    // Create the SVG container
    const svg = d3
        .select("#barChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", leftHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the scales
    const x = d3
        .scaleBand()
        .domain(data.map((d) => d.type))
        .range([0, width])
        .padding(0.1);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.count)])
        .nice()
        .range([leftHeight, 0]);

    // Create the tooltip element
    const tooltip = d3
        .select("#barChart")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #d3d3d3")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none");

    // Draw the bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.type))
        .attr("y", leftHeight)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip
                .style("visibility", "visible")
                .text(`Type: ${d.type}\nCount: ${d.count}`);
        })
        .on("mousemove", (event, d) => {
            tooltip
                .style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        })
        .transition() // Start the transition
        .duration(2000) // Duration of the animation in milliseconds
        .attr("y", (d) => y(d.count)) // Transition to the final y position
        .attr("height", (d) => leftHeight - y(d.count)); // Transition to the final height

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${leftHeight})`)
        .call(d3.axisBottom(x));

    // Add the y-axis with customized tick handling
    const maxCount = d3.max(data, (d) => d.count);

    // Define the y-axis
    const yAxis = svg.append("g");

    if (maxCount <= 10) {
        // For small ranges, ensure only integer ticks
        yAxis.call(
            d3
                .axisLeft(y)
                .ticks(maxCount) // Max number of ticks is equal to the max value
                .tickFormat(d3.format("d"))
        ); // Format ticks as integers
    } else {
        // For larger ranges, use automatic ticks but format as integers
        yAxis.call(d3.axisLeft(y).tickFormat(d3.format("~s"))); // Use SI-prefix formatting
    }
}

/*--------------------------- LINE CHART ---------------------------*/
function makeLineChart() {
    //console.log("makeLineChart() called");

    //Destroy previous Chart
    d3.select("#lineChart").select("svg").remove();

    //Step 1: Prepare the Data
    // Create a map to count occurrences per year
    let disasterCounts = d3.rollup(
        g_countryData,
        (v) => v.length,
        (d) => d.Year
    );

    // Convert the map to an array of objects with 'Year' and 'Count' properties
    let dataArray = Array.from(disasterCounts, ([Year, Count]) => ({
        Year,
        Count,
    }));

    // Ensure data is sorted by year
    dataArray.sort((a, b) => a.Year - b.Year);

    // Create an array of all years from 1900 to 2021 with 0 counts for missing years
    let allYears = d3.range(1900, 2022).map((year) => ({
        Year: year,
        Count: disasterCounts.get(year) || 0,
    }));

    //Step 2: Set Up the SVG Canvas
    const svg = d3
        .select("#lineChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale and axis
    const x = d3.scaleLinear().domain([1900, 2021]).range([0, width]);

    const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));

    //Step 3: Create Scales and Axes
    // Y scale and axis
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(allYears, (d) => d.Count)])
        .nice() // Extend the domain to the nearest integer
        .range([height, 0]);

    const yAxis = d3
        .axisLeft(y)
        .ticks(y.domain()[1]) //Set nuimber of ticks to max count
        .tickFormat(d3.format("d")); //Format ticks as integers

    //Step 4: Generate the Line Path
    const line = d3
        .line()
        .x((d) => x(d.Year))
        .y((d) => y(d.Count));

    // Draw the line
    const path = svg
        .append("path")
        .datum(allYears)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Animation for drawing the line
    const totalLength = path.node().getTotalLength();

    path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    //Step 5: Render the Chart
    // Add the X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .append("text")
        .attr("y", 40)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .attr("stroke", "black")
        .text("Year");

    // Add the Y Axis
    svg.append("g")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .attr("stroke", "black")
        .text("Number of Disasters");

    // Tooltip functionality

    // Select the tooltip element
    const tooltip = d3.select(".tooltip");

    // Append a transparent rect to capture mouse events
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => tooltip.style("visibility", "visible"))
        .on("mousemove", (event) => {
            // Get mouse position relative to the SVG
            const [mouseX, mouseY] = d3.pointer(event);

            // Use the x scale to find the closest year
            const year = Math.round(x.invert(mouseX));

            // Find the corresponding data point
            const dataPoint = allYears.find((d) => d.Year === year);

            // Update the tooltip content
            tooltip
                .html(
                    `Year: ${dataPoint.Year}<br>Disasters: ${dataPoint.Count}`
                )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
}

/*--------------------------- STACKED AREA CHART ---------------------------*/
function drawStackedAreaChart() {
    console.log("drawStackedAreaChart() called");

    // Destroy previous Chart
    d3.select("#areaChart").select("svg").remove();

    // Set up dimensions and margins
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    //const width = 960 - margin.left - margin.right,
    //const height = 500 - margin.top - margin.bottom;

    // Select the div and append an SVG element to it
    const svg = d3.select("#areaChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare the data
    const years = d3.range(1900, 2022);
    const types = [...new Set(g_countryData.map(d => d.Disaster_Type))];

    // Transform the data into the required format
    const dataByYear = d3.rollup(
        g_countryData,
        v => types.map(type => ({
            type,
            total: v.filter(d => d.Disaster_Type === type)
                    .reduce((sum, d) => sum + d.Total_Affected, 0)
        })),
        d => d.Year
    );

    const data = Array.from(dataByYear, ([year, values]) => {
        const result = { Year: year };
        values.forEach(v => result[v.type] = v.total);
        return result;
    });

    console.log("Processed Data:", data);

    // Stack the data
    const stack = d3.stack()
        .keys(types)
        .value((d, key) => d[key] || 0);

    const series = stack(data);

    console.log("Stacked Series:", series);

    // Define scales
    const x = d3.scaleLinear()
        .domain([1900, 2021])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Define the area generator
    const area = d3.area()
        .x(d => x(d.data.Year))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    // Create a tooltip div (hidden by default)
    const tooltip = d3.select("#tooltip")
        .style("visibility", "hidden");

    // Draw the areas with tooltip functionality
    svg.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("fill", d => color(d.key))
        .attr("d", area)
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                //.text(`${d.key}: ${d3.sum(d, d => d.data[d.key])} affected`) //This has a bug, always showing 0 TODO: Fix it
                .text(`${d.key}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", `${event.pageY - 10}px`)
                   .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        })
        .append("title")
        .text(d => d.key);

    // Animation
    svg.selectAll("path")
        .attr("opacity", 0)
        .transition()
        .duration(2000)
        .attr("opacity", 1);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));
}
