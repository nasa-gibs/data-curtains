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

var CalipsoData;

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
    CalipsoData = JSON.parse(responseText);
    viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2015-01-01"),
        viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2015-01-02"),
        viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2015-01-05"),
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP,
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER



    viewer.timeline.updateFromClock();
    viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);

    var gregorian = Cesium.JulianDate.toGregorianDate(viewer.clock.currentTime);
    dateString = gregorian.year.toString() + "-" + (gregorian.month).toString() + "-" + gregorian.day.toString();
    //console.log(dateString);

    visualize(dateString);

});


function visualize(dateString) {
    var trackColor, dateIndex = 0;
    viewer.entities.removeAll();
    console.log("In Visualize");

    //  console.log(CalipsoData.length);

    for (var i = 0; i < CalipsoData.length; i++) {
        //console.log(CalipsoData[i].date);
        //console.log(dateString);
        if (CalipsoData[i].date == dateString) {
            dateIndex = i;
            console.log("dateIndex is set to");
            console.log(dateIndex);
            break;
        } else {
            dateIndex = -1;
        }

    }
    //Data of selected date unavailable
    if (dateIndex == -1) {
        return;
    }

    for (var m = 0; m < CalipsoData[dateIndex].curtains.length; m++) {

        if (CalipsoData[dateIndex].curtains[m].orbit == "Day-Time") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }

        for (var i = 0; i < CalipsoData[dateIndex].curtains[m].sections.length; i++) {
            var coords = CalipsoData[dateIndex].curtains[m].sections[i].coordinates;
            var maxHts = new Array(coords.length / 2);
            for (var j = 0; j < (coords.length / 2); j++) {
                maxHts[j] = 500000;
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

    //Code for highlighting markers and datacurtains on hover


    console.log("Visualization Done!");
}

function pickEntityClick(viewer, windowPosition) {
    var picked = viewer.scene.pick(windowPosition);
    if (Cesium.defined(picked)) {
        var entityInstance = Cesium.defaultValue(picked.id, picked.primitive.id);
        if (entityInstance instanceof Cesium.Entity) {
            // console.log(entityInstance.id);
            var numberPattern = /\d+/g;
            var indices = entityInstance.id.match(numberPattern);

            if (entityInstance.wall.outline._value == true) {
                //Display Data Curtains
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(coords.length / 2);
                for (var j = 0; j < (coords.length / 2); j++) {
                    maxHts[j] = 2000000;
                }

                entityInstance.wall.outline = false;
                //entityInstance.wall.outlineWidth = 3.0;
                entityInstance.wall.maximumHeights = maxHts;
                entityInstance.wall.material = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].img;
            } else {
                //Display Section Marker -- Toggle
                var coords = CalipsoData[indices[0]].curtains[indices[1]].sections[indices[2]].coordinates;
                var maxHts = new Array(coords.length / 2);
                for (var j = 0; j < (coords.length / 2); j++) {
                    maxHts[j] = 500000;
                }

                if (CalipsoData[indices[0]].curtains[indices[1]].orbit == "Day-Time") {
                    trackColor = Cesium.Color.RED;
                } else {
                    trackColor = Cesium.Color.BLUE;
                }
                entityInstance.wall.maximumHeights = maxHts;
                entityInstance.wall.outline = true;
                entityInstance.wall.outlineWidth = 1.0;
                entityInstance.wall.material = trackColor;
            }
        }
    } else {
        console.log("undefined");
    }
};

var tempEntity;


function pickEntityHover(viewer, windowPosition) {
    var picked = viewer.scene.pick(windowPosition);
    var indices;
    if (Cesium.defined(picked)) {
        if (tempEntity) {
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
                console.log("Data Curtain Hovered on");
                // entityInstance.wall.material = Cesium.Color.WHITE;
            }
        }
    } else {

        clearOnHoverOver(tempEntity);

    }
};

function clearOnHoverOver(tempEntity) {
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

var scene = viewer.scene;

var ellipsoid = scene.globe.ellipsoid;
handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
handler.setInputAction(function(movement) {
    //console.log(curtain_entities);
    pickEntityClick(viewer, movement.position);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//Event Handler for Hover
handler.setInputAction(function(movement) {
    //console.log(curtain_entities);
    pickEntityHover(viewer, movement.endPosition);
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



var dateString;

function handleSetTime(e) {
    if (Cesium.defined(viewer.timeline)) {
        var julianDate = e.timeJulian;
	console.log(julianDate);
        var gregorian = Cesium.JulianDate.toGregorianDate(julianDate);
        dateString = gregorian.year.toString() + "-" + (gregorian.month).toString() + "-" + gregorian.day.toString();
        console.log("Date set on the timeline to");
        console.log(dateString);
        visualize(dateString);
    }
}

viewer.timeline.addEventListener('settime', handleSetTime, false);
