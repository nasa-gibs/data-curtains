
var dayTracks = true, nightTracks = false, markers = true;
/*
 * Reads metadata from a .json file for the specified date
 * @param {String} metadata_date
 * @param {function} callback 
 */
function readJSON(metadata_date, callback) {
    var xhttpObj = new XMLHttpRequest();
    xhttpObj.overrideMimeType("application/json");
    xhttpObj.open('GET', 'data/' + metadata_date + '.json', true);
    xhttpObj.onreadystatechange = function() {
        if (xhttpObj.readyState == 4 && xhttpObj.status == "200") {
            callback(xhttpObj.responseText);
        } else { //if (xhttpObj.readyState == 4 && xhttpObj.status == "404"){
            callback(null);
        }
    };
    xhttpObj.send(null);
}



function toggleDN() {

    dayTracks = !dayTracks;
    nightTracks = !nightTracks;

    if( dayTracks == true) {
	    for (var j = 0; j < viewer.entities.values.length; j++) {
	
		var tEntity = viewer.entities.values[j];
		if(tEntity.wall.outline._value == true && tEntity.wall.material.color._value.red == 1) {
			if(tEntity.show == false)
				tEntity.show = !tEntity.show;
		} else if(tEntity.wall.outline._value == true){
			if(tEntity.show == true)
				tEntity.show = !tEntity.show;
		}
		
	    }
    } else if (nightTracks == true) {

	    for (var j = 0; j < viewer.entities.values.length; j++) {
	
		var tEntity = viewer.entities.values[j];
		if(tEntity.wall.outline._value == true && (tEntity.wall.material.color._value.blue == 1 || tEntity.wall.material.color._value.green == 0.5019607843137255)) {
			if(tEntity.show == false)
				tEntity.show = !tEntity.show;
		} else if(tEntity.wall.outline._value == true){
			if(tEntity.show == true)
				tEntity.show = !tEntity.show;
		}
		
	    }


    }
	if(dayTracks) {
	var elements = document.getElementsByClassName("night");
	for(var i=0; i<elements.length; i++)
	    elements[i].style.display = "none";
	elements = document.getElementsByClassName("day");
	for(var i=0; i<elements.length; i++)
	    elements[i].style.display = "block";
	
	} else if(nightTracks) {
	var elements = document.getElementsByClassName("day");
	for(var i=0; i<elements.length; i++) 
	    elements[i].style.display = "none";
	elements = document.getElementsByClassName("night");
	for(var i=0; i<elements.length; i++) 
	    elements[i].style.display = "block";
	}
}

/*
 * Toggle between markers and LiDAR curtains
 */
function toggleMarkers() {
markers = !markers;
clickableDivs = !clickableDivs;
    if(dayTracks == true) {
	    for (var j = 0; j < viewer.entities.values.length; j++) {
	
		var tEntity = viewer.entities.values[j];
		if(tEntity.wall.outline._value == true && tEntity.wall.material.color._value.red == 1) {
				tEntity.show = !tEntity.show;
		}
		
	    }
    } else if (nightTracks == true) {

	    for (var j = 0; j < viewer.entities.values.length; j++) {
	
		var tEntity = viewer.entities.values[j];
		if(tEntity.wall.outline._value == true && (tEntity.wall.material.color._value.blue == 1 || tEntity.wall.material.color._value.green == 0.5019607843137255)) {
				tEntity.show = !tEntity.show;
		}
		
	    }


    }



}

/*
 * Adds the orbital tracks and LiDAR curtains for the specified date
 * @param {Array} CalipsoData
 * @param {String} dateString 
 * @param {String} time 
 */
