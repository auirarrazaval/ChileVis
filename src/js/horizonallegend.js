var data = ["CIU","DRP","EVOPOLI","FVERS","IND","MAS","PAIS","PC","PDC","PEV","PH","PI","PODER","PPD","PR","PRI","PRO","PS","RD","RN","TODOS","UDI"];
var n = 6;
var itemWidth = 90;
var itemHeight = 18;
var width = 540;
var height = 400;

var svg = d3.select("#legend");

var svglegend = svg.append("svg")
                .attr('width', width)
                .attr('height', height);

d3.json("src/data/ratings.json").then(ratings => {

var party_ratings = {}
ratings.forEach(rt => {
    party_ratings[rt.sigla] = rt.rating
})
console.log(party_ratings)

var legendGroup = svglegend.append("g")
    .attr("transform", "translate(0,10)");

var legend = legendGroup.selectAll(".legend")
  .data(data)
  .enter()
  .append("g")
  .attr("transform", function(d,i) { return "translate(" + i%n * itemWidth + "," + Math.floor(i/n) * itemHeight + ")"; })
  .attr("class","legend");
  
var rects = legend.append('rect')
  .attr("width",15)
  .attr("height",15)
  .attr("fill", function(d) { 
                            var score = party_ratings[d];
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
  
var text = legend.append('text')
  .attr("x", 15)
  .attr("y",12)
  .text(function(d) { return d; });
});
  