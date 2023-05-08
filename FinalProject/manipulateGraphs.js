var defineFunctionsHandleDOM = async function () {
    // this will be defined after we setup the dropdown box
    var country;

    await importData();
    /* 
        generate the options for selecting a country
     */
    var countrySelect = document.getElementById('country-select');
    countries.forEach(country => {
        countrySelect.innerHTML += '<option>' + country + '</option>';
    });
    country = countrySelect.value;

    var handleCountrySelectChange = e => {
        country = e.target.value;
        updateChart();
    };
    countrySelect.onchange = handleCountrySelectChange;
    /* ******************************************* */

    var graph2 = 'temperature';
    var tempDisButton = document.getElementById('switch-temp-dis');
    var handleTempDisButtonClick = () => {
        switch (graph2) {
            case "temperature": {
                graph2 = 'disasters';
                tempDisButton.innerHTML = 'Show Temperature Chart';
                break;
            }
            case "disasters": {
                tempDisButton.innerHTML = 'Show Disaster Chart';
                graph2 = 'temperature';
                break;
            }
            default:
        }

        updateChart();
    };
    tempDisButton.onclick = handleTempDisButtonClick;

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 80, bottom: 70, left: 80 },
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    updateChart();

    function updateChart() {
        // remove the previous bars, axes and labels
        svg.selectAll(".bar").remove();
        svg.selectAll(".line").remove();
        svg.selectAll(".axis").remove();
        svg.selectAll(".dot").remove();
        svg.selectAll("g").remove();
        svg.selectAll("text").remove();

        // get the migration data that we need for a graph
        var migData = Object.assign({}, dataMassaged[country]);
        var otherData = Object.assign({}, dataMassaged[country]);

        // set the x and y scales
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1)
            .domain(Object.keys(migData).map(index => {
                return +index + 2000;
            }));

        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0,
                d3.max(Object.keys(migData),
                    function (d) { return migData[d].migrations; }
                )]);

        // append the x axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // append the y axis
        svg.append("g")
            .call(d3.axisLeft(y));
        // append the horizontal gridlines

        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat("")
            );

        // define the gradient
        var gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "orange")
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "red")
            .attr("stop-opacity", 1);

        // append the bars
        svg.selectAll(".bar")
            .data(Object.keys(migData))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(+d + 2000);
            })
            .attr("width", x.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .on("mouseover", function (e, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(migData[d].migrations)
                    .style("left", (e.pageX) + "px")
                    .style("top", (e.pageY - 28) + "px")
                    .style("border", "1px solid #90EE90");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("y", function (d) { return y(migData[d].migrations); })
            .attr("height",
                function (d) { return height - y(migData[d].migrations); })
            .attr("fill", "url(#gradient)")

        // add x-axis label
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
            .style("text-anchor", "middle")
            .text("Year");

        // add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Migration Outflows");

        var newLabelId, newLabelText, keyToAccess, y2;
        switch (graph2) {
            case "temperature": {
                d3.select("#dis-label").remove();
                keyToAccess = "temp_change";

                // create a second y scale for the temp_change line chart
                var y2 = d3.scaleLinear()
                    .range([height, 0])
                    .domain([d3.min(Object.keys(otherData), function (d) { return otherData[d]["temp_change"]; }) - 5,
                    d3.max(Object.keys(otherData), function (d) { return otherData[d].temp_change; }) + 5]);
                newLabelId = "temp-label";
                newLabelText = "Temperature change in (c)";
                break;
            }
            case "disasters": {
                d3.select("#temp-label").remove();
                keyToAccess = "disasters";

                // create a second y scale for the disaster line chart
                var y2 = d3.scaleLinear()
                    .range([height, 0])
                    .domain([0,
                        d3.max(Object.keys(otherData),
                            function (d) { return otherData[d].disasters; }
                        )]);
                newLabelId = "dis-label";
                newLabelText = "Disasters in Number";
                break;
            }
            default:
        }

        // append the y2 axis
        svg.append("g")
            .attr("transform", "translate(" + width + ", 0)")
            .call(d3.axisRight(y2));

        var line = d3.line()
            .x(function (d) {
                return x(+d + 2000);
            })
            .y(function (d) {
                return y2(otherData[d][keyToAccess]);
            });

        svg.append("path")
            .datum(Object.keys(otherData))
            .attr("class", "line")
            .attr("d", line)
            .attr("transform", "translate(17.91, 0)")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        svg.append("text")
            .attr("id", newLabelId) // add a unique id to this y-axis label
            .attr("transform", "rotate(-90)")
            .attr("y", width + margin.right - 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(newLabelText);

        svg.selectAll(".dot")
            .data(Object.keys(otherData))
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function (d) { return x(+d + 2000); })
            .attr("cy", function (d) { return y2(otherData[d][keyToAccess]); })
            .attr("r", 4)
            .attr("transform", "translate(17.91, 0)")
            .on("mouseover", function (e, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(otherData[d][keyToAccess])
                    .style("left", (e.pageX) + "px")
                    .style("top", (e.pageY) + "px")
                    .style("border", "1px solid red");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("y", function (d) { return y(otherData[d][keyToAccess]); })
            .attr("height",
                function (d) { return height - y(otherData[d][keyToAccess]); })
            .attr("fill", "black");
    }
}

defineFunctionsHandleDOM();
/*
REFERENCES :-
https://dev.to/chooblarin/d3js-chart-with-gradient-color-4j71
https://d3-graph-gallery.com/interactivity.html


*/