function visualize(CalipsoData, dateString, time) {

    if (CalipsoData == null) {
        console.log("Data from JSON is null");
        return;
    }

    var trackColor, clickableDivs = true;
    var showValue;
    if (prevDate != dateString || firstVisualize == 0) {
        document.getElementById("pb_list_items").innerHTML = "<div id=pb_item>Date: " + dateString + "</div><br>";
        document.getElementById("pb_list_items").innerHTML += "<div id=pb_item class=day>Orbit: Daytime<br></div>";
        document.getElementById("pb_list_items").innerHTML += "<div id=pb_item class=night>Orbit: Nighttime<br></div>";
    }
    for (var m = 0; m < CalipsoData[0].curtains.length; m++) {
        if (CalipsoData[0].curtains[m].orbit == "Daytime") {

            trackColor = Cesium.Color.RED;
	    showValue = dayTracks;
        } else {
       
            trackColor = Cesium.Color.BLUE;
	    showValue = nightTracks;
        }



        for (var i = 0; i < CalipsoData[0].curtains[m].sections.length; i++) {
            var flag = 0;

            if (prevDate != dateString || firstVisualize == 0) {
		if(CalipsoData[0].curtains[m].orbit == "Daytime")
                content = "<div id=pb_item_data class=day name=D0C" + m + "S" + i + " onmouseover=hoveredDiv('D0C" + m + "S" + i + "'); onclick=clickedDiv('D0C" + m + "S" + i + "'); onmouseleave=leftDiv('D0C" + m + "S" + i + "');><table><tr><td><img src=" + CalipsoData[0].curtains[m].sections[i].img + " height=35 width=80/></td><td>&nbsp;Start Time: " + CalipsoData[0].curtains[m].sections[i].start_time + "<br>&nbsp;End Time: &nbsp;" + CalipsoData[0].curtains[m].sections[i].end_time + "</td></tr></table></div>";
		if(CalipsoData[0].curtains[m].orbit == "Nighttime")
                content = "<div id=pb_item_data class=night name=D0C" + m + "S" + i + " onmouseover=hoveredDiv('D0C" + m + "S" + i + "'); onclick=clickedDiv('D0C" + m + "S" + i + "'); onmouseleave=leftDiv('D0C" + m + "S" + i + "');><table><tr><td><img src=" + CalipsoData[0].curtains[m].sections[i].img + " height=35 width=80/></td><td>&nbsp;Start Time: " + CalipsoData[0].curtains[m].sections[i].start_time + "<br>&nbsp;End Time: &nbsp;" + CalipsoData[0].curtains[m].sections[i].end_time + "</td></tr></table></div>";
                document.getElementById("pb_list_items").innerHTML += content;
            }

            var coords = CalipsoData[0].curtains[m].sections[i].coordinates;
            var maxHts = new Array(2);

            //Populate MaxHts array
            for (var j = 0; j < 2; j++) {
                maxHts[j] = 500000;
            }

            if (isMarkerTime(time, CalipsoData[0].curtains[m].sections[i].start_time, CalipsoData[0].curtains[m].sections[i].end_time)) {
                eId = 'D' + 0 + 'C' + m + 'S' + i;
            }

            //Only add entities (orbital tracks) if the previous date and the selected date are different
            if (prevDate != dateString || firstVisualize == 0) {
                viewer.entities.add({
                    name: '532nm Total Attenuated Backscatter',
                    id: 'D' + 0 + 'C' + m + 'S' + i,
                    description: "Date : " + CalipsoData[0].date + "<br>Orbit : " + CalipsoData[0].curtains[m].orbit + "<br>Start Time (UTC) :  " + CalipsoData[0].curtains[m].sections[i].start_time + "<br>End Time (UTC) : " + CalipsoData[0].curtains[m].sections[i].end_time,
                    wall: {
                        positions: Cesium.Cartesian3.fromDegreesArray([coords[0], coords[1], coords[coords.length - 2], coords[coords.length - 1]]),
                        maximumHeights: [500000, 500000],
                        material: trackColor,
                        outline: true,
                        outlineWidth: 1.0,
                        outlineColor: Cesium.Color.BLACK
                    },
                    show: showValue
                });
            }

        }

        //document.getElementById("pb_list_items").innerHTML += "<br>";

    }
    if (prevEId != -1) {
        var hts = viewer.entities.getById(prevEId).wall.maximumHeights._value;
        for (var x = 0; x < hts.length; x++)
            hts[x] = 500000;
        var numberPattern = /\d+/g;
        var indices = prevEId.match(numberPattern);
        if (CalipsoData[0].curtains[indices[1]].orbit == "Daytime") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }

        viewer.entities.getById(prevEId).wall.maximumHeights = hts;

        viewer.entities.getById(prevEId).wall.material = trackColor;




    }

    if (typeof eId !== 'undefined') {

        var hts = viewer.entities.getById(eId).wall.maximumHeights._value;
        for (var x = 0; x < hts.length; x++)
            hts[x] = 500000;
        viewer.entities.getById(eId).wall.maximumHeights = hts;
        if (viewer.entities.getById(eId).wall.material._color._value.red == 1) {
            viewer.entities.getById(eId).wall.material = Cesium.Color.YELLOW;
        } else {
            viewer.entities.getById(eId).wall.material = Cesium.Color.GREEN;
        }
        prevEId = eId;
        eId = undefined;

    }

    prevDate = dateString;
    firstVisualize = 1;
	var elements = document.getElementsByClassName("night");
	for(var i=0; i<elements.length; i++) {
	    elements[i].style.display = "none";
	}
}


