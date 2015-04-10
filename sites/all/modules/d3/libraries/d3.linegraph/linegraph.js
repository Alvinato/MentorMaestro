/**
 * @file
 * D3 Line Graph library js file.
 */

// TODO: MODIFY THIS IF SITE ROOT IS NOT "/"
var siteRoot = "/";
//var siteRoot = "/maestro_main/";
//var siteRoot = "/TESTING/";

(function($) {
    // TODO!! fix the div tag for the append scroller... need to connect this to the svg element so that it looks better
    // TODO!! create the legend  ----->> this will have to deal with later maybe someone can help me...
    // TODO!! create two buttons: 1.) save button which will prompt an alert for now 2.) and an undo button which will undo any changes
    // TODO!! have to fix the hovering over a single circle
    // TODO!! have to fix the grouping tags to be overlapping everything and at the very top or something...// maybe just make a hover notification...
       // TODO!!  ---- > figure out how to use the tool tip in order to show which group it is...
    // TODO!! need to find a place for the recipe's bar...


    //Accomplished!!:  allows for people to be deleted... now need to be able to add people...
    // TODO!! show the words in the legend and also on top of the buttons...
    //TODO!! need to be able to add people
    //TODO!! need to make hover over...
        // how am i going to do this??
        // pressing the add button is going temporarily bring up a listing of everyone in the json file.
        // once a person is clicked then it will revert back to the visualizer and the person will be added outside
    // of any one group...

    Drupal.d3.linegraph = function (select, settings) {

        var key = settings.legend;
        var theweights = settings.weightings;  // this is going to be the weightings...
        console.log("this is going to be the weightings");
        console.log(theweights);    // we need to send in weightings everytime...


        var margin = 20,
            diameter = 700,
            width = 700,
            height = 700;

        var pack = d3.layout.pack()
            .padding(2)
            .size([diameter - margin, diameter - margin])
            .value(function(d) { return d.size; });
        

        var svg = d3.select('#' + settings.id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id","thesvg")
            .call(d3.behavior.zoom().scaleExtent([0, 8]).on("zoom", zoom));
            // call this on svg 2 instead...
        var zoom_start = 0;
        function zoom() {
            svg2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        var svg2 = svg.append("svg:g")  // should make this own variable
            .attr("id","theg")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
           // .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom));

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
        var steps = [];  // an empty array for now...
        var stepCount = -2; // this will hold the index that we should move back on...
        function undo(){
          //  console.log(stepCount);
            if(stepCount <= -1){
                alert("nothing left to undo!");
                return;
            }

           // console.log(steps[stepCount]);
            var jsonStringinput = steps[stepCount];  // this is holding the json input...
           // console.log(steps);
            steps.pop();// pops the last element off;
            stepCount--;
            //console.log("after popping the last step");
            //console.log(steps);
            var input = JSON.parse(jsonStringinput);
            circleSetup(input, true, null);  // there is nothing that was last moved...
            //console.log("running the undo function right now...");


        }
        var data3; // this is going to hold the initial...

        d3.json("TESTING.json", function (error, root) {
             data3 = cloneJSON(root);
             // we assign data3 with the original...
            circleSetup(root, false, null); // nothing that was last changed here...
        });


        function circleSetup(root, undoo, lastChanged){

            data = root;

            var o = {};
            o.o = o;
            var cache = [];

            var result = JSON.stringify(data, function(key, value) {

                if(key == "x" || key == "y"||key == "r"||key == "depth" || key == "parent" || key == "value" || key == null
                    ){
                    return;
                }
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {

                        return;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
            cache = null;

            if(!undoo) {
                steps.push(result);  // pushes the list of strings onto the list...
                stepCount++;
            }

            var object =  jQuery.ajax({
                type: "POST",
                url: siteRoot + "query.php",   // maybe have to make another url here...
                dataType: 'json',
                data: {functionname: 'add', arguments: result},  // try to pass the array in...

                success: function (obj, textstatus) {
                    if( !('error' in obj)) {
                        console.log('worked =)');
                        var result = obj.result;
                        var similaritiesNumber = keys.append("g");
                        similaritiesNumber.append("text")
                            .text(function(){
                                // return the overrall score!!...
                                console.log(result); // this is not giving the correct score right now...
                                var rounded = Math.round(result * 100000) / 1000;
                               // console.log(result);
                                //console.log(rounded);
                                // place a percentage sign
                                if (data.type == "trio")
                                return "Overrall Similarity: " + rounded + "%";
                            })
                            .attr("x",524)
                            .attr("y",12);

                    }
                    else {

                    }
                }

            });



            ary.splice(0,ary.length);
            ary2.splice(0,ary.length);
            // because of this we need to place the legend stuff inside here...
            svg.selectAll("circle, text").remove();


            /* LEGEND */


            var legend = svg.append("g")
                .attr("class", "legend")
            var keys = legend.selectAll("g")
                .data(key)
                .enter().append("g");


            if(data.type != "trio") {
                var GroupInfo = keys.append("g");
                GroupInfo.append("text")
                    .text(function () {
                        // tell them what night it is and what
                        var dastring = data.type.substr(7,15);
                        return "Kickoff Date: " + dastring;

                    })
                    .attr("x", 524)
                    .attr("y", 12);
            }

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
                        return "red";
                    }
                    return "orange";
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


            var button1 = keys.append("g").on("click", function(){
                //TODO!!!
                undo();  // the undo button might have to just call the database and recreate the json file
            });
            var button2 = keys.append("g").on("click", function(){
                //TODO!!! this is going to be the save button... this is going to save it to the database...
               // console.log("the save button is getting pressed right now");
                var o = {};
                o.o = o;
                var cache = [];
                var result = JSON.stringify(data, function(key, value) {
                    //console.log("this is the key" +key);
                    //console.log("this is the value" + value); // print out...
                    if(key == "x" || key == "y"||key == "r"||key == "depth" || key == "parent"
                        ){
                        // get rid of parent....
                     //   console.log("found something and not returning anything for it...");
                        return;
                    }
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                       //     console.log("found something that we are getting rid of");
                            return;
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                });
                cache = null; // Enable garbage collection

               //console.log(result);
                var object =  jQuery.ajax({
                    type: "POST",
                    url: siteRoot + "query.php",   // i could just reference the same page but call another function...
                    dataType: 'json',
                    data: {functionname: 'save', arguments: result},  // try to pass the array in...

                    success: function (obj, textstatus) {
                        if( !('error' in obj) ) {
                            // TODO!! going to return an error message.
                             if (obj.result != null){
                                 alert(obj.result);  }else{

                                 alert("Changes were saved successfully!!");
                             }

                        }
                        else {

                             //     console.log(obj.error);
                        }
                    }
                });

            });

           var button3 = keys.append("g").on("click", function(){
               var myWindow = window.open("examples/bubbles#overlay-context=", "", "width=400, height=400");
                // we need the add button to send input through to this window here...
                // why dont we just call a php function here.
           });
            var button4 = keys.append("g").on("click", function(){  // comparison button
                // comparing with itself right now...
                var myWindow = window.open("examples", "", "width=1350, height=1350");
            });

            var button5 = keys.append("g").on("click", function(){  // comparison button
                // comparing with itself right now...
               // alert("this is opening the window to choose other trios to visualize...");
                var myWindow = window.open("examples/mentor", "", "width=400, height=400");

            });


            var button6 = keys.append("g").on("click", function(){  // comparison button
                // comparing with itself right now...
                // alert("this is opening the window to choose other trios to visualize...");
                // var myWindow = window.open("examples/mentor", "", "width=400, height=400");
                // this needs to open another window here...
                // make the new window now..
                var myWindow = window.open("examples/group", "", "width=400, height=400");
            });


            button1.append("rect")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("width", 50)
                .attr("height", 16)
                .attr("x", 0)
                .attr("y", 70)


            button2.append("rect")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("width", 50)
                .attr("height", 16)
                .attr("x", 0)
                .attr("y", 100);


            button3.append("rect")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("width", 50)
                .attr("height", 16)
                .attr("x", 0)
                .attr("y", 130);

            button4.append("rect")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("width", 70)
                .attr("height", 16)
                .attr("x", 600)
                .attr("y", 43);

            button5.append("rect")
                .attr("fill", function(d){
                    if(data.type == "trio"){
                        return "orange";
                    }else{
                        return "white";
                    }
                })// function here  // this is matching...
                .attr("stroke", "black")
                .attr("width", 70)
                .attr("height", 16)
                .attr("x", 600)
                .attr("y", 70);

            button6.append("rect")
                .attr("fill", function(d){
                    if(data.type == "trio"){
                        return "white";
                    }else{
                        return "pink";
                    }

                })
                .attr("stroke", "black")
                .attr("width", 70)
                .attr("height", 16)
                .attr("x", 600)
                .attr("y", 100);

              /*  .append("title")
                //.append("text")
                .text("new group")
                .attr("dy", "1em");*/

            button6.append("text")// the save text...
                .text("KickOff")
                .attr("x", 606)
                .attr("y", 114);


            button2.append("text")// the save text...
                .text("save")
                .attr("x", 13)
                .attr("y", 113);

            button1.append("text")
                .text("undo").attr("x", 13)// the undo text ontop of button...
                .attr("y", 83);


            button3.append("text")
                .text("add").attr("x",13)
                .attr("y",143);

            button4.append("text")
                .text("Compare").attr("x",608)
                .attr("y",55);

            button5.append("text")
                .text("Trios").attr("x",604)
                .attr("y",83);

            keys.append("text")// can maybe try and use text...
                .text(function(d,i) {
                    //  console.log(d);
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

            // append the weighting stuff onto the screen...
            if ((data.type).substr(0,7) != "kickoff") {
                d3.json("weightings.json", function (data) {
                    console.log(data);
                    var o = {};
                    o.o = o;
                    var cache = [];
                    var result = JSON.stringify(data, function (key, value) {

                        if (typeof value === 'object' && value !== null) {
                            if (cache.indexOf(value) !== -1) {
                                return;
                            }
                            cache.push(value);
                        }
                        return value;
                    });
                    cache = null; // Enable garbage collection
                    console.log(result);

                    result = result.replace(/['"]+/g, '  ');
                    result = result.replace(/['}]+/g, '');
                    result = result.replace(/['{]+/g, '');
                    result = result.replace(/['_]+/g, ' ');
                    //result = result.split("hobbies");
                    result = result.replace("hobbies ", 'hobbies & ');
                    result = result.replace("pref ", 'preferences ');
                    console.log(result);
                    var showweights = keys.append("g");
                    showweights.append("text")
                        .text(function () {
                            return result;
                        })
                        .attr("x", 30)
                        .attr("y", 690);
                });
            }
            /*start of circle stuff */

            var focus = root,
                nodes = pack.nodes(root),  // lays out the pack properly
                view;

            var gStates = svg2.selectAll("g.state")  // what is this selecting
                .data(nodes);

            var gState = gStates.enter()
                .append("g")
                .attr("id", function(d){
                        // the d function...
                    if (d.name == ""){
                        return "first";
                    }
                    if(d.name.substr(0,5) == "Group"){
                        return d.name;
                    }
                    return d.name + d.familyname;  // concat the first and last name ...
                })
                .attr("transform", "translate(0,0)")
                .attr("class", function (d) {
                 //   console.log(d.name);
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
                    // passing in the circle and we should find the dimension of the circle such as the x,y, and r.
                  //  showToolTip(d, this);
                    hideToolTip(d, this);
                    if(d.name.substr(0,5) == "Group" || d.depth == 0){  // if its a group or the outercircle

                        //showToolTip(d, this, 0);
                        return;
                    }else {

                        if ((data.type).substr(0,7) != "kickoff") {
                       // console.log("calling the tooltip function righ now");
                            d3.selectAll("#groupNumber").remove();
                            var groupNumber  = keys.append("g").attr("id", "groupNumber");
                            groupNumber.append("text")
                                .text(function(dataa){
                                    // figure out the similarity here...
                         //               console.log(dataa);
                          //              console.log(d);
                                    var weighting = returnweightingfromjson(dataa, d);
                            //            console.log(weighting);
                                    var weighting = Math.round(weighting * 100000) / 1000;
                                    return "Group Similarity: " + weighting + "%";
                                })
                                .attr("x",524)
                                .attr("y",30);
                            //showToolTip(d,this, 0);
                        }
                        var nodeSelection = d3.select(this).style({opacity: '0.3'});
                    }
                })
                .on('mouseout', function(d){
                    var nodeSelection1 =  d3.select(this).style({opacity:'10.6'});
                    //hideToolTip(d, this); // not hiding properly right now
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
                .attr("font-size", "5.0px")
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

            // dont do the error detection with the kickoff night...

            function colorize(d) {
                if ((data.type).substr(0,7) != "kickoff") {
                    if (d.name.substr(0, 5) == "Group") {
                        var error = check_error_in_group(d);
                        if (error == 1) {
                            //    console.log("returning purple");
                            return "purple";
                        } else {
                            //  console.log("returning orange");
                            return "orange";
                        }
                    }
                }else{
                    if (d.name.substr(0, 5) == "Group") {
                        return "pink";
                    }
                }
                if (d.position == "Mentor") {
                    //  console.log("found mentee");
                    return "green";
                }
                if (d.position == "Junior") {
                    // console.log("found mentor");
                    return "blue";
                }
                if (d.position == "Senior"){
                    return "red";
                }

                if(d.name == ""){
                    if(data.type == "trio") {
                        return "orange";  // changed from orange to grey...
                    }else{
                        return "pink";
                    }
                }

            }


            function check_error_in_group(d) {
                //console.log("before the loop");
                //console.log(d);  // this is the one we are looking for

                for (var i in data){
                    //console.log(data[i]);
                    for (var t in data[i]) {
                        //console.log(data[i][t]);
                        if (data[i][t].name != undefined) {
                            //console.log(data[i][t].name.substr(0, 5));
                            if (data[i][t].name == d.name) {
                  //              console.log("we have found teh group...");
                               // console.log(data[i][t].children);
                               // console.log(data[i][t].children.length);
                                if (data[i][t].children.length != 3 ) {
                                 //   console.log("found one with the wrong number");
                                    return 1;  // meaning that this is worng
                                }
                                var mentor=0;
                                var junior=0;
                                var senior=0;
                                // we need to go through the children...
                                for(var m = 0; m < 3; m++){
                    //                console.log("printing the children");
                     //               console.log(data[i][t].children[m].position);
                                    if(data[i][t].children[m].position == "Mentor"){
                                       mentor = 1;
                                    }
                                    if(data[i][t].children[m].position == "Senior"){
                                        senior = 1;
                                    }

                                    if(data[i][t].children[m].position == "Junior"){
                                        junior = 1;
                                    }
                                }
                                if (mentor == 0|| junior == 0 || senior == 0){
                                    return 1;
                                }

                            }
                        }
                    }
                }
                return 0;
            }

            if(lastChanged != null)
            {

                var myCircle= d3.selectAll("#" + lastChanged.name + lastChanged.familyname);   // cant use the email as the identifier...
                myCircle.transition().delay(50).duration(1000)
                    .attr("transform", "translate(320, 0)")
                  //.style("opacity", "0")// this should change the opacity of the g element...
                    //.style("fill", "purple")
                    .each("end", myCallback);

            }

            function myCallback(){

                var myCircle= d3.selectAll("#" + lastChanged.name + lastChanged.familyname);   // cant use the email as the identifier...
                myCircle.transition().delay(10).duration(1000)
                    .attr("transform", "translate(0, 0)")  // this
                    .style("fill", "purple")
                    .each("end", myCallback1);


            }
            function myCallback1(){

                var myCircle= d3.selectAll("#" + lastChanged.name + lastChanged.familyname);   // cant use the email as the identifier...
                myCircle.style("fill", "white");

            }

        }


        function dragstarted(d) {
            var box = { left: 0, top: 0, wdith: 0, height: 0 };
           // console.log(d.familyname);
            var filename = d.name + d.familyname;
            appendScroller(box, filename);   // call the info that you are dragging
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
                    //console.log("nondraggable has been selected");
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
           // console.log(d.familyname);
            var filename = d.name + d.familyname;
            appendScroller(box, filename);
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
            var br; // the biggest r's value...
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

                if(gName == undefined){
                    br = cr;
                }
            }

            // we have to detect if its not on top of the root circle...

            var daDistance = lineDistance(x,y, 0, 0);  // find the distance to the middle...
            var daRadius = br + r;                  // now we need to compare...

            if (daRadius < daDistance){
                if (data.type == "trio"){
                d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "orange");
                d3.selectAll("#first").style("fill-opacity", "10.6").style("fill", "orange");
                }else{
                    d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "pink");
                    d3.selectAll("#first").style("fill-opacity", "10.6").style("fill", "pink");


                }
                overlap = 1;  // set this so the bottom loop doesnt run...

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
                    if(data.type == "trio"){
                    d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "orange");
                    // get the big circle to become normal
                    d3.selectAll("#first").style("fill-opacity", "10.6").style("fill", "orange");
                    daName = gName; // dont select the single group with name...
                    var selection = d3.selectAll("#" + gName).style("fill-opacity", "0.5").style("fill", "blue");
                    overlap = 1;
                    break;
                    }else{
                        d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "pink");
                        // get the big circle to become normal
                        d3.selectAll("#first").style("fill-opacity", "10.6").style("fill", "pink");
                        daName = gName; // dont select the single group with name...
                        var selection = d3.selectAll("#" + gName).style("fill-opacity", "0.5").style("fill", "blue");
                        overlap = 1;
                        break;
                    }
                }
            }
            if (overlap != 1){
               // console.log("not on top of a group right now...");
                overlap = 0;
                if(data.type == "trio"){
                d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "orange");}else{
                    d3.selectAll(".Group").style("fill-opacity", "10.6").style("fill", "pink");
                }
                d3.selectAll("#first").style("fill-opacity", "0.5").style("fill", "blue");
            }
        }

// holds the original coordinates and the original groupings...
        var ary = [] ;  // this holds the group information...
        var ary2 = [] ;  // this holds the candidate information..

        function resizer(d){
            //console.log(d);
            var overlap = 0;
            var x;  // current x?
            var y;  // current y?
            var r = d.r;  // current radius?
            var daName;
            var draggedName = d.Email;
            var bx;  // the biggest x's coordinate
            var by;  // the biggest y's coordinate...
            var br; // the biggest r's value...

            for (var i = 0; i<ary2.length;i++){
                var obj = ary2[i];
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
                    x = cx + d.x;  // assign the dragged x
                    y = cy + d.y;  // assign the dragged y
                }

                if(gName == undefined){
                    br = cr;
                }
            }

            var daDistance = lineDistance(x,y, 0, 0);  // find the distance to the middle...
            var daRadius = br + r;                  // now we need to compare...

           if (daRadius < daDistance){
              // console.log("it is outside the circle!!!");
               // here we have to delete the current circle... making a pop up warning the user about what is about to happen...
               var answer_from_user = confirm("Are you sure you want to remove " + d.name + "?");
               if (answer_from_user){
                   // the user says yes i would like to delete... then we start deleting the user from the json unit
                   //TODO!!! delete json unit
                   //console.log("attempting to delete person here!!");
                jsonChanger(name, d, true);  // we use true to indicate that we need to rename all the groups now...
                circleSetup(data, false);
                   return;
               }else{
                   circleSetup(data, false);
                   return;
               }
           }


            //go through the group info... and check if there was an overlap...
            for (var i = 0; i<ary.length;i++){

                var obj = ary[i];
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
                // this checks the group line Distance
                var distance = lineDistance(x,y,gx,gy);
                var radius = gr + r;                // adding the two radius to compare.
                // have to make sure that it is not the same group...
                if (radius >= distance){
                  //  console.log("OVERLAPP!!!");
                    daName = gName;
                    // once you find where its overlap send the name of the overlap group and the thing that was dragged...
                    jsonChanger(daName, d, false);  // input the group name and the thing that was dragged.
                    circleSetup(data, false, d);  // d is going to be the last thing that was added... we need to make it light up...
                    overlap = 1;
                    break;
                }else{
                }
            }

            if (overlap != 1){
              //  console.log("no overlap with any groups");
                overlap = 0;
                addGroup(d);  // this is going to place the circle outside...
                circleSetup(data,false, d);   // pass the last thing that was changed and make it light up for a bit...
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

        // delete the person from the group and reorganize.
        function deletePerson(d){
            //TODO!!!
        }

        // this function will run everytime a circle is placed outside of another group... it will form its own group...
        function addGroup(d){
           // console.log("add a group is running right now!!");
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
                               // console.log("this deleting part is running right now");
                               // console.log(data[i][t]);
                                var index = data.children.indexOf(data[i][t]);
                               // console.log("this is the index value: " + index);
                                data.children.splice(index, 1);
                                //console.log("this should show one less object")
                                //console.log(data.children);

                            }
                        }
                    }
                }
            }


            var array = [d];
            // have to place the current thing into a new group completely...
           // console.log(data);  // have the thing we need to move...
           // console.log(data.children.length);
            var number = data.children.length;
            var name = "Group" + number;
            var newGroup = {name: name,
                children:  array
            };


            //TODO!! need to go through the list and make sure that the groups are in sequential order now...

            //newGroup.children.push(d);
         //   console.log(newGroup);
       data.children.push(newGroup);
           // console.log(data.children);

        }

// accepts name of group and the dragged item.
        function jsonChanger(daName, d, remove){
         //  console.log("inside the json changer right now!!");
          //  console.log("this is the remove value"+ remove);  // this is the remove value...
            // deleting from a certain group...
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
            //                    console.log(currentThing[index]);
                                currentThing.splice(index, 1);
                            }
                        }
                    }
                }
            }

            // adds the moved object into the group that was specified.
            // this needs to come before
            for(var i in data){
                for(var t in data[i]){
                    var currentD = data[i][t];
                    var groupName = data[i][t].name;
                    if (daName == groupName){
                        currentD.children.push(d);
                    }
                }
            }

            //  this should go in the overlay part because this only happens when take things away into other groups not when u add them...
            // need to check if there are any groups that dont have any children... if they dont then have to delete...
            //console.log("just before the second loop");

              //  console.log("inside the second loop right now to delete a group."); // u always need to delete a group though...
                for (var i in data) {

                //    console.log(data[i]);
                    for (var t in data[i]) {

                  //      console.log(data[i][t]);
                        if (data[i][t].name != undefined) {
                            //console.log(data[i][t].name.substr(0, 5));
                            if (data[i][t].name.substr(0, 5) == "Group") {  // if we found a group then
                    //            console.log("we are checking a group");  // hcekcing the children of the gorup...
                     //           console.log(data[i][t].children);
                         //       console.log("[]");
                       //         console.log("using new approach1");
                                //if (data[i][t].children == undefined || data[i][t].children == []) {  // the "[]" is also if it is null...
                                  if (data[i][t].children == undefined){
                                      var index = data.children.indexOf(data[i][t]);
                                      data.children.splice(index, 1);
                                      break;
                                  }
                                  if( data[i][t].children.length <= 0 ){  // if the length is less then zero then we delete not more..
                                    // we found a group that has no children...
                           //         console.log("found a group that has no children");
                                    // now we have to delete this particular entry...
                                   // console.log("this deleting part is running right now");
                             //       console.log(data[i][t]);
                                    var index = data.children.indexOf(data[i][t]);
                                    //console.log("this is the index value: " + index);
                                    data.children.splice(index, 1);
                                    // we have to delete and then we have to reorganize the entire array...
                                    //console.log("this should show one less object")

                                    //console.log(data.children);

                                }
                            }
                        }
                    }
                }


            // after we delete a group we need to renumber all the groups!!!..
            var groupCounter = 0;
          //  if(remove == true) {
                //console.log("yaya we removed something=!!");
                for (var i in data) {
                    for (var t in data[i]) {
                        //console.log("inside the loop here...!!");
                        if (data[i][t].name != undefined) {
                            if (data[i][t].name.substr(0, 5) == "Group") {  // if we found a group then
                                // rename the group here...
                                //console.log("we found a group!!");
                                data[i][t].name = "Group" + groupCounter;
                                groupCounter = groupCounter + 1;
                                //console.log("we just changed a number of a group!!");
                                //console.log(data[i][t].name);
                            }

                        }
                    }
                }
          //  }


        }


// takes three arguments... box, json data, and the name that it is looking for...

        function appendScroller(box, path) {
            // console.log("the scroller has been called");
            var path2 = (siteRoot + "json/").concat(path.concat(".json"));
            //console.log(path2);

            d3.json(path2, function (data) {

           //     console.log(data);

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
                            //TODO!!! we need to set the text of every single line!!.
                            var txt = line(max, "->",d.index, d.code);
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
            document.getElementById(name).style.width = 330  + "px";
            document.getElementById(name).style.height = 700 + "px";
            // set attributes of the div tag
            var a = document.getElementById(name);
            a.style.position = "absolute";
            a.style.left =  "1130px"; //xcoord;
            a.style.top = "365px"; //ycoord;
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
          //  console.log("this is the lines getting called here");
          //  console.log(d);
          //  console.log(d.lines);

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
        function showToolTip(d, obj, decider) {  // should pass in the dimensions of the circle.
            // need parameter saying whether it is from groups or candidate.
            var group = d3.select(obj.parentNode);
           // console.log(d.Email);
            var tooltip = svg2.append('g')
                .attr('class', 'tooltip')
                .append('g')
                .attr('transform', function(data) {
                    var x;
                    var y;
                    var r;
                    //console.log(d);
                    if (decider == 0) {
                        for (var i = 0; i < ary2.length; i++) {
                            //   console.log(ary2[i][0]);
                            if (d.Email == ary2[i][0]) {
                              //  console.log(d.Email);

                                // set x y r
                             //   console.log("found the correct thing in the array!!");
                                x = ary2[i][1]; // x
                                y = ary2[i][2]; // y
                                r = ary2[i][3]; // radius
                            }
                        }
                    }
                    // go through the groups...
                    if(decider == 1) {
                        for (var i = 0; i < ary.length; i++) {
                           // console.log(ary[i]);  // check if they have the x and y...
                            if (d.name == ary[i][0]) {
                                // set x y r
                                //console.log("found the correct thing in the array!!");
                              //  console.log(d.name);
                                x = ary[i][1]; // x
                                y = ary[i][2]; // y
                                r = ary[i][3]; // radius
                            }
                        }
                    }
                   x = x + r ; // making it the top right hand side
                    y = y - r + 0;
                    //x = 50;
                    //y = 50;
                    return 'translate(' +  x + ',' + y + ')'; }); // use x and y for now...

            d3.json("TESTING.json", function(dataa){
      //          console.log(dataa);
       //         console.log(d);
                var weighting = returnweightingfromjson(dataa, d);
                // nothing to do with this file tool tip isnt working for all...
                var string =  weighting;
         //       console.log(string);
         //       console.log("this is the tooltip...");
         //       console.log(tooltip);
                // just dont use tooltip and just append text instead...
                d3.tooltip(tooltip, string); // give it the correct arguments...
            });


        }

        function hideToolTip(d, obj) {
            svg2.select('g.tooltip').remove();
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

function select()
{
document.getElementById("demo").innerHTML="The select function is called.";
}

// we set the weighting in every single group before hand...
function returnweightingfromjson(dataa, check){

    //console.log("returningweightingfromjson");
    for (var i in data) {
        for (var t in data[i]) {
         //   console.log(data[i][t]);
           // console.log("inside the loop");
            // for every group we have to find every person...
            for (var a in data[i][t]) {
                var currentThing = data[i][t][a];
                for(var k in currentThing){
               //     console.log("inside the last loop");
             //   console.log(currentThing[k]);
                    if(check.Email == currentThing[k].Email){
                 //       console.log("found it!!");
                        var weighting = currentThing[k].weighting;
                   //     console.log("this is the weighting that we need:  " + weighting);
                        return weighting;

                    }
            }
        }
        }
    }


}











    }

})(jQuery);

