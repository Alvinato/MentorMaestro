/**
 * @file
 * D3 Line Graph library js file.
 */

(function($) {
    // TODO!! fix the div tag for the append scroller...  doing this one first after workout... !!
    // TODO!! create legend...
    // TODO!! create the legend
    // TODO!! create two buttons: 1.) create the new group button... 2.) save button...

    Drupal.d3.bubbles = function (select, settings) {

        console.log(select);
        //console.log(settings.json);

        //  ----->> this is where custom bubbles starts...


        var margin = 20,
            diameter = 700;

        var pack = d3.layout.pack()
            .padding(2)
            .size([diameter - margin, diameter - margin])
            .value(function(d) { return d.size; });


        var svg = d3.select('#' + settings.id).append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("id","thesvg")
            .append("svg:g")
            .attr("id","theg")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


        var drag = d3.behavior.drag()
            .origin(function(d) {
                d.x = 0;
                d.y = 0;
                return d;
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        var data;


        d3.json("mock.json", function (error, root) {
        console.log(root);
            circleSetup(root);
        });

// we need to update all positions of the origin of circles...
        function circleSetup(root){

            // have to delete the ary's as well...
            ary.splice(0,ary.length);
            ary2.splice(0,ary.length);
            svg.selectAll("circle, text").remove(); // removes everything from the past run...
            data = root;
            var focus = root,
                nodes = pack.nodes(root),  // lays out the pack properly
                view;

            var gStates = svg.selectAll("g.state")  // what is this selecting
                .data(nodes)

            var gState = gStates.enter()
                .append("g")
                .attr("transform", "translate(0,0)")
                .attr("class", function (d) {
                    if (d.name.substr(0, 5) == "Group") {
                        return "notdraggable";
                    } else {
                        return "item";
                    }
                });

            gState.append("circle")
                .style("fill", function (d) {
                    return colorize(d);
                })
                .style("fill-opacity", "10.6")
                .style("stroke", "black")
                .attr("id", function (d) {
                    return d.Email;
                });


            // should change the json file so that mentor and mentee show up correctly...
            gState.append("text")
                .attr({
                    'text-anchor': 'middle',
                    y: 4
                })
                .text(function (d) {

                    return d.name;
                });




            gState.call(drag);

            var node = svg.selectAll("circle,text");

            zoomTo([root.x, root.y, root.r * 2 + margin]);
            function zoomTo(v) {
                var key = 0;
                var k = diameter / v[2];
                view = v;
                node.attr("transform", function (d) {
                    // saving all the group values so we can compare when reszing...
                    if (d.name.substr(0, 5) == "Group") {
                        var obj = [];
                        obj[0] = d.name;
                        obj[1] = (d.x - v[0]) * k; // this isnt correct because we are translating it...
                        obj[2] = (d.y - v[0]) * k;
                        obj[3] = d.r * k;
                        ary.push(obj);
                        key++;
                    } else {
                        var obj2 = [];
                        obj2[0] = d.Email;
                        obj2[1] = (d.x - v[0]) * k; // this isnt correct because we are translating it...
                        obj2[2] = (d.y - v[0]) * k;
                        obj2[3] = d.r * k;
                        ary2.push(obj2);
                        key++;
                    }
                    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                });
                node.attr("r", function (d) {
                    return d.r * k;
                });
            }

            function colorize(d) {
                if (d.position == "Mentee") {
                    //  console.log("found mentee");
                    return "green";
                }
                if (d.position == "Mentor") {
                    // console.log("found mentor");
                    return "blue";
                }
                return "orange";
            }

        }


        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
        }

        function dragged(d) {

            var selection = d3.selectAll('.selected');

            if (selection[0].indexOf(this) == -1) {
                selection.classed("selected", false);
                selection = d3.select(this);
                selection.classed("selected", true);
            }

            selection.attr("transform", function(d, i) {
                if (d.name.substr(0,5) == "Group" || d.name == ""){
                    console.log("nondraggable has been selected");
                    return;
                }else{
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;
                    return "translate(" + [d.x, d.y] + ")"
                }
            });
// this makes it so taht only mentors and mentees can be selected...
            if (d.name.substr(0,5) == "Group" || d.name == ""){
                return;
            }else{
                // make sure that the last thing clicked is on top...
                this.parentNode.appendChild(this);
                d3.event.sourceEvent.stopPropagation();
            }
        }

        function dragended(d) {

            // at the end of the drag calls the scroller...
            var box = { left: 0, top: 0, wdith: 0, height: 0 };
            divtagchecker(d);
            appendScroller(box, d.name);
            // resizes everything...
            resizer(d);
        }

// holds the original coordinates and the original groupings...
        var ary = [] ;
        var ary2 = [] ;
        function resizer(d){
            var x;
            var y;
            var r = d.r;
            var daName;
            var draggedName = d.Email;

            for (var i = 0; i<ary2.length;i++){
                var obj = ary2[i];
                //console.log(obj);
                var gName;
                var cx;
                var cy;
                var cr;
                for (var t = 0; t < obj.length; t++){

                    var obj2 = obj[t];
                    if (t == 0){
                        gName = obj2
                    }
                    if (t == 1){
                        cx = obj2
                    }
                    if (t == 2) {
                        cy = obj2
                    }
                    if (t == 3) {
                        cr = obj2
                    }

                }
                if(gName == draggedName) {
                    x = cx + d.x;
                    y = cy + d.y;
                }
            }
            for (var i = 0; i<ary.length;i++){
                var obj = ary[i];
                //console.log(obj);
                var gName;
                var gx;
                var gy;
                var gr;
                for (var t = 0; t < obj.length; t++){
                    var obj2 = obj[t];
                    if (t == 0){
                        gName = obj2
                    }
                    if (t == 1){
                        gx = obj2
                    }
                    if (t == 2) {
                        gy = obj2
                    }
                    if (t == 3) {
                        gr = obj2
                    }
                }
                var distance = lineDistance(x,y,gx,gy);
                var radius = gr + r;
                // have to make sure that it is not the same group...
                if (radius >= distance){
                    console.log("OVERLAPP!!!");
                    daName = gName;
                    // once you find where its overlap send the name of the overlap group and the thing that was dragged...
                    jsonChanger(daName, d);
                    circleSetup(data);
                    break;
                }else{
                    console.log("NO overlap");
                }
            }
        }

// finds the distance between two points...
        function lineDistance( x1, y1, x2, y2)
        {
            var xs = 0;
            var ys = 0;

            xs = x2 - x1;
            xs = xs * xs;

            ys = y2 - y1;
            ys = ys * ys;

            return Math.sqrt( xs + ys );
        }

// accepts name of group and the dragged item.
        function jsonChanger(daName, d){

            // console.log(daName);
            var theEmail = d.Email;
            for (var i in data){
                for(var t in data[i]){
                    for(var a in data[i][t]){
                        var currentThing = data[i][t][a];
                        for(var k in currentThing){
                            //console.log(currentThing[k]);
                            //console.log(currentThing[k].Email);
                            if(currentThing[k].Email == theEmail){
                                var index = currentThing.indexOf(currentThing[k]);
                                //   console.log(currentThing[index]);
                                currentThing.splice(index, 1);
                            }
                        }
                    }
                }
            }

            // adds the moved object into the group that was specified.
            for(var i in data){
                for(var t in data[i]){
                    var currentD = data[i][t];
                    var groupName = data[i][t].name;
                    if (daName == groupName){
                        currentD.children.push(d);

                    }
                }
            }

            //console.log(data);

        }







// takes three arguments... box, json data, and the name that it is looking for...

        function appendScroller(box, path) {
            // console.log("the scroller has been called");
            var path2 = path.concat(".json");
            //console.log(path2);

            d3.json(path2, function (data) {

                // create the div tag where everything sits
                dynamicDiv(box);

                var scrollSVG = d3.select(".newblock").append("svg")
                    .attr("class", "scroll-svg")
                    .attr("id", "othersvg");

                document.getElementById("othersvg").style.zIndex = "20";
                document.getElementById("othersvg").style.width = 1000 + "px";

                // chartgroup is set to append onto scroll svg and class is set...
                var chartGroup = scrollSVG.append("g")
                    .attr("class", "chartGroup")

                // we append a rectangle onto chartgroup...
                chartGroup.append("rect")
                    .attr("fill", "#FFFFFF");

                var infoSVG = d3.select(".information").append("svg")
                    .attr("class", "info-svg");

                // these are all the squares that are entering the frame...
                var rowEnter = function (rowSelection) {
                    rowSelection.append("rect")
                        .attr("rx", 3)
                        .attr("ry", 3)
                        .attr("width", "3000")
                        .attr("height", "24")
                        .attr("fill-opacity", 0.60)
                    rowSelection.append("text")
                        .attr("transform", "translate(10,15)");
                };
                // this is what is updating the index...
                var max = maxLength(data);
                var rowUpdate = function (rowSelection) {
                    rowSelection.select("rect")
                        .attr("fill", function (d) {
                            // set the color of every rectangle according to json
                            return d.colour == "orange" ? "white" : d.colour;
                        });

                    rowSelection.select("text")
                        .text(function (d) {
                            // set the text in each line
                            var txt = line(max, d.author, d.index, d.code);
                            return txt;
                        });
                };

                var rowExit = function (rowSelection) {
                };

                // finds the number of lines in file
                var Array = [];
                data.lines.forEach(function (currentData, i) {
                    Array.push(currentData);
                });
                var lastOne = Array[Array.length - 1];
                var IndexSize = lastOne.index;
                console.log("just about to run the virtual scroller");
                // initliaze the virtual scroller
                // need to wrap virtual scroller function with correct jQuery...
                var virtualScroller = d3.VirtualScroller()
                    .rowHeight(30)
                    .enter(rowEnter)
                    .update(rowUpdate)
                    .exit(rowExit)
                    .svg(scrollSVG)
                    .totalRows(IndexSize)
                    .viewport(d3.select(".newblock"));


                virtualScroller.data(data.lines, function (d) {
                    return d.index;
                });

                chartGroup.call(virtualScroller);

            });
        }

// creates a div tag // need to place the div tag inside the svg...
        // try appending the div tag onto settings
        function dynamicDiv(box){

            var name = "newblock";
            var iDiv = document.createElement('div');
            iDiv.id = name;
            iDiv.className = name;
            //document.getElementsByTagName('body')[0].appendChild(iDiv); // this liine here needs to be changed....
            //document.getElementById("thesvg2").appendChild(iDiv);
          //  console.log("trying to print out the div tag");
            console.log(document.getElementById('visualization'));
            document.getElementById('visualization').appendChild(iDiv);
            document.getElementById(name).style.width = 300 + "px";
            document.getElementById(name).style.height = 600 + "px";
            // set attributes of the div tag
            var a = document.getElementById(name);
            a.style.position = "absolute";
            a.style.left =  "800px"; //xcoord;
            a.style.top = "50px"; //ycoord;
            a.style.overflowY = "auto";
            a.style.border = 1 + "px solid #AAAAAA";
            a.style.backgroundColor = "#e8e8e8";
            a.style.overflowX = "auto";
            a.style.zIndex = "20";
        }

        function line(size, author, index, code){
            var total = author;
            while(total.length <= size)
                total = total +  " ";
            total = total + " : " + index + ": " + code;
            return total;
        }

        function maxLength(d){

            var max = 0;
            for(var i = 0; i < d.lines.length ; i++)
                if( max <= d.lines[i].author.length)
                    max = d.lines[i].author.length;
            return max;
        }

// check if current div tag exists.
        function divtagchecker(d){
            var doesthisexist = document.getElementById("newblock");
            if (doesthisexist == null){
                return;
            }else {
                doesthisexist.parentNode.removeChild(doesthisexist);
            }

        }






    }

})(jQuery);