/*
 * Returns whether the selected time falls between the start and the end time
 * @param {String} time
 * @param {String} startTime 
 * @param {String} endTime 
 */
function isMarkerTime(time, startTime, endTime) {

    if (time != -1) {

        var sh, sm, ss, eh, em, es, selh, selm, sels;

        selh = time.hour;
        selm = time.minute;
        sels = time.second;

        var startTimeString = startTime.split(":");
        sh = parseInt(startTimeString[0]);
        sm = parseInt(startTimeString[1]);
        ss = parseInt(startTimeString[2]);

        var endTimeString = endTime.split(":");
        eh = parseInt(endTimeString[0]);
        em = parseInt(endTimeString[1]);
        es = parseInt(endTimeString[2]);

        var selTime = new Date();
        selTime.setHours(selh, selm, sels, 0);

        var sTime = new Date();
        sTime.setHours(sh, sm, ss, 0);

        var eTime = new Date();
        eTime.setHours(eh, em, es, 0);

        if (selTime.getTime() >= sTime.getTime() && selTime.getTime() <= eTime.getTime())
            return true;
        else
            return false;
    } else {
        return false;
    }
}

/*
 * Display/Toggle between marker and curtain after clicking on a section of an orbital track
 * @param {Cesium.viewer} viewer
 * @param {movement.position} windowPosition 
 */
function pickEntityClick(viewer, windowPosition) {
    var picked = viewer.scene.pick(windowPosition);
    if (Cesium.defined(picked) && CalipsoData != null) {
        var entityInstance = Cesium.defaultValue(picked.id, picked.primitive.id);
        if (entityInstance instanceof Cesium.Entity) {


    if (!clickableDivs) {
        toggleMarkers();
        return;
    }

            var numberPattern = /\d+/g;
            var indices = entityInstance.id.match(numberPattern);

            if (entityInstance.wall.outline._value == true) { //It is a Marker, so display Data Curtain
                document.getElementsByName(entityInstance.id)[0].id = "pb_item_clicked";
                var myElement = document.getElementById('pb_item_clicked');
                var topPos = myElement.offsetTop;
                document.getElementById('pb_list').scrollTop = topPos - 300;
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(2);
                for (var j = 0; j < (2); j++) {
                    maxHts[j] = 2000000;
                }

                entityInstance.wall.outline = false;
                entityInstance.wall.material = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].img;

                //Center Coordinates to focus on, when user clicks on a section of orbital track
                var halfLon = (coords.length) / 2;
                var halfLat = (coords.length) / 2 + 1;

                viewer.camera.setView({
                    position: Cesium.Cartesian3.fromDegrees(CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates[halfLon], CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates[halfLat], 50000.0),
                    heading: Cesium.Math.toRadians(90.0), // east, default value is 0.0 (north)
                    pitch: Cesium.Math.toRadians(-45), // default value (looking down)
                    roll: 0.0 // default value
                });
                viewer.camera.zoomOut(10000000);




            } else { // It is a Data Curtain, display Marker --Toggle

                document.getElementsByName(entityInstance.id)[0].id = "pb_item_data";
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(2);
                for (var j = 0; j < (2); j++) {
                    maxHts[j] = 500000;
                }

                    if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Daytime") {
                        trackColor = Cesium.Color.RED;
			if (dayTracks == false) 
			   entityInstance.show = !entityInstance.show;
                    } else {
                        trackColor = Cesium.Color.BLUE;
			if (nightTracks == false) 
			   entityInstance.show = !entityInstance.show;
                    }
                    entityInstance.wall.outline = true;
                    entityInstance.wall.material = trackColor;
		    


            }
            entityInstance.wall.maximumHeights = maxHts;
        }
    } else {
        console.log("undefined");
    }
};


