function init(){

    
    var w = 800;
    var h = 600;

    var colorScale = d3.scaleQuantize()
            .range(["#f9d5c8","#f7c3b1","#f5b19a","#f29f83", "#f08e6c"]);

    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("fill", "grey")
                .style("stroke", "black")
                .style("stroke-width", "0.2px");

    var projection = d3.geoMercator()
                .center([0, 40])
                .translate([w/2, h/2])
                .scale(110);

    var path = d3.geoPath()
                .projection(projection);

    var div = d3.select("body").append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 0);
        

    d3.csv("merged.csv", function(d){
        return {
            ISO3: d.ISO3,
            Value: +d.outflow_migration,
            Temp: +d.Temp,
            Year: +d.Year,
            Mig: +d.mig_pop,
            Disaster: +d.Disaster_Count,
            ADMIN: d.ADMIN
        };
    }).then(function(data){ 

        var yearSelector = document.getElementById("year_range");
        var variableSelector = d3.select('#variable');

        function drawMap(variable, inputYear) {
            svg.selectAll("*").remove();

            var filteredData = data.filter(function(d) {
                return String(d.Year) === yearSelector.value;
                        });
                        console.log(yearSelector.value);

            d3.json("countries.geojson").then(function(json){
               for (var i = 0;i< filteredData.length; i++){
                var dataISO3 = filteredData[i].ISO3;
                var dataValue = parseFloat(filteredData[i].Value);
                var dataMig = parseFloat(filteredData[i].Mig*100);
                var dataTemp = parseFloat(filteredData[i].Temp);
                var dataDisaster = parseFloat(filteredData[i].Disaster);

                for (var j = 0; j<json.features.length; j++){
                    var jsonISO3 = json.features[j].properties.ISO_A3;
                    if (dataISO3 == jsonISO3){
                        json.features[j].properties.Value = dataValue;
                        json.features[j].properties.Temp = dataTemp;
                        json.features[j].properties.Mig = dataMig;
                        json.features[j].properties.Disaster = dataDisaster;
                        break;
                    }
                }
            }

                
                colorScale.domain([
                    d3.min(filteredData, function (d) { return d[variable]; }),
                    d3.max(filteredData, function (d) { return d[variable]; })
                ]);

                svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function(d) {
                    var value = d.properties[variable];
                    if (value == null)
                        {return "#d9d9d9"}
                    return colorScale(value);
                })  
                .on("mouseover", function(d) {  
                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                    div.html(d.properties.ADMIN + ": " + d.properties[variable])	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                })					
                .on("mouseout", function(d) {		
                    div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                });
            });
        }
        drawMap(variableSelector.property("value"), +yearSelector.value);

        yearSelector.oninput = function() {
            drawMap(variableSelector.property("value"), +this.value);
        };

        variableSelector.on("change", function() {
            drawMap(this.value, +yearSelector.value);
        });
    });
}

window.onload = init;