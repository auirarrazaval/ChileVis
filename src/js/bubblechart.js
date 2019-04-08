const marginBubble = {top: 40, right: 20, bottom: 100, left: 60};

const WIDTHBUBBLE = 600
const HEIGHTBUBBLE = 500

const widthBubble =  WIDTHBUBBLE - marginBubble.left - marginBubble.right;
const heightBubble = HEIGHTBUBBLE - marginBubble.top - marginBubble.bottom;

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

var yscale = d3.scaleLinear()
                .range([heightBubble, 0])
                .domain([0, 100])

var xscale = d3.scaleLinear()
                .range([0, widthBubble])
                .domain([0, 1])

var axisBottom = d3.axisBottom(xscale)
                    //.ticks(widthBubble / heightBubble * 10)
                    //.tickSize(heightBubble)
                    //.tickPadding(10);
var axisLeft = d3.axisLeft(yscale)
                    //.ticks(10)
                    //.tickSize(widthBubble)
                    //.tickPadding(8 - widthBubble);

const containerBubblechart = d3.select('#bubblechart')
    .append('svg')
        .attr('width', WIDTHBUBBLE)
        .attr('height', HEIGHTBUBBLE)
    .append('g')
        .attr('transform', `translate(${marginBubble.left},${marginBubble.top})`)
        .call(d3.zoom()
                //.xscale(xscale)
                //.yscale(yscale)
                .scaleExtent([1, 1])
                .translateExtent([[0,-5],
                  [widthBubble + 105, heightBubble + 140]
                ])
                //.center([widthBubble / 2, heightBubble / 2])
                //.size([widthBubble, heightBubble])
                .on("zoom", zoomed));

function zoomed() {
            var circles = containerBubblechart.selectAll('circle')
            circles.attr("transform", d3.event.transform);
            xAxisBubble.call(axisBottom.scale(d3.event.transform.rescaleX(xscale)));
            yAxisBubbles.call(axisLeft.scale(d3.event.transform.rescaleY(yscale)));
        }

const xAxisBubble = containerBubblechart
        .append('g')
        .attr("class", ".x axis")
        .attr('transform', `translate(0, ${heightBubble})`);
const yAxisBubbles = containerBubblechart.append('g')
    .attr("class", ".y axis");

// Utilizamos el método call para que se generen los ejes según la escala asociada en cada 'g'
xAxisBubble.call(axisBottom);
yAxisBubbles.call(axisLeft);


containerBubblechart.append("rect")
        .attr("width", "100%")
        .attr("height", "79%")
        .attr("fill", "silver");
        

var color = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(["#cc0000", "white", "#0000ff"]);

function titleCase(str) {
    words = str.toLowerCase().split(' ');

    for(var i = 0; i < words.length; i++) {
            var letters = words[i].split('');
            letters[0] = letters[0].toUpperCase();
            words[i] = letters.join('');
    }
    return words.join(' ');
}

// var casen_url = "src/data/datachile.csv"
var casen_url = "src/data/data_rep.csv"

