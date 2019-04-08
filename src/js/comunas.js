var width = 400,
    height = 500;

function titleCase(str) {
    words = str.toLowerCase().split(' ');

    for(var i = 0; i < words.length; i++) {
            var letters = words[i].split('');
            letters[0] = letters[0].toUpperCase();
            words[i] = letters.join('');
    }
    return words.join(' ');
}

var svg = d3.select("#MyMap")
    .append("svg")
    .style("cursor", "move")
    .attr("viewBox", "50 10 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin");

var zoom = d3.zoom()
  	.scaleExtent([0.005, 8])
    .on("zoom", function () {
        var transform = d3.zoomTransform(this);
        map.attr("transform", transform);
    });

svg.call(zoom);

var strip_special = (function() {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç-", 
        to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc ",
        mapping = {};
   
    for(var i = 0, j = from.length; i < j; i++ )
        mapping[ from.charAt( i ) ] = to.charAt( i );
   
    return function( str ) {
        var ret = [];
        for( var i = 0, j = str.length; i < j; i++ ) {
            var c = str.charAt( i );
            if( mapping.hasOwnProperty( str.charAt( i ) ) )
                ret.push( mapping[ c ] );
            else
                ret.push( c );
        }      
        return ret.join( '' );
    }
   
  })();

var map = svg.append("g");

var projection = d3.geoMercator()
  .translate([width/2, height/2])
  .scale(80000)
  .center([-70.7,-33.4685])

var path = d3.geoPath()
  .projection(projection)