/*
 * Display/Toggle between marker and curtain after hovering on a section of an orbital track
 * @param {Cesium.viewer} viewer
 * @param {movement.position} windowPosition 
 */
function pickEntityHover(viewer, windowPosition) {
    console.log("In hover");
    var picked = viewer.scene.pick(windowPosition);
    var indices;
    if (Cesium.defined(picked) && CalipsoData != null) {
        if (typeof tempEntity !== 'undefined') {
            clearOnHoverOver(tempEntity);
        }

        var entityInstance = Cesium.defaultValue(picked.id, picked.primitive.id);
        tempEntity = entityInstance;
        if (entityInstance instanceof Cesium.Entity) {


            var numberPattern = /\d+/g;
            indices = entityInstance.id.match(numberPattern);

            if (entityInstance.wall.outline._value == true) { //Marker

                if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Daytime") {
                    trackColor = Cesium.Color.YELLOW;
                } else {
                    trackColor = Cesium.Color.GREEN;
                }

                entityInstance.wall.material = trackColor;
		console.log(entityInstance.wall.material.color._value);

            } else { //Data-Curtain

                var coordsLen = CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates.length;

                if (!(viewer.entities.getById('alt1'))) {
                    var altCoords1 = [];
                    altCoords1.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[0]);
                    altCoords1.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[1]);

                    altCoords1.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[12]);
                    altCoords1.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[13]);
                    CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates;
                    var maxHts = new Array(altCoords1.length / 2);
                    //Populate MaxHts array
                    for (var j = 0; j < altCoords1.length / 2; j++) {
                        maxHts[j] = 2000000;
                    }


                    viewer.entities.add({
                        name: 'Atitude',
                        id: 'alt1',
                        wall: {
                            positions: Cesium.Cartesian3.fromDegreesArray(altCoords1),
                            maximumHeights: maxHts,
                            material: 'images/scale.png',
                            outline: false
                        }
                    });
                }
                if (!(viewer.entities.getById('alt2'))) {
                    var altCoords2 = [];
                    altCoords2.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[coordsLen - 2]);
                    altCoords2.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[coordsLen - 1]);

                    altCoords2.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[coordsLen - 12]);
                    altCoords2.push(CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates[coordsLen - 11]);
                    CalipsoData[0].curtains[indices[1]].sections[indices[2]].coordinates;
                    var maxHts = new Array(altCoords2.length / 2);
                    //Populate MaxHts array
                    for (var j = 0; j < altCoords2.length / 2; j++) {
                        maxHts[j] = 2000000;
                    }

var entity = new Cesium.Entity({
        name: "532nm Total Attenuated Backscatter"
    });
entity.description = {
    getValue : function() {
        return "Date : " + CalipsoData[0].date + "<br>Orbit : " + CalipsoData[0].curtains[indices[1]].orbit + "<br>Start Time (UTC) :  " + CalipsoData[0].curtains[indices[1]].sections[indices[2]].start_time + "<br>End Time (UTC) : " + CalipsoData[0].curtains[indices[1]].sections[indices[2]].end_time;
    }
};
viewer.selectedEntity = entity;

                    viewer.entities.add({
                        name: 'Atitude',
                        id: 'alt2',
                        wall: {
                            positions: Cesium.Cartesian3.fromDegreesArray(altCoords2),
                            maximumHeights: maxHts,
                            material: 'images/scale.png',
                            outline: false
                        }
                    });
                }

            }
        }

    } else {

        clearOnHoverOver(tempEntity);
    }
};

/*
 * Clear on hover over event
 * @param {Cesium.Entity} tempEntity
 */