d3.csv(casen_url).then(datacasen => {
    d3.csv("src/data/elecciones.csv").then(elecciones2 => {
        d3.json("src/data/ratings.json").then(ratings => {
            d3.csv("src/data/datapartidos.csv").then(elecciones92_16 => {

            var nested_elections = d3.nest()
                                .key(function(d) {
                                  return d.ano;
                                }).sortKeys(d3.ascending)
                                .entries(elecciones92_16);

            var nested_casen = d3.nest()
                                    .key(function(d) {
                                        return d.ano
                                    }).sortKeys(d3.ascending)
                                    .entries(datacasen)

            console.log(nested_elections);
            console.log(nested_casen);

            var data = nested_casen[0].values;
            
            var elecciones = nested_elections[0].values;

            var ejey = 'idse'
            var ejex = 'porcentaje'
            
            

            // parte por default en las elecciones de 1992

            const labelX = containerBubblechart.append("text")             
                                .attr("transform",
                                    "translate(" + (widthBubble/2) + " ," + 
                                                    (heightBubble + marginBubble.top + 20) + ")")
                                .style("text-anchor", "middle")
                                .attr("class", "axisname")

            const labelY = containerBubblechart.append("text")
                                .attr("transform", "rotate(-90)")
                                .attr("y", 0 - marginBubble.left)
                                .attr("x",0 - (heightBubble / 2))
                                .attr("dy", "1em")
                                .style("text-anchor", "middle")
                                .attr("class", "axisname")

            const Rlabel = containerBubblechart.append("text")
                            .attr("x", (WIDTHBUBBLE / 2))             
                            .attr("y", 0 - (marginBubble.top / 2))
                            .attr("text-anchor", "middle")  
                            .style("font-size", "16px") 
                            .style("text-decoration", "underline")

            this.bubblechartbuild = (eleccioness, data, ratings, ejex, ejey) => {
                var newArray = [];
                console.log(data[1]["ano"])
                for(var i = 0; i < data.length; i++) {
                    for(var j = 0; j < eleccioness.length; j++) {
                        if (strip_special(data[i].comuna).toLowerCase() == strip_special(eleccioness[j].comuna).toLowerCase()) {
                            newArray.push({comuna: strip_special(data[i].comuna).toLowerCase(),
                                           xlabel: ejex,
                                           ylabel: ejey,
                                           xvalue: data[i][ejex] ? data[i][ejex] : eleccioness[j][ejex],
                                           yvalue: data[i][ejey] ? data[i][ejey] : eleccioness[j][ejey],
                                           partido: eleccioness[j].partido});
                            break;
                        }
                    }
                }

                var maxx = Math.max.apply(Math, newArray.map(function(o) { return o.xvalue; }))
                //d3.max(newArray, function(d){ return d.xvalue; })
                var maxy = Math.max.apply(Math, newArray.map(function(o) { return o.yvalue; }))
                //d3.max(newArray, function(d){ return d.yvalue; })

                console.log(newArray)
                console.log(maxx);
                console.log(maxy);

                // maxx y maxy tienen los maximos del dominio de los ejes

                // Actualizo los dominios
                xscale.domain([0, maxx * 1.1])
                yscale.domain([0, maxy * 1.1])

                // Make the changes
                // containerBubblechart.select('#axb').transition()
                //                     .duration(5)
                //                     .call(xscale)
                
                // containerBubblechart.select('#axl').transition()
                //                     .duration(5)
                //                     .call(yscale)

                containerBubblechart.select('.x axis').transition() // change the x axis
                    .duration(500)
                    .call(axisBottom);

                containerBubblechart.select('.y axis').transition() // change the x axis
                    .duration(500)
                    .call(axisLeft);

                // Definimos ls circulos de la lista data
                const circle = containerBubblechart.selectAll('circle').data(newArray);
                
                // Creamos una escala lineal cuyo dominio será de 0 y max*0.1. Donde máx es el máximo de los datos
                // y devolverá un número entre 0 y widthBubble
        
                // Creamos una escala lineal cuyo dominio será de 0 y 70 y devolverá un número entre heightBubble y 0.
                // Notar que está inverso porque el 0 está arriba y nosotros queremos que mientras más bajo sea el valor
                // más abajo esté.
                var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
                
        
                var party_ratings = {}
                var party_name = {}
                ratings.forEach(rt => {
                    party_ratings[rt.sigla] = rt.rating
                    party_name[rt.sigla] = rt.nombre
                })
        
                // Agregamos cada circulo
        
                var enterCircle = circle.enter().append('circle')
                        .attr('cx', d => xscale(+d.xvalue))
                        .attr('cy', d => yscale(+d.yvalue))
                        .attr('r', 3)
                        .attr('class', 'inactive ball')
                        .attr('fill', function(d) {
                            var score = party_ratings[d.partido];
                            var colorr = ''
                            if (score == 101) {
                                colorr = "#ffffb3";
                            }
                            else if (score == 102) {
                                colorr = "black";
                            }
                            else {
                                colorr = color(score);
                            }
                            // console.log(colorr)
                            return colorr
                            });
        
                //Definimos una interacción con el 'click' para que hacer click en la burbuja, esta se agregue al barchart.    
                enterCircle.on('click', (d) =>{
                    actualizarHeatMap(d.comuna);
                });
        
                labelX.text(ejex);
        
                // Agregamos nombre al eje y para determinar que estamos considerando la cantidad de hombres
                
                labelY.text(ejey);
        
                // Finalmente agregamos un titulo al gráfico. ¿Por qué a quien no le gustan los titulos?
                  
                Rlabel.text("Relación " + ejey + " vs " + ejex);
        
                //d3.select('#clear').on('click', (_) =>{
                //    clear();
                //    d3.selectAll('circle').attr('class', 'inactive ball');
                //});
        
                // Bonus: Interactuar con el Hover y seleccionar elemento en particular.
                enterCircle.on('mouseover', (d, i , all) =>{
                    // Buscamos todos los circulos que no son el donde está el mouse
                    d3.selectAll('circle').filter(circle => circle != d).style("opacity", 0.1).attr("r", 3)
                
                    // Seleccionamos nuestro circulo y le cambiamos el radio.
                    d3.select(all[i]).transition().attr('r', 15);
        
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9)
                        .style("visibility", 'visible');
                    tooltip.html(titleCase(d["comuna"])  + " ("+ d.partido + ")"+ "<br/> "+ d.xlabel +" " + d.xvalue + " || " + d.ylabel + " :" + d.yvalue)
                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
        
                    d3.selectAll('.comuna').filter(comuna => strip_special(comuna.properties.comuna).toLowerCase() == strip_special(d.comuna).toLowerCase()).each(function (c) {
                        
                        d3.select(".country")
                            .text(c.properties.comuna);
        //
                        d3.select(".total")
                            .text(c.details && c.details.total && c.details.total || "¯\\_(ツ)_/¯");
        //          
                        d3.select(".porcentaje")
                            .text(c.details && c.details.porcentaje && c.details.porcentaje || "¯\\_(ツ)_/¯");
            
                        d3.select(".electo")
                            .text(c.details && c.details.nombre && c.details.nombre || "¯\\_(ツ)_/¯");
            
                        d3.select(".partido")
                            .text(c.details && c.details.partido && c.details.partido || "¯\\_(ツ)_/¯");
                    })
        
                    
                    d3.select(".stat1-name")
                        .text(titleCase(ejex) || "¯\\_(ツ)_/¯");
                    d3.select(".stat1-value")
                        .text(d.xvalue || "¯\\_(ツ)_/¯");
                    d3.select(".stat2-name")
                        .text(titleCase(ejey) || "¯\\_(ツ)_/¯");
                    d3.select(".stat2-value")
                        .text(d.yvalue || "¯\\_(ツ)_/¯");
                    
                    d3.select(".mapdetails")
                        .style('visibility', "visible")
                    
                });
        
                enterCircle.on('mouseout', (_, i, all) =>{
                    d3.select(all[i]).transition().attr('r', 3);
                    d3.selectAll('circle').style("opacity", 1);
        
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1)
                        .style("visibility", 'hidden');
        
                    d3.select(".mapdetails")
                        .style('visibility', "hidden")
                });
        
                // export function HighlightCommunes(arr) {
                //     // seleccionar todos los circulos que no estan en el array
                //     d3.selectAll('circle').filter(circle => !arr.includes(circle.comuna)).style("opacity", 0.1);
                //     d3.selectAll('circle').filter(circle => arr.includes(circle.comuna)).attr("r", 15);
                // }
        };
        bubblechartbuild(elecciones, data, ratings, ejex, ejey)

        d3.selectAll("#label-option").on("change", changeYear);
        d3.selectAll('#xaxis-option').on("change", changeXAxis);
        d3.selectAll('#yaxis-option').on("change", changeYAxis);

        function changeYear() {
        //console.log("this.selectedIndex");
            console.log(this.selectedIndex);
            data_selector = "1";
            console.log(nested_casen);
            
            var data = nested_casen[+this.selectedIndex].values;
            var elecciones = nested_elections[+this.selectedIndex].values
            mapbuild(+this.selectedIndex)
            containerBubblechart.selectAll("circle").remove()
            bubblechartbuild(elecciones, data, ratings, ejex, ejey);
        }

        function changeXAxis() {
            ejex = this.options[this.selectedIndex].value;
            containerBubblechart.selectAll("circle").remove()
            bubblechartbuild(elecciones, data, ratings, ejex, ejey);
        }

        function changeYAxis() {
            ejey = this.options[this.selectedIndex].value;
            containerBubblechart.selectAll("circle").remove()
            // containerBubblechart.selectAll("tick").remove()
            bubblechartbuild(elecciones, data, ratings, ejex, ejey);
        }


});
});
});
});
