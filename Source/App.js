var provider = new Cesium.WebMapTileServiceImageryProvider({
    url: "//map1.vis.earthdata.nasa.gov/wmts-webmerc/wmts.cgi?TIME=2015-01-01", //Will require the date to be changed dynamically, from the Cesium Timeline Widget input.
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
    animation: false, // Only showing one day in this demo
    baseLayerPicker: false, // Only showing one layer in this demo
    timeline: true, // Only showing one day in this demo
    imageryProvider: provider, // The layer being shown
    //sceneMode : Cesium.SceneMode.COLUMBUS_VIEW
});

var CalipsoData, tempEntity, dateString, eId, curtainsVisible = 0;
var scene = viewer.scene;
var ellipsoid = scene.globe.ellipsoid;
handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

function readJSON(metadata_date,callback) {
    var xhttpObj = new XMLHttpRequest();
    xhttpObj.overrideMimeType("application/json");
    xhttpObj.open('GET', 'data/'+metadata_date+'.json', true);
    xhttpObj.onreadystatechange = function() {
        if (xhttpObj.readyState == 4 && xhttpObj.status == "200") {
            callback(xhttpObj.responseText);
        }
	else {
	    callback(null);
	}
    };
    xhttpObj.send(null);
}
    viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2015-01-01"),
        viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2015-01-02"),
        viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2015-01-05"),
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP,
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER


    //Update the Timeline to the Clock
    viewer.timeline.updateFromClock();
    viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);



var prevDate = -1, firstVisualize = 0;

readJSON("2015-01-01",function(responseText) {
    //Read metadata.json
    CalipsoData = JSON.parse(responseText);
    //Set the Clock to Jan 01, 2015
    var time = -1;
    //Generate the markers from the JSON
    visualize(CalipsoData, dateString, -1);

});

function visualize(CalipsoData, dateString, time) {

     var trackColor, dateIndex = 0;       
	console.log(CalipsoData);
    
    //Data of selected date unavailable
    if (CalipsoData == null) {
    	viewer.entities.removeAll();
	prevDate = 0;
        return;
    } 

    if(prevDate!=dateString) {
   		viewer.entities.removeAll();
    } else {
    	console.log("prevDate = dateString, so REUSE");
    }

    //Only look for data of the selected date, hence CalipsoData[dateIndex]
    for (var m = 0; m < CalipsoData[dateIndex].curtains.length; m++) {

        if (CalipsoData[dateIndex].curtains[m].orbit == "Day-Time") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }


        for (var i = 0; i < CalipsoData[dateIndex].curtains[m].sections.length; i++) {
            var flag = 0;
            var coords = CalipsoData[dateIndex].curtains[m].sections[i].coordinates;
            var maxHts = new Array(coords.length / 2);
            //Populate MaxHts array
            for (var j = 0; j < coords.length / 2; j++) {
                maxHts[j] = 500000;
            }

            if (isMarkerTime(time, CalipsoData[dateIndex].curtains[m].sections[i].start_time, CalipsoData[dateIndex].curtains[m].sections[i].end_time)) {
                eId = 'D' + dateIndex + 'C' + m + 'S' + i;
            }

            if(prevDate!=dateString) {
            	console.log("prevDateIndex != dateIndex, so adding new entity")
	            viewer.entities.add({
	                name: '532nm Total Attenuated Backscatter',
	                id: 'D' + dateIndex + 'C' + m + 'S' + i,
	                description: "Date : " + CalipsoData[dateIndex].date + "<br>Orbit : " + CalipsoData[dateIndex].curtains[m].orbit + "<br>Start Time (UTC) :  " + CalipsoData[dateIndex].curtains[m].sections[i].start_time + "<br>End Time (UTC) : " + CalipsoData[dateIndex].curtains[m].sections[i].end_time,
	                wall: {
	                    positions: Cesium.Cartesian3.fromDegreesArray(coords),
	                    maximumHeights: maxHts,
	                    material: trackColor,
	                    outline: true,
	                    outlineWidth: 1.0,
	                    outlineColor: Cesium.Color.BLACK
	                }
	            });
	        }


        }

    }
    if (typeof eId !== 'undefined') {
        var hts = viewer.entities.getById(eId).wall.maximumHeights._value;
        for (var x = 0; x < hts.length; x++)
            hts[x] = 800000;
        viewer.entities.getById(eId).wall.maximumHeights = hts;
        if (viewer.entities.getById(eId).wall.material._color._value.red == 1) {
            viewer.entities.getById(eId).wall.material = Cesium.Color.YELLOW;
        } else {
            viewer.entities.getById(eId).wall.material = Cesium.Color.GREEN;
        }

        eId = undefined;

    }
