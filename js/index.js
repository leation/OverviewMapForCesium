var center = [114.3039106199148, 30.573918689442596];
var viewer = null;
var overviewCtr = null;

$(function () {
    $(document).ready(function () {
        initialGlobeView();
        initOverview();
        fly2ViewRange();

        $("#btnCircleFlight").click(function(){
            startCircleFlight();
        });
    });

    function initialGlobeView() {
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NjRjNGFjNy1jNDM3LTQzMTktODVlYS05YmFmOTAxYjk5MWUiLCJpZCI6Mzk5MSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTUzOTU3OTE2NX0.-25udUzENRJ66mnICMK8Hfc6xgF_VP7P4sWkSHaUjOQ';
        var terrainProvider = Cesium.createWorldTerrain({
            requestWaterMask: true,
            requestVertexNormals: true
        });
        var image_Source = new Cesium.UrlTemplateImageryProvider({
            url: 'http://mt0.google.cn/vt/lyrs=t,r&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
            credit: ''
        });
        viewer = new Cesium.Viewer('cesiumContainer', {
            geocoder: false,
            homeButton: true,
            sceneModePicker: true,
            fullscreenButton: true,
            vrButton: true,
            baseLayerPicker: false,
            infoBox: false,
            selectionIndicator: true,
            animation: false,
            timeline: false,
            shouldAnimate: true,
            navigationHelpButton: true,
            navigationInstructionsInitiallyVisible: false,
            mapProjection: new Cesium.WebMercatorProjection(),
            imageryProvider: image_Source,
            terrainProvider: terrainProvider
        });
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.globe.showGroundAtmosphere = false;
    }

    function initOverview() {
        var url =
            "http://mt0.google.cn/vt/lyrs=t,r&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}";
        var layer = new L.TileLayer(url, {
            minZoom: 0,
            maxZoom: 20
        });
        var container = document.getElementById("overview");
        var options = {
            container: container,
            toggleDisplay: true,
            width: 150,
            height: 150,
            position: "topright",
            aimingRectOptions: {
                color: "#ff1100",
                weight: 3
            },
            shadowRectOptions: {
                color: "#0000AA",
                weight: 1,
                opacity: 0,
                fillOpacity: 0
            }
        };
        overviewCtr = new CesiumOverviewMapControl(viewer, layer, options);
    }

    function fly2ViewRange() {
        var item = {
            "longitude": 114.3039106199148,
            "latitude": 30.573918689442596,
            "height": 17323,
            "heading": 0.0915490610111922,
            "pitch": -1.5706884956561376,
            "roll": 0
        };
        if (!Cesium.defined(item.longitude) || !Cesium.defined(item.latitude)) {
            return;
        }
        if (!Cesium.defined(item.height)) {
            item.height = 10000;
        }
        if (!Cesium.defined(item.heading)) {
            item.heading = Cesium.Math.toRadians(0.0);
        }
        if (!Cesium.defined(item.pitch)) {
            item.pitch = Cesium.Math.toRadians(-90.0);
        }
        if (!Cesium.defined(item.roll)) {
            item.roll = 0.0;
        }
        viewer.camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(
                item.longitude * 1.0,
                item.latitude * 1.0,
                item.height * 1.0
            ),
            duration: 2,
            orientation: {
                heading: item.heading * 1.0,
                pitch: item.pitch * 1.0,
                roll: item.roll * 1.0
            }
        });
    }

    function startCircleFlight() {
        var distance = 15000;
        var seconds = 15;
        var lon = center[0];
        var lat = center[1];
        var position = new Cesium.Cartesian3.fromDegrees(lon, lat, 0);

        var pitch = Cesium.Math.toRadians(-45);
        var angle = 360 / seconds;

        var startTime = Cesium.JulianDate.fromDate(new Date());
        var stopTime = Cesium.JulianDate.addSeconds(startTime, seconds, new Cesium.JulianDate());
        viewer.clock.startTime = startTime.clone();  // 开始时间
        viewer.clock.stopTime = stopTime.clone();     // 结速时间
        viewer.clock.currentTime = startTime.clone(); // 当前时间
        viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
        viewer.clock.shouldAnimate = true;

        var startHeading = viewer.camera.heading;
        var timeExecution = function TimeExecution() {
            var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
            var heading = Cesium.Math.toRadians(delTime * angle) + startHeading;
            viewer.scene.camera.setView({
                destination: position,
                orientation: {
                    heading: heading,
                    pitch: pitch
                }
            });
            viewer.scene.camera.moveBackward(distance);
            if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
                viewer.clock.onTick.removeEventListener(timeExecution);
            }
            if (overviewCtr) {
                overviewCtr.updateAimingRect();
            }
        };
        viewer.clock.onTick.addEventListener(timeExecution);
    }
});