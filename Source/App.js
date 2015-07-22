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

var tempEntity, dateString, eId, curtainsVisible = 0;
var scene = viewer.scene;
var ellipsoid = scene.globe.ellipsoid;
handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
var prevDate = "2015-01-01",
    prevEId = -1,
    firstVisualize = 0;
var CalipsoData;

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
viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2015-01-01"),
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2015-01-02"),
    viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2015-01-05"),
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP,
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER


//Update the Timeline to the Clock
viewer.timeline.updateFromClock();
viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);




readJSON("2015-01-01", function(responseText) {
    //Read metadata.json
    CalipsoData = JSON.parse(responseText);
    //Set the Clock to Jan 01, 2015
    //Generate the markers from the JSON
    visualize(CalipsoData, dateString, -1);

});

function visualize(CalipsoData, dateString, time) {
    if (CalipsoData == null) {
        console.log("Data from JSON is null");
        return;
    }

    var trackColor;

    for (var m = 0; m < CalipsoData[0].curtains.length; m++) {

        if (CalipsoData[0].curtains[m].orbit == "Day-Time") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }


        for (var i = 0; i < CalipsoData[0].curtains[m].sections.length; i++) {
            var flag = 0;
            var coords = CalipsoData[0].curtains[m].sections[i].coordinates;
            var maxHts = new Array(coords.length / 2);
            //Populate MaxHts array
            for (var j = 0; j < coords.length / 2; j++) {
                maxHts[j] = 500000;
            }

            if (isMarkerTime(time, CalipsoData[0].curtains[m].sections[i].start_time, CalipsoData[0].curtains[m].sections[i].end_time)) {
                eId = 'D' + 0 + 'C' + m + 'S' + i;
            }
            console.log(prevDate);
            console.log(dateString);
            if (prevDate != dateString || firstVisualize == 0) {
                viewer.entities.add({
                    name: '532nm Total Attenuated Backscatter',
                    id: 'D' + 0 + 'C' + m + 'S' + i,
                    description: "Date : " + CalipsoData[0].date + "<br>Orbit : " + CalipsoData[0].curtains[m].orbit + "<br>Start Time (UTC) :  " + CalipsoData[0].curtains[m].sections[i].start_time + "<br>End Time (UTC) : " + CalipsoData[0].curtains[m].sections[i].end_time,
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
    if (prevEId != -1) {
        var hts = viewer.entities.getById(prevEId).wall.maximumHeights._value;
        for (var x = 0; x < hts.length; x++)
            hts[x] = 500000;
        var numberPattern = /\d+/g;
        var indices = prevEId.match(numberPattern);
        if (CalipsoData[0].curtains[indices[1]].orbit == "Day-Time") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }

        viewer.entities.getById(prevEId).wall.maximumHeights = hts;

        viewer.entities.getById(prevEId).wall.material = trackColor;




    }

    if (typeof eId !== 'undefined') {
        console.log(eId);
        console.log(prevEId);




        var hts = viewer.entities.getById(eId).wall.maximumHeights._value;
        for (var x = 0; x < hts.length; x++)
            hts[x] = 800000;
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
                if (curtainsVisible == 1) {
                    var heading = Cesium.Math.toRadians(-180);
                    var pitch = Cesium.Math.toRadians(0);
                    viewer.flyTo(entityInstance, new Cesium.HeadingPitchRange(heading, pitch));


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

        if (gregorian.day < 10)
            dayString = "0" + gregorian.day.toString();
        else
            dayString = gregorian.day.toString();

        if (gregorian.month < 10)
            monthString = "0" + gregorian.month.toString();
        else
            monthString = gregorian.month.toString();
        dateString = gregorian.year.toString() + "-" + monthString + "-" + dayString;

        if (prevDate == dateString) {
            visualize(CalipsoData, dateString, gregorian);
            return;
        }

        prevEId = -1;
        viewer.entities.removeAll();
        readJSON(dateString, function(responseText) {
            CalipsoData = JSON.parse(responseText);
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