prevDate=dateString;
}




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

function pickEntityClick(viewer, windowPosition) {
    var picked = viewer.scene.pick(windowPosition);
    if (Cesium.defined(picked) && CalipsoData != null) {
        var entityInstance = Cesium.defaultValue(picked.id, picked.primitive.id);
        if (entityInstance instanceof Cesium.Entity) {
            var numberPattern = /\d+/g;
            var indices = entityInstance.id.match(numberPattern);

            if (entityInstance.wall.outline._value == true) { //It is a Marker, so display Data Curtain
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(coords.length / 2);
                for (var j = 0; j < (coords.length / 2); j++) {
                    maxHts[j] = 2000000;
                }

                entityInstance.wall.outline = false;
                entityInstance.wall.material = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].img;
		curtainsVisible++;
		if(curtainsVisible==1) {
var heading = Cesium.Math.toRadians(-180);
var pitch = Cesium.Math.toRadians(0);
                viewer.flyTo(entityInstance,new Cesium.HeadingPitchRange(heading, pitch));
/*.then(function(result){
  if (result) {
   viewer.camera.rotateRight(1.57);
  }
});*/

		}

            } else { // It is a Data Curtain, display Marker --Toggle
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(coords.length / 2);
                for (var j = 0; j < (coords.length / 2); j++) {
                    maxHts[j] = 500000;
                }
                setTimeout(function() {
                    if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Day-Time") {
                        trackColor = Cesium.Color.RED;
                    } else {
                        trackColor = Cesium.Color.BLUE;
                    }
                    entityInstance.wall.outline = true;
                    entityInstance.wall.material = trackColor;
		    curtainsVisible--;

                }, 1);
            }
            entityInstance.wall.maximumHeights = maxHts;
        }
    } else {
        console.log("undefined");
    }
};



function pickEntityHover(viewer, windowPosition) {
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

                if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Day-Time") {
                    trackColor = Cesium.Color.YELLOW;
                } else {
                    trackColor = Cesium.Color.GREEN;
                }

                entityInstance.wall.material = trackColor;


            } else { //Data-Curtain

            }
        }
    } else {
        clearOnHoverOver(tempEntity);
    }
};

function clearOnHoverOver(tempEntity) {
    if (typeof tempEntity !== 'undefined' && CalipsoData != null) {
        var numberPattern = /\d+/g;
        var indices = tempEntity.id.match(numberPattern);

        //Marker or Data-Curtain

        if (tempEntity.wall.outline._value == false) { //Data-Curtain

        } else { //Marker

            if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Day-Time") {
                trackColor = Cesium.Color.RED;
            } else {
                trackColor = Cesium.Color.BLUE;
            }
            tempEntity.wall.material = trackColor;
        }
    }

}

function handleSetTime(e) {
    if (Cesium.defined(viewer.timeline)) {
        var julianDate = e.timeJulian;
        var gregorian = Cesium.JulianDate.toGregorianDate(julianDate);
        console.log(gregorian);
    if(gregorian.day<10)
    dayString = "0"+gregorian.day.toString();
    else
    dayString = gregorian.day.toString();

    if(gregorian.month<10)
    monthString = "0"+gregorian.month.toString();
    else
    monthString = gregorian.month.toString();
    dateString = gregorian.year.toString() + "-" + monthString + "-" + dayString;

readJSON(dateString,function(responseText) {
    //Read metadata.json
    CalipsoData = JSON.parse(responseText);
    
    //Generate the markers from the JSON
    visualize(CalipsoData, dateString, gregorian);

});


    }
}

//Event Handler for Click
handler.setInputAction(function(movement) {
    pickEntityClick(viewer, movement.position);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//Event Handler for Hover
handler.setInputAction(function(movement) {
    pickEntityHover(viewer, movement.endPosition);
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


viewer.timeline.addEventListener('settime', handleSetTime, false);
