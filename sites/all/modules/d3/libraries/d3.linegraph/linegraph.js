/**
 * @file
 * D3 Line Graph library js file.
 */

(function($) {
    // TODO!! fix the div tag for the append scroller... need to connect this to the svg element so that it looks better
    // TODO!! create the legend  ----->> this will have to deal with later maybe someone can help me...
    // TODO!! create two buttons: 1.) save button which will prompt an alert for now 2.) and an undo button which will undo any changes
    // TODO!! have to fix the hovering over a single circle
    // TODO!! have to fix the grouping tags to be overlapping everything and at the very top or something...// maybe just make a hover notification...
       // TODO!!  ---- > figure out how to use the tool tip in order to show which group it is...
    // TODO!! need to find a place for the recipe's bar...

    Drupal.d3.linegraph = function (select, settings) {

       var key = settings.legend;
        var margin = 20,
            diameter = 700;

        var pack = d3.layout.pack()
            .padding(2)
            .size([diameter - margin, diameter - margin])
            .value(function(d) { return d.size; });


        var svg = d3.select('#' + settings.id).append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("id","thesvg");



            var svg2 = svg.append("svg:g")  // should make this own variable
            .attr("id","theg")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


        /* LEGEND */
        var legend = svg.append("g")
            .attr("class", "legend")
        var keys = legend.selectAll("g")
            .data(key)
            .enter().append("g")

        keys.append("rect")
            .attr("fill", function(d,i) {
                //console.log(i);
                if (i == 0) {
                    return "green";
                }
                if (i == 1) {
                    return "blue";
                }
                if (i == 2) {
                    return "orange";
                }
                return "red"
            })
            .attr("class", function(d,i) {
                if (i == 0) {
                    return "color_" + "green";
                }
                if (i == 1) {
                    return "color_" + "blue";
                }
                if (i == 2) {
                    return "color_" + "orange";
                }
                return "red";
            //    return "color_" + "green";
            })
            .attr("width", 16)
            .attr("height", 16)
            .attr("y", function(d,i){
                if (i == 0) {
                    return 0;
                }
                if (i == 1) {
                    return 20;
                }
                if (i == 2) {
                    return 40;
                }
                return 0;

            })
            .attr("x", 0);


        keys.append("rect")
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("width", 50)
            .attr("height", 16)
            .attr("x", 0)
            .attr("y", 70)
            .on("click", function(){
              //TODO!!! this is going to be the save button...
                alert("save function is yet to be implemented");
            })

        keys.append("rect")
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("width", 50)
            .attr("height", 16)
            .attr("x", 0)
            .attr("y", 100)
            .on("click", function(){
                //TODO!!! this is going to be the undo button...

                undo();

            })
            .append("title")
            //.append("text")
            .text("new group")
            .attr("dy", "1em");


        // just make div tags...
        keys.append("text")// can maybe try and use text...
            .text(function(d,i) {
                console.log(d);
                return d;
            })
            .attr("x", 30)
            .attr("y", function(d,i) {
                if (i == 0) {
                    return 0;
                }
                if (i == 1) {
                    return 20;
                }
                if (i == 2) {
                    return 40;
                }
                return 0;
            })
            .attr("dy", "1em");


        // start of dragging
        var drag = d3.behavior.drag()
            .origin(function(d) {
                d.x = 0;
                d.y = 0;
                return d;
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        var allData = []; // this holds a list of all instances of the json file...
        var data; // current statte of the circles...
        var data1; // this is going to be the previous state of the circles...
        // reverts everything back to the previous file...
        function undo(){
            /*console.log("inside the undoing function");
            console.log(allData);
            allData.pop(); // pop the last element off and then resassign...

            var lastElement = allData[allData.length - 1];
            data1 = lastElement;
            console.log("this is going to be the last element");
            console.log(data1);*/
            //circleSetup(data3);
            d3.json("mock.json", function (error, root) {
                data3 = cloneJSON(root);
                // we assign data3 with the original...
                circleSetup(root);
            });

        }
        var data3; // this is going to hold the initial...

        d3.json("mock.json", function (error, root) {
             data3 = cloneJSON(root);
             // we assign data3 with the original...
            circleSetup(root);
        });

        function circleSetup(root){

            console.log("setting up circles bro");
           // console.log(root);
            // this doesnt work because when we pass it in again the json format is going to be that of a circle...

            //var y = JSON.parse(JSON.stringify(root));
            // have to use stringify to create the json rid of all circle shit...
            //console.log(y);
           // allData.push(y);
           // console.log(allData.length);

            ary.splice(0,ary.length);
            ary2.splice(0,ary.length);
            svg.selectAll("circle, text").remove(); // removes everything from the past run...
            data = root;
            var focus = root,
                nodes = pack.nodes(root),  // lays out the pack properly
                view;

            var gStates = svg2.selectAll("g.state")  // what is this selecting
                .data(nodes);

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
                    if (d.name == ""){
                        return "first";
                    }
                    if(d.name.substr(0,5) == "Group"){
                        return d.name;
                    }
                    return d.Email;
                })
                .attr("class", function(d){
                    // get all groups into one class here..
                    if (d.name.substr(0,5) == "Group"){
                        return "Group";
                    }
                })
                .on("mouseover", function(d){
                    //showToolTip(d, i, this);

                    if(d.name.substr(0,5) == "Group" || d.depth == 0){


                        return;
                    }else {
                        var nodeSelection = d3.select(this).style({opacity: '0.3'});
                    }

                })
                .on('mouseout', function(d){
                    var nodeSelection1 =  d3.select(this).style({opacity:'10.6'});

                });

           // have to place the text in the corner if it is a group
            gState.append("text")
                .attr({
                    'text-anchor': 'middle',
                    y: 4
                })
                .attr("x", 0)
                .attr("y", function(d){

                    if(d.name.substr(0,5) == "Group"){
                        return 50;
                    }

                })
               /* .attr("text-anchor", function(d){
                    if(d.name.substr(0,5) == "Group"){
                        return 'bottom';
                    }
            })*/

                .text(function (d) {
                    if (d.name.substr(0,5) == "Group"){
                        return "";
                    }
                    return d.name;
                });


            gState.call(drag);

            var node = svg2.selectAll("circle,text"); // i think it may because of this line here...

            zoomTo([root.x, root.y, root.r * 2 + margin]);
            function zoomTo(v) {
                var key = 0;
                var k = diameter / v[2];
                view = v;
                node.attr("transform", function (d) {

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
            // it is here that we have to check the hovering over another group...
            hover(d);

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

        // this function gets called by drag and colors any group that has a circle hovering over it...
        function hover(d){
            var overlap = 0;
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
                    d3.select("#first").style("fill-opacity", "10.6").style("fill", "orange");
                    d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "orange");
                    daName = gName; // dont select the single group with name...
                    d3.select("#" + gName).style("fill-opacity", "0.3").style("fill", "blue");
                    //d3.select(".Group").style("fill-opacity", "0.1").style("fill", "blue");
                    overlap = 1;
                    break;
                }
            }
            if (overlap != 1){
                overlap = 0;
                d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "orange");
                // lets make the big circle color up...
                d3.select("#first").style("fill-opacity", "0.5").style("fill", "blue");
            }
        }

// holds the original coordinates and the original groupings...
        var ary = [] ;
        var ary2 = [] ;
        function resizer(d){
           // console.log(d);
            var overlap = 0;
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
                    //console.log("OVERLAPP!!!");
                    daName = gName;
                    // once you find where its overlap send the name of the overlap group and the thing that was dragged...
                    jsonChanger(daName, d);
                    circleSetup(data);
                    overlap = 1;
                    break;
                }else{
                    //console.log("NO overlap");

                }

            }
            if (overlap != 1){
                overlap = 0;
                addGroup(d);  // this is going to place the circle outside...
                circleSetup(data);
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

        // this function will run everytime a circle is placed outside of another group... it will form its own group...
        function addGroup(d){

            // delete it from the current group...
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
            } // so now that we have deleted it from the current group there should be a group that is lying around that can be deleted...


            //  this should go in the overlay part because this only happens when take things away into other groups not when u add them...
            // need to check if there are any groups that dont have any children... if they dont then have to delete...
            for (var i in data){
                //console.log(data[i]);
                for (var t in data[i]) {
                    //console.log(data[i][t]);
                    if (data[i][t].name != undefined) {
                        //console.log(data[i][t].name.substr(0, 5));
                        if (data[i][t].name.substr(0, 5) == "Group") {
                            //console.log("we are checking a group...");
                            //console.log(data[i][t].children);
                            if (data[i][t].children == undefined) {
                                // now we have to delete this particular entry...
                                console.log("this deleting part is running right now");
                                console.log(data[i][t]);
                                var index = data.children.indexOf(data[i][t]);
                                console.log("this is the index value: " + index);
                                data.children.splice(index, 1);
                                console.log("this should show one less object")

                                console.log(data.children);

                            }
                        }
                    }
                }
            }


            var array = [d];
            // have to place the current thing into a new group completely...
           // console.log(data);  // have the thing we need to move...
           // console.log(data.children.length);
            var number = data.children.length + 1;
            var name = "Group" + number;
            var newGroup = {name: name,
                children:  array
            };

            //newGroup.children.push(d);
         //   console.log(newGroup);
       data.children.push(newGroup);
           // console.log(data.children);

            // we have to delete the object in the group...
        }
// accepts name of group and the dragged item.
        function jsonChanger(daName, d){
           // console.log(d);
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

            //  this should go in the overlay part because this only happens when take things away into other groups not when u add them...
            // need to check if there are any groups that dont have any children... if they dont then have to delete...
            for (var i in data){
                //console.log(data[i]);
                for (var t in data[i]) {
                    //console.log(data[i][t]);
                    if (data[i][t].name != undefined) {
                        //console.log(data[i][t].name.substr(0, 5));
                        if (data[i][t].name.substr(0, 5) == "Group") {
                            //console.log("we are checking a group...");
                            //console.log(data[i][t].children);
                            if (data[i][t].children == undefined) {
                                // now we have to delete this particular entry...
                                console.log("this deleting part is running right now");
                                console.log(data[i][t]);
                                var index = data.children.indexOf(data[i][t]);
                                console.log("this is the index value: " + index);
                                data.children.splice(index, 1);
                                console.log("this should show one less object")

                                console.log(data.children);

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
             //   console.log("just about to run the virtual scroller");
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
           // console.log(document.getElementById('visualization'));
            document.getElementById('visualization').appendChild(iDiv);
            //d3.select("#thesvg").appendChild(iDiv);
          //  document.getElementById("thesvg").appendChild(iDiv);
            document.getElementById(name).style.width = 375 + "px";
            document.getElementById(name).style.height = 700 + "px";
            // set attributes of the div tag
            var a = document.getElementById(name);
            a.style.position = "absolute";
            a.style.left =  "710px"; //xcoord;
            a.style.top = "100px"; //ycoord;
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

        // we just copy this function... create a g element and place it into tool tip and then pass the d element that it needs to place it
        // over...
        function showToolTip(d, i, obj) {


            var group = d3.select(obj.parentNode);

            var tooltip = graph.append('g')
                .attr('class', 'tooltip')
                // move to the x position of the parent group
                .attr('transform', function(data) { return group.attr('transform'); })
                .append('g')
                // now move to the actual x and y of the bar within that group
                .attr('transform', function(data) { return 'translate(' + (Number(bar.attr('x')) + barWidth) + ',' + y(d) + ')'; });
            // instantiates tool tip
            // tooltip accepts a g element and also the d element that was chosen...
            d3.tooltip(tooltip, d);
        }

        function hideToolTip(d, i, obj) {
            var group = d3.select(obj.parentNode);
            var bar = d3.select(obj);
            bar.attr('stroke-width', '0')
                .attr('opacity', 1);

            graph.select('g.tooltip').remove();
        }

        // this needs to clone my json object and then place it in another array
        function cloneJSON(obj) {
            // basic type deep copy
            if (obj === null || obj === undefined || typeof obj !== 'object')  {
                return obj
            }
            // array deep copy
            if (obj instanceof Array) {
                var cloneA = [];
                for (var i = 0; i < obj.length; ++i) {
                    cloneA[i] = cloneJSON(obj[i]);
                }
                return cloneA;
            }
            // object deep copy
            var cloneO = {};
            for (var i in obj) {
                cloneO[i] = cloneJSON(obj[i]);
            }
            return cloneO;
        }


    }

})(jQuery);
