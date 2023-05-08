function init(){

    var w = 800;
    var h = 600;
    var inputYear = 2015
    //var padding = 5;
    //set color scale
    var color = d3.scaleQuantize()
            .range(["#e5e267","#e2bd55","#df8246","#cc5d3c", "#ae3630", "#761d15"]);
    //load in CSV and return unemployed and LGA 
    d3.csv("merged.csv", function(d){
        return {
            ISO3: d.ISO3,
            Value: +d.Value,
            Temp: +d.Temp,
            Year: +d.Year,
            Disaster: +d.Disaster_Count
        };
    }).then(function(data){ 
        // Set the color domain based on the data range in the CSV
        color.domain([
            d3.min(data, function (d) { return d.Value; }),
            d3.max(data, function (d) { return d.Value; })
        ]);
        var filteredData = data.filter(function(d) {
            return d.Year === inputYear;
          });
        console.log(filteredData)

        console.log(filteredData.length);
        //load in the json file and add the CSV data to the jason properties.value through loops
        d3.json("countries.geojson").then(function(json){
            for (var i = 0;i< filteredData.length; i++){
                var dataISO3 = filteredData[i].ISO3;
                //parsee the unemployed data as a float variable to then be used
                var dataValue = parseFloat(filteredData[i].Value);
                //iterate through records to length of array
                for (var j = 0; j<json.features.length; j++){
                    var jsonISO3 = json.features[j].properties.ISO_A3;
                    if (dataISO3 == jsonISO3){
                        json.features[j].properties.outMigration = dataValue;
                        break;
                    }
                }
            }
        
            //the center is offset as it defaults toa  globe wide view
            var projection = d3.geoMercator()
                .center([700, -70.5])
                .translate([w, h])
                .scale(100);
            //set path as projection useing geopath
            var path = d3.geoPath()
                .projection(projection);

            var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("fill", "grey");
        
            //select all but add the color based on the color value that is a global variable of color sets
            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)

                .style("fill", function(d) {
                    var value = d.properties.outMigration;
                    // some do not have unemployment values so we need to decide what to dummy value to use for coloring
                    if (value == null)
                    {return "black"}
                    console.log(value);
                    return color(value);
                });
                //load in city CSV and select lat lon place cols
                d3.csv("VIC_city.csv", function(d){
                    return {
                        place: d.place,
                        lat: +d.lat,
                        lon: +d.lon
                    };
                    // use this data to create circles based on the d.lon d.lat
                }).then(function(data){
                    svg.selectAll("circle")
                });
            
        });

    });
}

window.onload = init;