function clearOnHoverOver(tempEntity) {
    if (typeof tempEntity !== 'undefined' && CalipsoData != null) {
        if (viewer.entities.getById('alt1'))
            viewer.entities.remove(viewer.entities.getById('alt1'));
        if (viewer.entities.getById('alt2'))
            viewer.entities.remove(viewer.entities.getById('alt2'));

        var numberPattern = /\d+/g;
        var indices = tempEntity.id.match(numberPattern);

        //Marker or Data-Curtain

        if (tempEntity.wall.outline._value == false) { //Data-Curtain

        } else { //Marker

            if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Daytime") {
                trackColor = Cesium.Color.RED;
            } else {
                trackColor = Cesium.Color.BLUE;
            }
            tempEntity.wall.material = trackColor;
        }
    }

}

/*
 * Changes the base layer and highlights a section of the orbital track on setting time on the Timeline
 * @param {Event} e
 */
function handleSetTime(e) {
    if (Cesium.defined(viewer.timeline)) {

        var julianDate = e.timeJulian;
        var gregorian = Cesium.JulianDate.toGregorianDate(julianDate);

        if (gregorian.day < 10)
            dayString = "0" + gregorian.day.toString();
        else
            dayString = gregorian.day.toString();

        if (gregorian.month < 10)
            monthString = "0" + gregorian.month.toString();
        else
            monthString = gregorian.month.toString();
        dateString = gregorian.year.toString() + "-" + monthString + "-" + dayString;
        if (prevDate != dateString) {
            console.log("Code to Change Base Imagery goes here");

            var destination = scene.camera.getRectangleCameraCoordinates(Cesium.Camera.DEFAULT_VIEW_RECTANGLE);

            var mag = Cesium.Cartesian3.magnitude(destination);
            mag += mag * Cesium.Camera.DEFAULT_VIEW_FACTOR;
            Cesium.Cartesian3.normalize(destination, destination);
            Cesium.Cartesian3.multiplyByScalar(destination, mag, destination);

            direction = Cesium.Cartesian3.normalize(destination, new Cesium.Cartesian3());
            Cesium.Cartesian3.negate(direction, direction);
            right = Cesium.Cartesian3.cross(direction, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3());
            up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());

            scene.camera.flyTo({
                destination: destination,
                orientation: {
                    direction: direction,
                    up: up
                },
                duration: 1.5,
                endTransform: Cesium.Matrix4.IDENTITY
            });



            layers.removeAll();

            layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({

                url: "https://gibs.earthdata.nasa.gov/wmts-webmerc/wmts.cgi?TIME=" + dateString, //Date changes dynamically, from the Cesium Timeline Widget input.
                layer: "MODIS_Aqua_CorrectedReflectance_TrueColor",
                style: "",
                format: "image/jpeg",
                tileMatrixSetID: "GoogleMapsCompatible_Level9",
                maximumLevel: 9,
                tileWidth: 256,
                tileHeight: 256,
                tilingScheme: new Cesium.WebMercatorTilingScheme()


            }));


        }

        if (prevDate == dateString) {
            visualize(CalipsoData, dateString, gregorian);
            return;
        }

        prevEId = -1;
        viewer.entities.removeAll();
	dayTracks = true, nightTracks = false, markers = true;
        readJSON(dateString, function(responseText) {
            CalipsoData = JSON.parse(responseText);
            visualize(CalipsoData, dateString, gregorian);

        });


    }
}


/*
 * Highlight a section of the orbital track on hovering on a list item in the Profile Browser
 * @param {String} name
 */
function hoveredDiv(name) {

    console.log("Hovered on " + name);
    entityInstance = viewer.entities.getById(name);
    var numberPattern = /\d+/g;
    indices = entityInstance.id.match(numberPattern);

    if (entityInstance.wall.outline._value == true) { //Marker

        if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Daytime") {
            trackColor = Cesium.Color.YELLOW;
        } else {
            trackColor = Cesium.Color.GREEN;
        }

        entityInstance.wall.material = trackColor;


    } else { //Data-Curtain
        console.log("Data Curtain detected");
    }
}


/*
 * Clicking on a list item in the Profile Browser display the LiDAR Curtain and zooms to it
 * @param {String} name
 */
