var provider = new Cesium.WebMapTileServiceImageryProvider({
    url: "//map1.vis.earthdata.nasa.gov/wmts-webmerc/wmts.cgi?TIME=2015-03-22",
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
    timeline: false, // Only showing one day in this demo
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
    visualize();

});


function visualize() {

    var trackColor;

    for (var m = 0; m < CalipsoData["0"].curtains.length; m++) {

        if (CalipsoData["0"].curtains[m].orbit == "Day-Time") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }

        for (var i = 0; i < CalipsoData["0"].curtains[m].sections.length; i++) {
            var coords = CalipsoData["0"].curtains[m].sections[i].coordinates;
            var maxHts = new Array(coords.length / 2);
            for (var j = 0; j < (coords.length / 2); j++) {
                maxHts[j] = 500000;
            }



            viewer.entities.add({
                name: '532nm Total Attenuated Backscatter',
                id: 'C' + m + 'S' + i,
                description: "Date : " + CalipsoData["0"].date + "<br>Orbit : " + CalipsoData["0"].curtains[m].orbit + "<br>Start Time (UTC) :  " + CalipsoData["0"].curtains[m].sections[i].start_time + "<br>End Time (UTC) : " + CalipsoData["0"].curtains[m].sections[i].end_time,
                wall: {
                    positions: Cesium.Cartesian3.fromDegreesArray(coords),
                    maximumHeights: maxHts,
                    material: trackColor,
                    outline: true,
                    outlineColor: Cesium.Color.BLACK
                }
            });

        }

    }
}

function pickEntity(viewer, windowPosition) {
    var picked = viewer.scene.pick(windowPosition);
    if (Cesium.defined(picked)) {
        var entityInstance = Cesium.defaultValue(picked.id, picked.primitive.id);
        if (entityInstance instanceof Cesium.Entity) {
            console.log(entityInstance.id);
            var numberPattern = /\d+/g;
            var indices = entityInstance.id.match(numberPattern);

	   if(entityInstance.wall.outline._value == true){
	    //Display Data Curtains
            var coords = CalipsoData["0"].curtains[indices[0]].sections[indices[1]].coordinates;
            var maxHts = new Array(coords.length / 2);
            for (var j = 0; j < (coords.length / 2); j++) {
                maxHts[j] = 2000000;
            }
	    	
            entityInstance.wall.outline = false;
            entityInstance.wall.maximumHeights = maxHts;
            entityInstance.wall.material = CalipsoData["0"].curtains[indices[0]].sections[indices[1]].img;
	   } else {
	    //Display Section Marker -- Toggle
            var coords = CalipsoData["0"].curtains[indices[0]].sections[indices[1]].coordinates;
            var maxHts = new Array(coords.length / 2);
            for (var j = 0; j < (coords.length / 2); j++) {
                maxHts[j] = 500000;
            }

        if (CalipsoData["0"].curtains[indices[0]].orbit == "Day-Time") {
            trackColor = Cesium.Color.RED;
        } else {
            trackColor = Cesium.Color.BLUE;
        }
	    entityInstance.wall.maximumHeights = maxHts;
	    entityInstance.wall.outline = true;
	    entityInstance.wall.material = trackColor;
    	   }
        }
    } else {
        console.log("undefined");
    }
};

var scene = viewer.scene;

var ellipsoid = scene.globe.ellipsoid;
handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
handler.setInputAction(function(movement) {
    //console.log(curtain_entities);
    pickEntity(viewer, movement.position);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
