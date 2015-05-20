var provider = new Cesium.WebMapTileServiceImageryProvider({
    url: "//map1.vis.earthdata.nasa.gov/wmts-webmerc/wmts.cgi?TIME=2015-03-22",
    layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
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
console.log(CalipsoData["0"].curtains.length);
for(var m = 0; m < CalipsoData["0"].curtains.length; m++) {
    for (var i = 0; i < CalipsoData["0"].curtains[m].sections.length; i++) {
        var coords = CalipsoData["0"].curtains[m].sections[i].coordinates;
        var maxHts = new Array(coords.length / 2);
        for (var j = 0; j < (coords.length / 2); j++) {
            maxHts[j] = 2000000;
        }

        viewer.entities.add({
            name: 'CALIPSO Data Curtain',
	    description: "Date : "+ CalipsoData["0"].date +"<br>Orbit : "+CalipsoData["0"].curtains[m].orbit+"<br>Time (UTC) : "+CalipsoData["0"].curtains[m].utc_time,
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArray(coords),
                maximumHeights: maxHts,
                material: CalipsoData["0"].curtains[m].sections[i].img,
                show: true
            }
        });
    }

}
}
/*
var scene = viewer.scene;




      
var CALIPSOdata1 = viewer.entities.add({
    name : 'CALIPSO Data 1',
    id : '1',
    wall : {
           positions : Cesium.Cartesian3.fromDegreesArray(CalipsoData["1"].coordinates),


        maximumHeights : [ 2000000,2000000, 2000000, 2000000,2000000,2000000, 2000000,2000000,2000000],
        material : CalipsoData["1"].img,
        show: true
    }
});

var CALIPSOdata2 = viewer.entities.add({
    name : 'CALIPSO Data 2',
    id : '2',
    wall : {
           positions : Cesium.Cartesian3.fromDegreesArray(CalipsoData["2"].coordinates),


        maximumHeights : [ 2000000,2000000, 2000000, 2000000,2000000,2000000, 2000000,2000000,2000000],
        material : CalipsoData["2"].img,
        show: true

    }
});

    var entity = viewer.entities.add({
        label : {
            show : false
        }
    });


var ellipsoid = scene.globe.ellipsoid;
     handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(movement) {
        var cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text = '(' + longitudeString + ', ' + latitudeString + ')';
            //Logic to decide which Lidar Profile to show
            var dist0 = Math.acos(Math.sin(latitudeString) * Math.sin(CalipsoData["0"].coordinates[0]) + Math.cos(latitudeString) * Math.cos(CalipsoData["0"].coordinates[0]) * Math.cos(Math.abs(longitudeString - CalipsoData["0"].coordinates[1]))) * 6371;
            var dist1 = Math.acos(Math.sin(latitudeString) * Math.sin(CalipsoData["1"].coordinates[0]) + Math.cos(latitudeString) * Math.cos(CalipsoData["1"].coordinates[0]) * Math.cos(Math.abs(longitudeString - CalipsoData["1"].coordinates[1]))) * 6371;
            var dist2 = Math.acos(Math.sin(latitudeString) * Math.sin(CalipsoData["2"].coordinates[0]) + Math.cos(latitudeString) * Math.cos(CalipsoData["2"].coordinates[0]) * Math.cos(Math.abs(longitudeString - CalipsoData["2"].coordinates[1]))) * 6371;
            var minDist = Math.min(dist0,dist1,dist2);
            console.log("Min. Distance = "+minDist+"km.");
            if(minDist == dist0){
                CALIPSOdata0.wall.show = true;
                viewer.zoomTo(CALIPSOdata0);
                CALIPSOdata1.wall.show = false;
                CALIPSOdata2.wall.show = false;
              }
            else if (minDist == dist1){
                CALIPSOdata1.wall.show = true;
                viewer.zoomTo(CALIPSOdata1);
                CALIPSOdata2.wall.show = false;
                CALIPSOdata0.wall.show = false;
              }
            else {
                CALIPSOdata2.wall.show = true;
                viewer.zoomTo(CALIPSOdata2);
                CALIPSOdata1.wall.show = false;
                CALIPSOdata0.wall.show = false;
              }


        } else {
            entity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);*/

