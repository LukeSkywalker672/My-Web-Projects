const width = 600 * 1.5;
const height = 600 * 1.5;

const svg = d3.select("#globe-container").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoOrthographic()
    .scale(250 * 1.5)
    .translate([width / 2, height / 2])
    .clipAngle(90);

const path = d3.geoPath()
    .projection(projection);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("color", "#000")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .text("");

// Load CSV data
d3.csv("1900_2021_DISASTERS_ascii_cleaned.csv").then(data => {

    // Convert year to number for correct comparison
    data.forEach(d => {
        d.Year = +d.Year;
    });

    // Function to find most recent disaster for a country
    function findMostRecentDisaster(countryName) {
        let recentDisaster = "";
        let recentYear = 0;

        // Clean up country name for matching
        const cleanCountryName = countryName.replace(/\s*\(.*?\)\s*/g, "");

        // Search for matching country and find most recent disaster
        data.forEach(d => {
            // Clean up country name in CSV for matching
            const cleanCSVCountryName = d.Country.replace(/\s*\(.*?\)\s*/g, "");

            if (cleanCSVCountryName === cleanCountryName) {
                if (d.Year > recentYear) {
                    recentYear = d.Year;
                    recentDisaster = d.Disaster_Type;
                }
            }
        });

        return { disaster: recentDisaster, year: recentYear };
    }

    // Draw the globe paths
    d3.json("https://unpkg.com/world-atlas@2.0.2/countries-50m.json").then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;
        const interiors = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

        svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "sphere")
            .attr("d", path);

        svg.append("path")
            .datum(interiors)
            .attr("class", "boundary")
            .attr("d", path);

        svg.selectAll(".feature")
            .data(countries)
            .enter().append("path")
            .attr("class", "feature")
            .attr("d", path)
            .on("mouseover", function(event, d) {
                const countryName = d.properties.name;
                const { disaster, year } = findMostRecentDisaster(countryName);

                // Update tooltip content
                let tooltipContent = `<strong>${countryName}</strong>`;
                if (disaster && year) {
                    tooltipContent += `<br>Most Recent Natural Disaster:<br>${disaster} in ${year}`;
                }
                tooltip.html(tooltipContent)
                    .style("visibility", "visible");

                d3.select(this).attr("fill", "#f0a830");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
                d3.select(this).attr("fill", "#157b7f");
            })
            .on("click", function(event, d) {
                const countryName = d.properties.name;
                window.location.href = `country.html?country=${encodeURIComponent(countryName)}`;
            });

        let rotation = [0, 0];
        let mousePos = [0, 0];

        svg.call(d3.drag()
            .on("start", function(event) {
                mousePos = [event.x, event.y];
            })
            .on("drag", function(event) {
                const dx = event.x - mousePos[0];
                const dy = event.y - mousePos[1];
                rotation[0] += dx / 2;
                rotation[1] -= dy / 2;
                projection.rotate(rotation);
                svg.selectAll("path").attr("d", path);
                mousePos = [event.x, event.y];
            }));

        // Redirect buttons
        d3.select("#country-dashboard").on("click", function() {
            window.location.href = "country.html";
        });
/*
        d3.select("#disaster-dashboard").on("click", function() {
            window.location.href = "disaster.html";
        });
        */
    });
});
