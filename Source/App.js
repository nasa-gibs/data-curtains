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

var CalipsoData, tempEntity, dateString, eId;
var scene = viewer.scene;
var ellipsoid = scene.globe.ellipsoid;
handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

function readJSON(callback) {
    var xhttpObj = new XMLHttpRequest();
    xhttpObj.overrideMimeType("application/json");
    xhttpObj.open('GET', 'data/metadata.json', true);
    xhttpObj.onreadystatechange = function() {
        if (xhttpObj.readyState == 4 && xhttpObj.status == "200") {
            callback(xhttpObj.responseText);
        }
    };
    xhttpObj.send(null);
}

readJSON(function(responseText) {
    //Read metadata.json
    CalipsoData = JSON.parse(responseText);
    //Set the Clock to Jan 01, 2015
    viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2015-01-01"),
        viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2015-01-02"),
        viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2015-01-05"),
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP,
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER


    //Update the Timeline to the Clock
    viewer.timeline.updateFromClock();
    viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);

    //Get the default Date (Jan 01, 2015) in the required format
    var gregorian = Cesium.JulianDate.toGregorianDate(viewer.clock.currentTime);
    dateString = gregorian.year.toString() + "-" + (gregorian.month).toString() + "-" + gregorian.day.toString();

    //Time Not Set initially
    var time = -1;
    //Generate the markers from the JSON
    visualize(dateString, time);

});


function visualize(dateString, time) {

    console.log("In Vis");

    var trackColor, dateIndex = 0;


    //Set the dateIndex to access the meta-data corresponding to the selected date
    for (var i = 0; i < CalipsoData.length; i++) {

        if (CalipsoData[i].date == dateString) {
            dateIndex = i;
            break;
        } else {
            dateIndex = -1;
        }


    }
    console.log("Date Index = " + dateIndex);
    //Data of selected date unavailable
    if (dateIndex == -1) {
        return;
    }
    viewer.entities.removeAll();
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
                maxHts[j] = 250000;
            }

            if (isMarkerTime(time, CalipsoData[dateIndex].curtains[m].sections[i].start_time, CalipsoData[dateIndex].curtains[m].sections[i].end_time)) {
                console.log("Matched Time");
                eId = 'D' + dateIndex + 'C' + m + 'S' + i;
            }

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
    if (typeof eId !== 'undefined') {
        var hts = viewer.entities.getById(eId).wall.maximumHeights._value;
        for (var x = 0; x < hts.length; x++)
            hts[x] = 700000;
        viewer.entities.getById(eId).wall.maximumHeights = hts;
        if (viewer.entities.getById(eId).wall.material._color._value.red == 1) {
            viewer.entities.getById(eId).wall.material = Cesium.Color.YELLOW;
        } else {
            viewer.entities.getById(eId).wall.material = Cesium.Color.GREEN;
        }

    }
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
    if (Cesium.defined(picked)) {
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
            } else { // It is a Data Curtain, display Marker --Toggle
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(coords.length / 2);
                for (var j = 0; j < (coords.length / 2); j++) {
                    maxHts[j] = 250000;
                }

                if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Day-Time") {
                    trackColor = Cesium.Color.RED;
                } else {
                    trackColor = Cesium.Color.BLUE;
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



function pickEntityHover(viewer, windowPosition) {
    var picked = viewer.scene.pick(windowPosition);
    var indices;
    if (Cesium.defined(picked)) {
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
    if (typeof tempEntity !== 'undefined') {
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
        //console.log(gregorian);
        dateString = gregorian.year.toString() + "-" + (gregorian.month).toString() + "-" + gregorian.day.toString();
        viewer.entities.removeAll();
        setTimeout(function() {
            visualize(dateString, gregorian);
        }, 5);

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
