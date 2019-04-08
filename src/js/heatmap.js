
var itemSize = 20;
var cellBorderSize = 1; 
var cellSize = itemSize - 1 + cellBorderSize;
var sparkLength = 40; 
var colSortOrder = false;
var heat;
var heatSvg;
var rowLabelGroup;
var colLabelGroup;
var yLabelsNames;
var numYLabels;
var xLabelsNames;
var numXLabels;
var sorted;
var dataHeat = [];
var sparkData;
var avaibleDayData = ['ARICA', 'IQUIQUE', 'SANTIAGO'];

//var areaSelected = d3.select('input[name="area-rb"]:checked').property("value");
//var comunaSelected = d3.select('input[name="comuna-rb"]:checked').property("value");
var comunaSelected = "x"
var areaSelected = "A"
//onsole.log('areaSelected:', areaSelected);
//onsole.log('comunaSelected:', comunaSelected);

var domain1 = [0, 20, 40, 60, 80, 100];
var range1 = ['#DAF7A6 ', '#FFC300 ', '#FF5733 ', '#C70039 ', '#900C3F ', '#581845 ']; 
var colorScaleLin = d3.scaleLinear()
    .domain(domain1)
    .range(range1)
    .interpolate(d3.interpolateHcl);



// Group array data by key value
var groupBy = function(array, key) {
    var arr = array.reduce(function(a, v) {
        (a[v[key]] = a[v[key]] || []).push(v);
        return a;
    }, {});
    return arr;
};

// Tooltip
// tooltip (rect)
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
        return '<div><span>Comuna:</span> <span style=\'color:white\'>' + d.comuna + '</span></div>' +
            '<div><span>Año:</span> <span style=\'color:white\'>' + d.year + '</span></div>' +
            '<div><span>Candidato:</span> <span style=\'color:white\'>' + d.nombre_electo + '</span></div>' +
            '<div><span>Partido:</span> <span style=\'color:white\'>' + d.partido + '</span></div>' +
            '<div><span>Votacion:</span> <span style=\'color:white\'>' + d.val + '</span></div>';
    });


var party_ratings = {
    "PDC": 46.2, "UDI": 85.1, "RN": 70.8, "PPD":36.6, "PRSD": 30, "PEV": 102, "EVOPOLI": 75, "PCCH": 15,
    "IND": 101, "PS" : 28, "PRO": 30.6, "PC": 15, "PH": 26.1, "CIU": 50.7, "DRP":40.4, "FVERS": 25.3,
    "PI": 25.8, "MAS": 28.1, "PAIS": 35.5, "PODER": 27.6, "PR": 32.3, "PRI": 46.4, "RD": 24.2, "TODOS": 40.4}