function clickedDiv(name) {
    if (!clickableDivs) {
        toggleMarkers();
        return;
    }
    console.log(name);
    entityInstance = viewer.entities.getById(name);

    var numberPattern = /\d+/g;
    var indices = name.match(numberPattern);
    console.log("indices=", indices);
    if (CalipsoData[indices[0]]) {
        if (CalipsoData[indices[0]].curtains[indices[1]]) {


            if (entityInstance.wall.outline._value == true) { //It is a Marker, so display Data Curtain
                document.getElementsByName(name)[0].id = "pb_item_clicked";
                console.log("Its a marker");

                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(2);
                for (var j = 0; j < 2; j++) {
                    maxHts[j] = 2000000;
                }

                entityInstance.wall.outline = false;
                entityInstance.wall.material = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].img;



                var halfLon = (coords.length) / 2;
                var halfLat = (coords.length) / 2 + 1;

                viewer.camera.setView({
                    position: Cesium.Cartesian3.fromDegrees(CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates[halfLon], CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates[halfLat], 50000.0),
                    heading: Cesium.Math.toRadians(90.0), // east, default value is 0.0 (north)
                    pitch: Cesium.Math.toRadians(-45), // default value (looking down)
                    roll: 0.0 // default value
                });
                viewer.camera.zoomOut(10000000);

            } else {
                console.log("Its a data curtain");
                // It is a Data Curtain, display Marker --Toggle
    
                document.getElementsByName(name)[0].id = "pb_item_data";
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(2);
                for (var j = 0; j < (2); j++) {
                    maxHts[j] = 500000;
                }

                    if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Daytime") {
                        trackColor = Cesium.Color.RED;
                    } else {
                        trackColor = Cesium.Color.BLUE;
                    }
                    entityInstance.wall.outline = true;
                    entityInstance.wall.material = trackColor;
	    if(entityInstance.show == true && markers == false)
	    entityInstance.show = !entityInstance.show;
	      
            }
            entityInstance.wall.maximumHeights = maxHts;

        }
    }
    console.log("I am done");
}

/*
 * Hover over event from a list item in the Profile Browser
 * @param {String} name
 */
function leftDiv(name) {
    console.log("Left  " + name);

    entityInstance = viewer.entities.getById(name);
    var numberPattern = /\d+/g;
    indices = entityInstance.id.match(numberPattern);

    if (entityInstance.wall.outline._value == true) { //Marker

        if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Daytime") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }

        entityInstance.wall.material = trackColor;


    } else { //Data-Curtain

    }
}



var provider = new Cesium.WebMapTileServiceImageryProvider({
    url: "//gibs.earthdata.nasa.gov/wmts-webmerc/wmts.cgi?TIME=2015-01-01",
    layer: "MODIS_Aqua_CorrectedReflectance_TrueColor",
    style: "",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible_Level9",
    maximumLevel: 9,
    tileWidth: 256,
    tileHeight: 256,
    tilingScheme: new Cesium.WebMercatorTilingScheme()
});

var viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    baseLayerPicker: false,
    timeline: true,
    imageryProvider: provider,

});

//Variable Initalizations
var layers = viewer.scene.imageryLayers;

var tempEntity, dateString, eId;
var scene = viewer.scene;
var ellipsoid = scene.globe.ellipsoid;
handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
var prevDate = "2015-01-01",
    prevEId = -1,
    firstVisualize = 0;
var CalipsoData, content, clickableDivs = true;


// Initialize the Timeline to date "2015-01-01"
viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2015-01-01"),
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2015-01-02"),
    viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2015-01-05"),
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP,
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER


// Update the Timeline to the Clock
viewer.timeline.updateFromClock();
viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);



readJSON("2015-01-01", function(responseText) {
    //Read metadata from 2015-01-01.json
    CalipsoData = JSON.parse(responseText);
    //Set the Clock to Jan 01, 2015
    //Generate the markers from the JSON
    visualize(CalipsoData, "2015-01-01", -1);

});


//Event Handler for Click
handler.setInputAction(function(movement) {
    pickEntityClick(viewer, movement.position);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//Event Handler for Hover

handler.setInputAction(function(movement) {
    pickEntityHover(viewer, movement.endPosition);
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


viewer.timeline.addEventListener('settime', handleSetTime, false);

