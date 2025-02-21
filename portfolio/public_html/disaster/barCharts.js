
function makeDisasterType() {
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
        .attr("width", g_width + margin.left + margin.right)
        .attr("height", g_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the scales
    const x = d3
        .scaleBand()
        .domain(data.map((d) => d.type))
        .range([0, g_width])
        .padding(0.1);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.count)])
        .nice()
        .range([g_height, 0]);

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
        .attr("y", g_height)
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
        .attr("height", (d) => g_height - y(d.count)); // Transition to the final height

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${g_height})`)
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


function makeDisasterSubgroup() {
    const disasterCounts = d3.rollup(
        g_countryData,
        (v) => v.length,
        (d) => d.Disaster_Subgroup
    );
    const data = Array.from(disasterCounts, ([type, count]) => ({
        type,
        count,
    }));
    //console.log(data);

    // Define dimensions

    //Destory previous
    d3.select("#subgroup").select("svg").remove();
    // Create the SVG container
    const svg = d3
        .select("#subgroup")
        .append("svg")
        .attr("width", g_width + margin.left + margin.right)
        .attr("height", g_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the scales
    const x = d3
        .scaleBand()
        .domain(data.map((d) => d.type))
        .range([0, g_width])
        .padding(0.1);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.count)])
        .nice()
        .range([g_height, 0]);

    // Create the tooltip element
    const tooltip = d3
        .select("#subgroup")
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
        .attr("y", g_height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "#ff5522")
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
        .attr("height", (d) => g_height - y(d.count)); // Transition to the final height

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${g_height})`)
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