// Heatmap
var widthData = 100; // random number
var heightData = 100; // random number
var margin = {top: 5, right: 5, bottom: 5, left: 5};
var width = widthData - margin.right - margin.left; 
var height = heightData - margin.top - margin.bottom; 

    // creates the svg element that contains the heatmap
    heat = d3.select('#heatmap');

    heatSvg = heat.append('svg')
        .attr('id', 'heatmapSvg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
        
  rowLabelGroup = heatSvg.append('g')
        .attr('class', 'rowLabels');

  colLabelGroup = heatSvg.append('g')
        .attr('class', 'colLabels');
function actualizarHeatMap(comuna) {
d3.csv("src/data/datapartidos.csv", function row(r) {
            return {
                    comuna: r.comuna,
                    year: r.ano,
                    val: r.porcentaje,
                    partido: r.partido,
                    nombre_electo: r.nombre_electo
                };
            
    }
).then((data) => {

// variables

// Color scale of map
//d3.select("#region-option").on("change", change);
//function change() {
////console.log("this.selectedIndex");
////console.log(this.selectedIndex);
//    data_selector = "1";
//    if (this.selectedIndex == "0"){
//      data_selector = "1";
//    } else if (this.selectedIndex == "1"){
//      data_selector = "2";
//    } else if (this.selectedIndex == "2"){
//      data_selector = "3";
//    }
//    updateHeatmap();
//}
        
updateHeatmap();

function updateHeatmap() {  
    // filter data, take only that about country selected in bubblemap and disease selected with radiobutton
    
    /*dataHeat = data.filter(function(d) { 
        if(comunaSelected == '-') {
            return d.area == areaSelected && d.day == '';
        }
        else {
            return d.selector == data_selector;
            //return d.comuna == comunaSelected && d.area == areaSelected && d.day != '';
        }
    });*/
    if (comuna != ""){
        dataFIL = data.filter(function(d) { 
            return strip_special(d.comuna).toLowerCase() == strip_special(comuna).toLowerCase();
        });

        //console.log("FIL")
        //console.log(dataFIL)
        dataHeat.push.apply(dataHeat, dataFIL)
    }
    else{
        dataFIL = [];
    }
    //console.log('data_selector:', data_selector);
    //console.log('dataHeat:', dataHeat.length);
    //console.log('data:', data);

    // get all the y labels name (ripetitive elements)
    var yLabelsNamesRip = dataHeat.map(function(d) {
        return d.comuna;
    });
    // get all the nuts name (not ripetitive elements)
    yLabelsNames = d3.set(yLabelsNamesRip).values(); 
    numYLabels = yLabelsNames.length; 

    var xLabels = dataHeat.map(function(d) {
        return d.year;
    });
    xLabelsNames = d3.set(xLabels).values();
    numXLabels = xLabelsNames.length; 

    sorted = Array.from(Array(numXLabels).keys()); 

    console.log('yLabelsNames:', yLabelsNames, '// numYLabels:', numYLabels);
    console.log('xLabelsNames:', xLabelsNames, '// numXLabels:', numXLabels);
    console.log('sorted:', sorted);  

    // make region labels
    var rowLabels = rowLabelGroup
        .selectAll('text.rowLabel')
        .data(yLabelsNames);
        
    // ENTER SELECTION FOR COL LABELS
  // ENTER + UPDATE
  // After merging the entered elements with the update selection,
  // apply operations to both.
  rowLabels
        .enter().append('text').attr('class', 'rowLabel mono')
        .attr('font-weight', 'normal')
        .style('text-anchor', 'end')
        .on('mouseover', function(d) {
            d3.select(this).attr('font-weight', 'bold').style('fill', 'red');
        })
        .on('mouseout', function(d) {
            d3.select(this).attr('font-weight', 'normal').style('fill', 'black');
        })
        .attr('x', 0)
        .attr('y', function(d, i) {
            return i * cellSize;
        })
        .attr('transform', function(d, i) {
            return 'translate(-3, 11)';
        })
        .merge(rowLabels)
        .attr('name', function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        })
        .attr('id', function(d) {
            return 'rowLabel_' + yLabelsNames.indexOf(d);           
        })
        .attr('label-r', function(d) {
            return yLabelsNames.indexOf(d);
        });

  // exit/remove elements which are no longer in use
    rowLabels.exit().remove();

    // tooltip call
    heatSvg.call(tip);
    //heatSvg.call(tip2);

    // make year labels
    var colLabels = colLabelGroup
        .selectAll('text.colLabel')
        .data(xLabelsNames);
        
    // ENTER SELECTION FOR COL LABELS
  // ENTER + UPDATE
  // After merging the entered elements with the update selection,
  // apply operations to both.
    colLabels
        .enter().append('text')
        .attr('transform', function(d, i) {
            return 'translate(' + (i * cellSize) + ', 2) rotate(-65)';
        })
        .attr('class', 'colLabel mono')
        .attr('font-weight', 'normal')
        .style('text-anchor', 'left')
        .attr('dx', '.8em')
        .attr('dy', '.5em')
        .on('mouseover', function(d) {
            d3.select(this).attr('font-weight', 'bold').style('fill', 'red');
        })
        .on('mouseout', function(d) {
            d3.select(this).attr('font-weight', 'normal').style('fill', 'black');
        })
        .on('click', function(d, i) {
            colSortOrder = !colSortOrder;
            sortByValues(i, colSortOrder);
        })
        .merge(colLabels)
        .text(function(d) {
            return d;
        })
        .attr('id', function(d) {
            return 'colLabel_' + xLabelsNames.indexOf(d);           
        })
        .attr('label-c', function(d) {
            return xLabelsNames.indexOf(d);
        });
        
  // EXIT
  // Remove old elements as needed.
    colLabels.exit().transition().style('fill', '#FFF').duration(500).remove();

    var rowLabelsProps = d3.selectAll('.rowLabels').node().getBBox();
    var colLabelsProps = d3.selectAll('.colLabels').node().getBBox();

    d3.select('#heatmapSvg')
        .attr('width', rowLabelsProps['width'] + colLabelsProps['width'] + margin.right)
        .attr('height', rowLabelsProps['height'] + colLabelsProps['height'] + margin.bottom + 5)
        .select('g')
        .attr('transform', 'translate(' + (rowLabelsProps['width'] + margin.left) + ', ' + (colLabelsProps['height'] + margin.bottom) + ')');

    // array of data without not number element, because creates problem in find min max value  
    var dataWithoutMissing = [];
    for(var i = 0; i < dataHeat.length; i++) {
        if(!isNaN(dataHeat[i].val)) {
            dataWithoutMissing.push(Number(dataHeat[i].val));
        }
    }
    //console.log('dataWithoutMissing:', dataWithoutMissing);  

    // find min and max Y value (min, max perc)
    const minYvalue = Math.min.apply(Math, dataWithoutMissing); 
    const maxYvalue = Math.max.apply(Math, dataWithoutMissing); 
    //console.log('minYvalue:', minYvalue, '// maxYvalue:', maxYvalue);

    
    // Draw heatmap
    var cells = heatSvg.selectAll('.cell')
        .data(dataHeat);
    
    //console.log('cells:', cells); 
    // ENTER + UPDATE SELECTION FOR CELLS
    cells
        .enter()
        .append('g')
        .append('rect')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('stroke', 'whitesmoke')
        .attr('stroke-width', '1px')
        .style('fill', 'yellow')
        .on('mouseover', function(d, i) { // on mouseover heatmap rect
            // get row, column and value of this rect
            var idr = d3.select(this).attr('data-r'); // row
            var idc = d3.select(this).attr('data-c'); // column
            var value = d3.select(this).attr('data-value'); // coverage value

            // highlight this rect
            d3.select(this).style('stroke', 'blue');
            // show tip
            tip.show(d, i);
            // highlight labels (region and year)
            d3.selectAll('text')
                // highlight region label
                .attr('font-weight', function(d) {
                    var label_r = d3.select(this).attr('label-r');
                    var label_c = d3.select(this).attr('label-c');
                    if(label_r == idr || label_c == idc) {
                        return 'bold';
                    } 
                    else {
                        return 'normal';
                    }
                })
                // highlight year label
                .style('fill', function(d) {
                    var label_r = d3.select(this).attr('label-r');
                    var label_c = d3.select(this).attr('label-c');
                    if(label_r == idr || label_c == idc) {
                        return 'red';
                    } 
                    else {
                        return 'black';
                    }
                });
        })
        .on('mouseout', function(d, i) { // on mouseout rect
            d3.select(this).style('stroke', 'whitesmoke');
            tip.hide(d, i);
            d3.selectAll('text')
                .attr('font-weight', 'normal') 
                .style('fill', 'black'); 
        })
        .merge(cells) // MERGE = UPDATE SELECTION
        .attr('data-value', function(d) {
            return d.val; 
        })
        .attr('data-r', function(d) {
            if(comunaSelected == '-') {
                return yLabelsNames.indexOf(d.comuna);   
            }
            else {
                return yLabelsNames.indexOf(d.comuna);
            }           
        })
        .attr('data-c', function(d, i) {
            if(comunaSelected == '-') {
                return xLabelsNames.indexOf(d.year);
            }
            else {
                return xLabelsNames.indexOf(d.year);
            }   
        })
        .attr('class', function() {
            var idr = d3.select(this).attr('data-r'); // row
            var idc = d3.select(this).attr('data-c'); // column
            return 'cell cr' + idr + ' cc' + idc;
        })
        .attr('x', function(d) { 
            var c = d3.select(this).attr('data-c');
            return c * cellSize;
        })
        .attr('y', function(d) { 
            var r = d3.select(this).attr('data-r');
            return r * cellSize;
        })
    .transition().duration(1000)
        .style('fill', function(d) { 
                            console.log(d)
                            var score = party_ratings[d.partido.toUpperCase()];
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
        //    var col;
        //    if(isNaN(d.val)) {
        //        col = 'url(#pattern-stripes)';
        //    }
        //    else {
        //        col = colorScaleLin(party_ratings[d.partido]); 
        //    }
        //    return col;
        //});     
        
    cells.exit().transition().style('width', 0).duration(500).remove();

    

} 


// Change ordering of cells
function sortByValues(i, sortOrder) {
    var trans = heatSvg.transition().duration(1000);
    var values = []; 
    d3.selectAll('.cc' + i)
        .filter(function(d) {
            if(d.val != '') {
                values.push(Number(d.val));
            } 
            else {
                values.push(-999); 
            }
        });
    sortedVertical = d3.range(numYLabels).sort(function(a, b) {
        if(sortOrder) {
            return values[b] - values[a];
        } 
        else {
            return values[a] - values[b];
        }
    });
    trans.selectAll('.cell')
        .attr('y', function(d) { 
            var row = parseInt(d3.select(this).attr('data-r'));
            return sortedVertical.indexOf(row)*cellSize;
        });
    trans.selectAll('.rowLabel')
        .attr('y', function(d, k) {
            return sortedVertical.indexOf(k) * cellSize;
        });
    sortedVertical.forEach(function(d) {
        d3.select('#data-svg-' + d).raise();
    });
} 

// Return to the initial order when the user clicks on the button
d3.select('#initialOrder').on('click', function() {
    var trans = heat.transition().duration(1000);
    var sortedYear = Array.from(Array(numYLabels).keys());
    trans.selectAll('.cell')
        .attr('y', function(d) { 
            var row = parseInt(d3.select(this).attr('data-r'));
            return sortedYear.indexOf(row)*cellSize;
        });
    trans.selectAll('.rowLabel')
        .attr('y', function(d, k) {
            return sortedYear.indexOf(k) * cellSize;
        });
    sortedYear.forEach(function(d) {
        d3.select('#data-svg-' + d).raise();
    });
});

    
}
);
}
actualizarHeatMap("");

const clear = () => {
    dataHeat.length = 0;
    const dataRect = d3.selectAll('.rowLabel').data(dataHeat);
    const dataText = d3.selectAll('.cell').data(dataHeat);

    dataRect.exit()
        .transition()
        .duration(500)
        //.attr('width', 0)
        .remove();
    
    dataText.exit()
        .transition()
        .delay(500)
        .text('')
        .remove();
    
}

d3.select('#clear').on('click', (_) =>{
    console.log("CLEAR")
    clear();
});