this.mapbuild = (i) => {
map.selectAll("path").remove()
map.selectAll(".city-label").remove()
d3.json("src/data/comunas.json").then(data => {
    d3.csv("src/data/comunas_santiago.csv").then(ubicaciones => {
        d3.json("src/data/ratings.json").then(ratings => { 
            d3.csv("src/data/elecciones.csv").then(r_elecciones => {
            d3.csv("src/data/datapartidos.csv").then(elecciones92_16 => {
                var nested_data = d3.nest()
                                .key(function(d) {
                                  return d.ano;
                                })
                                .entries(elecciones92_16)
                var elecciones = nested_data[i].values
                var party_ratings = {}

                ratings.forEach(function (r) {
                    party_ratings[r.sigla] = r.rating
                })

                var comunas = topojson.feature(data, data.objects.comunas_datachile_final).features;
                // var color = d3.scaleThreshold()
                //     .domain([100, 1000, 5000, 10000, 50000, 100000])
                //     .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

                var color = d3.scaleLinear()
                        .domain([0, 50, 100])
                        .range(["#cc0000", "white", "#0000ff"]);

                var populationById = {};

                elecciones.forEach(function (d) {
                    populationById[strip_special(d.comuna.toLowerCase())] = {
                    nombre_tildes: d.comuna.toLowerCase(),
                    nombre: d.nombre_electo.toUpperCase(),
                    total: +d.total,
                    partido: d.partido,
                    porcentaje: +d.porcentaje
                    } 
                });
                comunas.forEach(function (d) {
                    var nombre_comuna = strip_special(d.properties.comuna)
                    var mayus = nombre_comuna.toLowerCase()
                    d.details = populationById[mayus] ? populationById[mayus] : {};;
                });

                map.append("g").selectAll("path")
                .data(comunas)
                .enter().append("path")
                .attr("class", "comuna")
                .attr("d", path)
                .style("fill", function (d) {
                    if (d.details && d.details.total) {
                        var score = party_ratings[d.details.partido];
                        if (score == 101) {
                            return "#ffffb3";
                        }
                        else {
                            return color(score);
                        }
                    }
                    else {
                        return undefined;
                    }
                })
                .on('click', function(d){
                    actualizarHeatMap(d.properties.comuna);
                    d3.select(this).classed("selected", true);

                    var nombre_comuna = strip_special(d.properties.comuna).toLowerCase();

                    d3.selectAll('circle').style("opacity", 1);
                    d3.selectAll('circle').attr("r", 5);
                    d3.selectAll('circle').filter(circle => nombre_comuna != circle.comuna).style("opacity", 0.1);
                    d3.selectAll('circle').filter(circle => nombre_comuna == circle.comuna).attr("r", 15);
                })
                .on('mouseover', function(d) {
                        d3.selectAll(".comuna").filter(c => c!=d).style('opacity', 0.1)

                        d3.select(this)
                            .style("stroke", function (d) {
                                if (d.details && d.details.total) {
                                    var score = party_ratings[d.details.partido];
                                    if (score == 101) {
                                        return "#ffffb3";
                                    }
                                    else if (score == 102) {
                                        return "black";
                                    }
                                    else if (score >= 50){
                                        return '#0000ff';
                                    }
                                    else {
                                        return 'red'
                                    }
                                }
                                else {
                                    return undefined;
                                }
                            })
                            .style("stroke-width", 2)
                            .style("opacity", 1)
                            .style("cursor", "pointer")


                        var nombre_comuna = strip_special(d.properties.comuna).toLowerCase();
                    
                        d3.selectAll('circle').style("opacity", 1);
                        d3.selectAll('circle').attr("r", 3);
                        d3.selectAll('circle').filter(circle => nombre_comuna != strip_special(circle.comuna).toLowerCase()).style("opacity", 0.1);
                        d3.selectAll('circle').filter(circle => nombre_comuna == strip_special(circle.comuna).toLowerCase()).attr("r", 15);

                        d3.select(".country")
                            .text(d.properties.comuna);
//
                        d3.select(".total")
                            .text(d.details && d.details.total && d.details.total || "¯\\_(ツ)_/¯");
//          
                        d3.select(".porcentaje")
                            .text(d.details && d.details.porcentaje && d.details.porcentaje || "¯\\_(ツ)_/¯");
            
                        d3.select(".electo")
                            .text(d.details && d.details.nombre && d.details.nombre || "¯\\_(ツ)_/¯");
            
                        d3.select(".partido")
                            .text(d.details && d.details.partido && d.details.partido || "¯\\_(ツ)_/¯");

                        d3.selectAll('circle').filter(circle => nombre_comuna == strip_special(circle.comuna).toLowerCase()).each( function (c) {

                            d3.select(".stat1-name")
                                .text(titleCase(c.xlabel) || "¯\\_(ツ)_/¯");

                            d3.select(".stat2-name")
                                .text(titleCase(c.ylabel) || "¯\\_(ツ)_/¯");

                            d3.select(".stat1-value")
                              .text(c.xvalue || "¯\\_(ツ)_/¯");

                            d3.select(".stat2-value")
                              .text(c.yvalue || "¯\\_(ツ)_/¯");
                        });
                        d3.select(".mapdetails")
                                .style('visibility', "visible")
                        })


                .on('mouseout', function (d) {
                        d3.selectAll(".comuna").style('opacity', 1);
                        
                        d3.selectAll('circle').style("opacity", 1);
                        d3.selectAll('circle').attr("r", 3);

                        d3.select(this)
                            .style("stroke", 'black')
                            .style("stroke-width", 3);

                        d3.select('.mapdetails')
                           .style('visibility', "hidden");
                });

                // geoMercator projection
                //var projection = d3.geoMercator() //d3.geoOrthographic()
                //  .scale(130)
            //        .translate([width / 2, height / 1.5]);

            //    // geoPath projection
            //    var path = d3.geoPath().projection(projection);



            //    var features = topojson.feature(world, world.objects.countries).features;

                //map.selectAll(".city-circle")
                //  .data(ubicaciones)
                //  .enter().append("circle")
                //  .attr("r", 1)
                //  .attr("cx", function(d){
                //    var coords = projection([d.longitud, d.latitud])
                //    return coords[0];
                //  })
                //  .attr("cy", function(d){
                //    var coords = projection([d.longitud, d.latitud])
                //    return coords[1]
                //  })

                map.selectAll(".city-label")
                .data(ubicaciones)
                .enter().append("text")
                .attr("class", "city-label")
                .attr("x", function(d){
                    var coords = projection([d.longitud, d.latitud])
                    //console.log(coords)
                    return coords[0];
                })
                .attr("y", function(d){
                    var coords = projection([d.longitud, d.latitud])
                    return coords[1]
                })
                .text(function(d){
                    //console.log(d.name)
                    return d.name
                })
                .attr("dx", -16)
                .attr("dy", 0)
});
});
});
});
});
};
mapbuild(1)

//    map.append("g")
//        .selectAll("path")
//        .data(features)
//        .enter().append("path")
//        .attr("name", function (d) {
//            return d.properties.name;
//        })
//        .attr("id", function (d) {
//            return d.id;
//        })
//        .attr("d", path)
//        .style("fill", function (d) {
//            return d.details && d.details.total ? color(d.details.total) : undefined;
//        })
//        .on('mouseover', function (d) {
//            d3.select(this)
//                .style("stroke", "white")
//                .style("stroke-width", 1)
//                .style("cursor", "pointer");
//
//            d3.select(".country")
//                .text(d.properties.name);
//
//            d3.select(".females")
//                .text(d.details && d.details.females && "Female " + d.details.females || "¯\\_(ツ)_/¯");
//
//            d3.select(".males")
//                .text(d.details && d.details.males && "Male " + d.details.males || "¯\\_(ツ)_/¯");
//
//            d3.select('.details')
//                .style('visibility', "visible")
//        })
//        .on('mouseout', function (d) {
//            d3.select(this)
//                .style("stroke", null)
//                .style("stroke-width", 0.25);
//
//            d3.select('.details')
//                .style('visibility', "hidden");
//        });
//}
