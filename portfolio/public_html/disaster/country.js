/** @format */

let g_data = [];
let g_countryData = [];
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const g_width = 800 - margin.left - margin.right;
const g_height = 400 - margin.top - margin.bottom;
const g_urlParams = new URLSearchParams(window.location.search);
const g_country = g_urlParams.get("country");

document.addEventListener("DOMContentLoaded", init);

function init() {
    console.log("----------  INIT()  ----------");
    d3.csv("1900_2021_DISASTERS_ascii_cleaned.csv").then((parsed) => {
        g_data = parsed.map((row) => {
            row.Year = parseInt(row.Year); //Could also use date
            row.Seq = parseInt(row.Seq);
            row.Total_Affected =
                row.Total_Affected === "" ? 0 : parseInt(row.Total_Affected);
            row.Dis_Mag_Value = row.Dis_Mag_Value === "" ? 0 : parseInt(row.Dis_Mag_Value);
            row.Total_Deaths = row.Total_Deaths === "" ? 0 : parseInt(row.Total_Deaths);
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
    countryArray.forEach(c => {
        str += `<option value="${c[1]}" ${select()}>${c[0]}</option>`;
        function select() {return c[0] === g_country || c[1] === g_country ? "selected":"";}
    });
    document.getElementById("nation").innerHTML = str;
}

function makeDiagramms() {
    //console.log("makeDiagramms() called");
    g_countryData = filterByCountry(g_data);
    //console.log(g_countryData);
    makeDisasterType();
    makeDisasterSubgroup();
    makeLineChart();
    drawStackedAreaChart();

    makeHeatmap();
    makeScatterplot();
}

function filterByCountry(input) {
    let ISO = document.getElementById("nation").value;
    return input.filter((row) => row.ISO === ISO);
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
    const width = 2 * g_width + 80; // Double the original width
    const svg = d3
        .select("#lineChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", g_height + margin.top + margin.bottom)
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
        .range([g_height, 0]);

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
        .attr("transform", `translate(0,${g_height})`)
        .call(xAxis)
        .append("text")
        .attr("y", 40)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .attr("stroke", "black");
        //.text("Year");

    // Add the Y Axis
    svg.append("g")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -g_height / 2)
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
        .attr("height", g_height)
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
        .attr("width", g_width + margin.left + margin.right)
        .attr("height", g_height + margin.top + margin.bottom)
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
        .range([0, g_width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .range([g_height, 0]);

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
        .attr("transform", `translate(0,${g_height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));
}


/*------- Heatmap --------*/
function makeHeatmap() {
    d3.select("#Heatmap").select("svg").remove(); // Clear previous heatmap

    // Double the width
    const doubledWidth = g_width * 2 + 80;

    const svg = d3.select("#Heatmap")
        .append("svg")
        .attr("width", doubledWidth + margin.left + margin.right)
        .attr("height", g_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const years = Array.from(new Set(g_countryData.map(d => d.Year))).sort((a, b) => a - b);
    const disasterTypes = Array.from(new Set(g_countryData.map(d => d.Disaster_Type)));

    const xScale = d3.scaleBand()
        .domain(d3.range(1900, 2022)) // Ensure the domain is from 1900 to 2021
        .range([0, doubledWidth])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain(disasterTypes)
        .range([0, g_height])
        .padding(0.05);

    // Calculate the frequency of each disaster type per year
    let frequencyData = {};
    disasterTypes.forEach(disasterType => {
        d3.range(1900, 2022).forEach(year => {
            const key = `${disasterType}-${year}`;
            const count = g_countryData.filter(d => d.Year === year && d.Disaster_Type === disasterType).length;
            frequencyData[key] = count;
        });
    });

    const maxFrequency = d3.max(Object.values(frequencyData));
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxFrequency]);

    // Adjusting x-axis ticks to show fewer years for readability
    const tickValues = d3.range(1900, 2022).filter(year => year % 10 === 0); // Display every 10th year

    svg.append("g")
        .call(d3.axisTop(xScale)
            .tickValues(tickValues)
            .tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    disasterTypes.forEach(disasterType => {
        d3.range(1900, 2022).forEach(year => {
            const key = `${disasterType}-${year}`;
            const frequency = frequencyData[key] || 0;

            svg.append("rect")
                .attr("x", xScale(year))
                .attr("y", yScale(disasterType))
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                .attr("fill", colorScale(frequency))
                .append("title")
                .text(`${disasterType}: ${frequency}`);
        });
    });

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${doubledWidth + 30}, 20)`);

    const legendScale = d3.scaleLinear()
        .domain([0, maxFrequency])
        .range([200, 0]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(6)
        .tickFormat(d3.format(".0f"));

    legend.append("g")
        .call(legendAxis);

    const legendGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    legendGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.interpolateYlOrRd(0));

    legendGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.interpolateYlOrRd(1));

    legend.append("rect")
        .attr("x", -20)
        .attr("width", 20)
        .attr("height", 200)
        .style("fill", "url(#legendGradient)");
}





/*----------- SCATTERPLOT -----------*/

function makeScatterplot() {
    d3.select("#Scatterplot").select("svg").remove(); // Clear previous scatterplot
    const svg = d3.select("#Scatterplot")
        .append("svg")
        .attr("width", g_width + margin.left + margin.right)
        .attr("height", g_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Filter data for earthquakes only
    const earthquakeData = g_countryData.filter(d => d.Disaster_Type === "Earthquake");

    // Define the scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(earthquakeData, d => d.Dis_Mag_Value)])
        .range([0, g_width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(earthquakeData, d => d.Total_Deaths)])
        .range([g_height, 0]);

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + g_height + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", g_width / 2)
        .attr("y", margin.bottom -10)
        .style("text-anchor", "middle") // Center the text
        .style("fill", "white") // Ensure text color is visible
        .text("Magnitude (Richter Scale)");

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -g_height / 2) // Center the label
        .attr("y", -margin.left + 20) // Position to the left of the axis
        .style("text-anchor", "middle") // Center the text
        .style("fill", "white"); // Ensure text color is visible
        //.text("Total Deaths");

    // Add the points
    svg.selectAll("circle")
        .data(earthquakeData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.Dis_Mag_Value))
        .attr("cy", d => yScale(d.Total_Deaths))
        .attr("r", 5)
        .style("fill", "steelblue")
        .style("opacity", 0.7);

    // Tooltip
    const tooltip = d3.select("#tooltip");

    svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(`Magnitude: ${d.Dis_Mag_Value}<br>Total Deaths: ${d.Total_Deaths}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
}