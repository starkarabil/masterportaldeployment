import Map from "ol/Map.js";
import {unByKey as unlistenByKey} from "ol/Observable.js";
import VectorLayer from "ol/layer/Vector.js";
import {Group as LayerGroup} from "ol/layer.js";
import VectorSource from "ol/source/Vector.js";
import {defaults as olDefaultInteractions} from "ol/interaction.js";
import MapView from "./mapView";
import ObliqueMap from "./obliqueMap";
import OLCesium from "olcs/OLCesium.js";
import VectorSynchronizer from "olcs/VectorSynchronizer.js";
import FixedOverlaySynchronizer from "../../plugins/FixedOverlaySynchronizer.js";
import WMSRasterSynchronizer from "../../plugins/WmsRasterSynchronizer.js";
import {transform, get} from "ol/proj.js";

const map = Backbone.Model.extend({
    defaults: {
        initalLoading: 0
    },

    initialize: function () {
        var channel = Radio.channel("Map"),
            mapViewSettings = Radio.request("Parser", "getPortalConfig").mapView,
            mapView = new MapView(mapViewSettings);

        this.listenTo(this, "change:initalLoading", this.initalLoadingChanged);

        channel.reply({
            "getLayers": this.getLayers,
            "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX,
            "createLayerIfNotExists": this.createLayerIfNotExists,
            "getSize": this.getSize,
            "getFeaturesAtPixel": this.getFeaturesAtPixel,
            "registerListener": this.registerListener,
            "getMap": function () {
                return this.get("map");
            },
            "isMap3d": this.isMap3d,
            "getMap3d": this.getMap3d,
            "getMapMode": this.getMapMode,
            "getFeatures3dAtPosition": this.getFeatures3dAtPosition
        }, this);

        channel.on({
            "addLayer": this.addLayer,
            "addLayerToIndex": this.addLayerToIndex,
            "addLayerOnTop": this.addLayerOnTop,
            "addLoadingLayer": this.addLoadingLayer,
            "addOverlay": this.addOverlay,
            "addInteraction": this.addInteraction,
            "addControl": this.addControl,
            "removeLayer": this.removeLayer,
            "removeLoadingLayer": this.removeLoadingLayer,
            "removeOverlay": this.removeOverlay,
            "removeInteraction": this.removeInteraction,
            "setBBox": this.setBBox,
            "render": this.render,
            "zoomToExtent": this.zoomToExtent,
            "zoomToFilteredFeatures": this.zoomToFilteredFeatures,
            "registerListener": this.registerListener,
            "unregisterListener": this.unregisterListener,
            "updateSize": function () {
                this.get("map").updateSize();
            },
            "setTime": this.setTime,
            "activateMap3d": this.activateMap3d,
            "deactivateMap3d": this.deactivateMap3d,
            "setCameraParameter": this.setCameraParameter
        }, this);

        this.listenTo(this, {
            "change:vectorLayer": function (model, value) {
                this.addLayerToIndex([value, 0]);
            }
        });

        this.set("view", mapView.get("view"));

        this.set("map", new Map({
            logo: null,
            target: "map",
            view: this.get("view"),
            controls: [],
            interactions: olDefaultInteractions({altShiftDragRotate: false, pinchRotate: false})
        }));
        if (Config.obliqueMap) {
            this.set("obliqueMap", new ObliqueMap({}));
        }
        Radio.trigger("ModelList", "addInitialyNeededModels");
        if (!_.isUndefined(Radio.request("ParametricURL", "getZoomToExtent"))) {
            this.zoomToExtent(Radio.request("ParametricURL", "getZoomToExtent"));
        }
        this.stopMouseMoveEvent();

        Radio.trigger("Map", "isReady", "gfi", false);
        if (Config.startingMap3D) {
            this.activateMap3d();
        }

        if (!_.isUndefined(Config.inputMap)) {
            this.registerListener("click", this.addMarker, this);
        }
    },

    /**
     * Funktion wird bei Vorhandensein des Config-Parameters "inputMap"
     * als Event-Listener registriert und setzt bei Mausklick immer und
     * ohne Aktivierung einen Map-Marker an die geklickte Stelle. Triggert
     * dar??ber hinaus das RemoteInterface mit den Marker-Koordinaten.
     *
     * @param  {event} event - Das MapBrowserPointerEvent
     * @returns {void}
     */
    addMarker: function (event) {
        var coords = event.coordinate;

        // Set the marker on the map.
        Radio.trigger("MapMarker", "showMarker", coords);

        // If the marker should be centered, center the map around it.
        if (!_.isUndefined(Config.inputMap.setCenter) && Config.inputMap.setCenter) {
            Radio.trigger("MapView", "setCenter", coords);
        }

        // Should the coordinates get transformed to another coordinate system for broadcast?
        if (!_.isUndefined(Config.inputMap.targetProjection)) {
            coords = Radio.request("CRS", "transformFromMapProjection", Config.inputMap.targetProjection, coords);
        }

        // Broadcast the coordinates clicked in the desired coordinate system.
        Radio.trigger("RemoteInterface", "postMessage", {"setMarker": coords});
    },

    /**
    * Findet einen Layer ??ber seinen Namen und gibt ihn zur??ck
    * @param  {string} layerName - Name des Layers
    * @return {ol.layer} - found layer
    */
    getLayerByName: function (layerName) {
        var layers = this.get("map").getLayers().getArray();

        return _.find(layers, function (layer) {
            return layer.get("name") === layerName;
        });
    },

    setVectorLayer: function (value) {
        this.set("vectorLayer", value);
    },

    getLayers: function () {
        return this.get("map").getLayers();
    },

    render: function () {
        this.get("map").render();
    },

    setBBox: function (bbox) {
        this.set("bbox", bbox);
        this.bBoxToMap(this.get("bbox"));
    },
    bBoxToMap: function (bbox) {
        if (bbox) {
            this.get("view").fit(bbox, this.get("map").getSize());
        }
    },

    getWGS84MapSizeBBOX: function () {
        var bbox = this.get("view").calculateExtent(this.get("map").getSize()),
            firstCoord = [bbox[0], bbox[1]],
            secondCoord = [bbox[2], bbox[3]],
            firstCoordTransform = Radio.request("CRS", "transform", {fromCRS: "EPSG:25832", toCRS: "EPSG:4326", point: firstCoord}),
            secondCoordTransform = Radio.request("CRS", "transform", {fromCRS: "EPSG:25832", toCRS: "EPSG:4326", point: secondCoord});

        return [firstCoordTransform[0], firstCoordTransform[1], secondCoordTransform[0], secondCoordTransform[1]];
    },

    /**
    * Registriert Listener f??r bestimmte Events auf der Karte
    * Siehe http://openlayers.org/en/latest/apidoc/ol.Map.html
    * @param {String} event - Der Eventtyp
    * @param {Function} callback - Die Callback Funktion
    * @param {Object} context -
    * @returns {void}
    */
    registerListener: function (event, callback, context) {
        return this.get("map").on(event, callback, context);
    },

    /**
    * Meldet Listener auf bestimmte Events ab
    * @param {String | Object} event - Der Eventtyp oder ein Objekt welches als Key benutzt wird
    * @param {Function} callback - Die Callback Funktion
    * @param {Object} context -
    * @returns {void}
    */
    unregisterListener: function (event, callback, context) {
        if (typeof event === "string") {
            this.get("map").un(event, callback, context);
        }
        else {
            unlistenByKey(event);
        }
    },

    /**
    * R??ckgabe der Features an einer Pixelkoordinate
    * @param  {pixel} pixel    Pixelkoordinate
    * @param  {object} options layerDefinition und pixelTolerance
    * @return {features[]}     Array der Features
    */
    getFeaturesAtPixel: function (pixel, options) {
        return this.get("map").getFeaturesAtPixel(pixel, options);
    },

    getMapMode: function () {
        if (Radio.request("ObliqueMap", "isActive")) {
            return "Oblique";
        }
        else if (this.getMap3d() && this.getMap3d().getEnabled()) {
            return "3D";
        }
        return "2D";
    },
    isMap3d: function () {
        return this.getMap3d() && this.getMap3d().getEnabled();
    },
    createMap3d: function (shadowTimeFunction) {
        var map3d = new OLCesium({
            map: this.get("map"),
            time: shadowTimeFunction,
            sceneOptions: {
                shadows: true
            },
            stopOpenLayersEventsPropagation: true,
            createSynchronizers: function (olMap, scene) {
                return [new WMSRasterSynchronizer(olMap, scene), new VectorSynchronizer(olMap, scene), new FixedOverlaySynchronizer(olMap, scene)];
            }
        });

        return map3d;
    },
    returnTodaysCesiumDate: function () {
        if (this.time) {
            return this.time;
        }
        const date = Cesium.JulianDate.now(),
            timeStamp = Cesium.JulianDate.toGregorianDate(date);

        timeStamp.hour = 13; // UTC Standardtime +1
        timeStamp.minute = 0;
        timeStamp.second = 0;
        timeStamp.millisecond = 0;

        return Cesium.JulianDate.fromDate(new Date(timeStamp.year, timeStamp.month - 1, timeStamp.day, timeStamp.hour, timeStamp.minute, timeStamp.second, timeStamp.millisecond));
    },
    returnConfigCesiumDate: function () {
        const modifiedTime = Cesium.JulianDate.fromDate(new Date(Config.shadowTime.year, Config.shadowTime.month - 1, Config.shadowTime.day, Config.shadowTime.hour, Config.shadowTime.minute, Config.shadowTime.second, Config.shadowTime.millisecond));

        return modifiedTime;
    },
    setTime: function (time) {
        this.time = time;
    },
    handle3DEvents: function () {
        var eventHandler;

        if (window.Cesium) {
            eventHandler = new window.Cesium.ScreenSpaceEventHandler(this.getMap3d().getCesiumScene().canvas);
            eventHandler.setInputAction(this.reactTo3DClickEvent.bind(this), window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    },
    setCameraParameter: function (params) {
        var map3d = this.getMap3d(),
            camera;

        if (_.isUndefined(map3d) === false && _.isNull(params) === false) {
            camera = map3d.getCamera();
            if (_.has(params, "tilt")) {
                camera.setTilt(parseFloat(params.tilt));
            }
            if (_.has(params, "heading")) {
                camera.setHeading(parseFloat(params.heading));
            }
            if (_.has(params, "altitude")) {
                camera.setAltitude(parseFloat(params.altitude));
            }
        }
    },
    setCesiumSceneDefaults: function () {
        var params,
            scene = this.getMap3d().getCesiumScene();

        if (_.has(Config, "cesiumParameter")) {
            params = Config.cesiumParameter;
            if (_.has(params, "fog")) {
                scene.fog.enabled = _.has(params.fog, "enabled") ? params.fog.enabled : scene.fog.enabled;
                scene.fog.density = _.has(params.fog, "density") ? parseFloat(params.fog.density) : scene.fog.density;
                scene.fog.screenSpaceErrorFactor = _.has(params.fog, "screenSpaceErrorFactor") ? parseFloat(params.fog.screenSpaceErrorFactor) : scene.fog.screenSpaceErrorFactor;
            }

            scene.globe.tileCacheSize = _.has(params, "tileCacheSize") ? parseInt(params.tileCacheSize, 10) : scene.globe.tileCacheSize;
            scene.globe.maximumScreenSpaceError = _.has(params, "maximumScreenSpaceError") ? params.maximumScreenSpaceError : scene.globe.maximumScreenSpaceError;
            scene.fxaa = _.has(params, "fxaa") ? params.fxaa : scene.fxaa;
            scene.globe.enableLighting = _.has(params, "enableLighting") ? params.enableLighting : scene.globe.enableLighting;
        }
        return scene;
    },
    activateMap3d: function () {
        var camera,
            shadowTimeFunction = _.has(Config, "shadowTime") ? this.returnConfigCesiumDate : this.returnTodaysCesiumDate,
            cameraParameter = _.has(Config, "cameraParameter") ? Config.cameraParameter : null;

        if (!this.getMap3d()) {
            this.setMap3d(this.createMap3d(shadowTimeFunction));
            this.handle3DEvents();
            this.setCesiumSceneDefaults();
            this.setCameraParameter(cameraParameter);
            camera = this.getMap3d().getCesiumScene().camera;
            camera.changed.addEventListener(this.reactToCameraChanged, this);
        }
        this.getMap3d().setEnabled(true);
        Radio.trigger("Map", "change", "3D");
    },

    getFeatures3dAtPosition: function (position) {
        var scene,
            objects;

        if (this.getMap3d()) {
            scene = this.getMap3d().getCesiumScene();
            objects = scene.drillPick(position);
        }
        return objects;
    },

    reactTo3DClickEvent: function (event) {
        var map3d = this.getMap3d(),
            scene = map3d.getCesiumScene(),
            ray = scene.camera.getPickRay(event.position),
            cartesian = scene.globe.pick(ray, scene),
            height,
            coords,
            cartographic,
            distance,
            resolution,
            mapProjection = Radio.request("MapView", "getProjection"),
            transformedCoords,
            transformedPickedPosition,
            pickedPositionCartesian,
            cartographicPickedPosition;

        if (cartesian) {
            cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            coords = [window.Cesium.Math.toDegrees(cartographic.longitude), window.Cesium.Math.toDegrees(cartographic.latitude)];
            height = scene.globe.getHeight(cartographic);
            if (height) {
                coords = coords.concat([height]);
            }

            distance = window.Cesium.Cartesian3.distance(cartesian, scene.camera.position);
            resolution = map3d.getCamera().calcResolutionForDistance(distance, cartographic.latitude);
            transformedCoords = transform(coords, get("EPSG:4326"), mapProjection);
            transformedPickedPosition = null;

            if (scene.pickPositionSupported) {
                pickedPositionCartesian = scene.pickPosition(event.position);
                if (pickedPositionCartesian) {
                    cartographicPickedPosition = scene.globe.ellipsoid.cartesianToCartographic(pickedPositionCartesian);
                    transformedPickedPosition = transform([window.Cesium.Math.toDegrees(cartographicPickedPosition.longitude), window.Cesium.Math.toDegrees(cartographicPickedPosition.latitude)], get("EPSG:4326"), mapProjection);
                    transformedPickedPosition.push(cartographicPickedPosition.height);
                }
            }
            Radio.trigger("Map", "clickedWindowPosition", {position: event.position, pickedPosition: transformedPickedPosition, coordinate: transformedCoords, latitude: coords[0], longitude: coords[1], resolution: resolution, originalEvent: event, map: this.get("map")});
        }
    },
    deactivateMap3d: function () {
        var resolution,
            resolutions;

        if (this.getMap3d()) {
            this.get("view").animate({rotation: 0}, function () {
                this.getMap3d().setEnabled(false);
                this.get("view").setRotation(0);
                resolution = this.get("view").getResolution();
                resolutions = this.get("view").getResolutions();
                if (resolution > resolutions[0]) {
                    this.get("view").setResolution(resolutions[0]);
                }
                if (resolution < resolutions[resolutions.length - 1]) {
                    this.get("view").setResolution(resolutions[resolutions.length - 1]);
                }
                Radio.trigger("Map", "change", "2D");
            }.bind(this));
        }
    },

    setMap3d: function (map3d) {
        return this.set("map3d", map3d);
    },

    getMap3d: function () {
        return this.get("map3d");
    },

    reactToCameraChanged: function () {
        var camera = this.getMap3d().getCamera();

        Radio.trigger("Map", "cameraChanged", {"heading": camera.getHeading(), "altitude": camera.getAltitude(), "tilt": camera.getTilt()});
    },
    addInteraction: function (interaction) {
        this.get("map").addInteraction(interaction);
    },
    removeInteraction: function (interaction) {
        this.get("map").removeInteraction(interaction);
    },

    addOverlay: function (overlay) {
        this.get("map").addOverlay(overlay);
    },

    removeOverlay: function (overlay) {
        this.get("map").removeOverlay(overlay);
    },

    addControl: function (control) {
        this.get("map").addControl(control);
    },
    removeControl: function (control) {
        this.get("map").removeControl(control);
    },
    /**
    * Layer-Handling
    * @param {ol/layer} layer -
    * @returns {void}
    */
    addLayer: function (layer) {
        var layerList,
            firstVectorLayer,
            index;

        // Alle Layer
        layerList = this.get("map").getLayers().getArray();
        // der erste Vectorlayer in der Liste
        firstVectorLayer = _.find(layerList, function (veclayer) {
            return veclayer instanceof VectorLayer;
        });
        // Index vom ersten VectorLayer in der Layerlist
        index = _.indexOf(layerList, firstVectorLayer);
        if (index !== -1 && _.has(firstVectorLayer, "id") === false) {
            // F??ge den Layer vor dem ersten Vectorlayer hinzu. --> damit bleiben die Vectorlayer(Messen, Zeichnen,...) immer oben auf der Karte
            this.get("map").getLayers().insertAt(index, layer);
        }
        else {
            this.get("map").getLayers().push(layer);
        }
    },

    /**
     * put the layer on top of the map
     * @param {ol/layer} layer to be placed on top of the map
     * @returns {void}
     */
    addLayerOnTop: function (layer) {
        this.get("map").getLayers().push(layer);
    },

    removeLayer: function (layer) {
        this.get("map").removeLayer(layer);
    },

    /**
    * Bewegt den Layer auf der Karte an die vorhergesehene Position
    * @param {Array} args - [0] = Layer, [1] = Index
    * @returns {void}
    */
    addLayerToIndex: function (args) {
        var layer = args[0],
            index = args[1],
            channel = Radio.channel("Map"),
            layersCollection = this.get("map").getLayers();

        layersCollection.remove(layer);
        layersCollection.insertAt(index, layer);
        this.setImportDrawMeasureLayersOnTop(layersCollection);

        // Laden des Layers ??berwachen
        if (layer instanceof LayerGroup) {
            layer.getLayers().forEach(function (singleLayer) {
                singleLayer.getSource().on("wmsloadend", channel.trigger("removeLoadingLayer"), this);
                singleLayer.getSource().on("wmsloadstart", channel.trigger("addLoadingLayer"), this);
            });
        }
        else {
            layer.getSource().on("wmsloadend", channel.trigger("removeLoadingLayer"), this);
            layer.getSource().on("wmsloadstart", channel.trigger("addLoadingLayer"), this);
        }
    },

    // verschiebt die layer nach oben, die alwaysOnTop=true haben (measure, import/draw)
    setImportDrawMeasureLayersOnTop: function (layers) {
        var layersOnTop = layers.getArray().filter(function (layer) {
            return layer.get("alwaysOnTop") === true;
        });

        _.each(layersOnTop, function (layer) {
            layers.remove(layer);
            layers.push(layer);
        });
    },

    zoomToExtent: function (extent, options) {
        this.get("view").fit(extent, this.get("map").getSize(), options);
    },

    zoomToFilteredFeatures: function (ids, layerId) {
        var extent,
            features,
            layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId, type: "layer"}),
            layerFeatures = [],
            olLayer = layer.get("layer");

        if (!_.isUndefined(layer) && olLayer instanceof LayerGroup) {
            olLayer.getLayers().forEach(function (child) {
                layerFeatures = child.getSource().getFeatures();
            });
        }
        else if (!_.isUndefined(layer) && !_.isUndefined(olLayer.getSource())) {
            layerFeatures = olLayer.getSource().getFeatures();
        }

        features = layerFeatures.filter(function (feature) {
            return _.contains(ids, feature.getId());
        });
        if (features.length > 0) {
            extent = this.calculateExtent(features);
            this.zoomToExtent(extent);
        }
    },
    calculateExtent: function (features) {
        // extent = [xMin, yMin, xMax, yMax]
        var extent = [9999999, 9999999, 0, 0];

        _.each(features, function (feature) {
            var featureExtent = feature.getGeometry().getExtent();

            if (feature.getId() === "APP_STAATLICHE_SCHULEN_4099") {
                return;
            }
            extent[0] = featureExtent[0] < extent[0] ? featureExtent[0] : extent[0];
            extent[1] = featureExtent[1] < extent[1] ? featureExtent[1] : extent[1];
            extent[2] = featureExtent[2] > extent[2] ? featureExtent[2] : extent[2];
            extent[3] = featureExtent[3] > extent[3] ? featureExtent[3] : extent[3];
        });
        return extent;
    },
    /**
    * Gibt die Gr????e in Pixel der Karte zur??ck.
    * @return {ol.Size} - Ein Array mit zwei Zahlen [width, height]
    */
    getSize: function () {
        return this.get("map").getSize();
    },

    addLoadingLayer: function () {
        this.set("initalLoading", this.get("initalLoading") + 1);
    },
    removeLoadingLayer: function () {
        this.set("initalLoading", this.get("initalLoading") - 1);
    },
    /**
    * Initiales Laden. "initalLoading" wird layer??bergreifend hochgez??hlt, wenn mehrere Tiles abgefragt werden und wieder heruntergez??hlt, wenn die Tiles geladen wurden.
    * Listener wird anschlie??end gestoppt, damit nur beim initialen Laden der Loader angezeigt wird - nicht bei zoom/pan
    * @returns {void}
    */
    initalLoadingChanged: function () {
        var num = this.get("initalLoading");

        if (num > 0) {
            Radio.trigger("Util", "showLoader");
        }
        else if (num === 0) {
            Radio.trigger("Util", "hideLoader");
            this.stopListening(this, "change:initalLoading");
        }
    },
    // Pr??ft ob der Layer mit dem Namen "Name" schon existiert und verwendet ihn, wenn nicht, erstellt er neuen Layer
    createLayerIfNotExists: function (name) {
        var layers = this.getLayers(),
            found = false,
            layer,
            source,
            resultLayer = {};

        _.each(layers.getArray(), function (ollayer) {
            if (ollayer.get("name") === name) {
                found = true;
                resultLayer = ollayer;
            }
        }, this);

        if (!found) {
            source = new VectorSource();
            layer = new VectorLayer({
                name: name,
                source: source,
                alwaysOnTop: true
            });

            resultLayer = layer;
            Radio.trigger("Map", "addLayerToIndex", [layer, layers.getArray().length]);
        }
        return resultLayer;
    },
    /**
    * Der ol-overlaycontainer-stopevent Container stoppt nicht jedes Event.
    * Unter anderem das Mousemove Event. Das ??bernimmt diese Methode.
    * @see {@link https://github.com/openlayers/openlayers/issues/4953}
    * @returns {void}
    */
    stopMouseMoveEvent: function () {
        // Firefox & Safari.
        $(".ol-overlaycontainer-stopevent").on("mousemove", function (evt) {
            evt.stopPropagation();
        });
        $(".ol-overlaycontainer-stopevent").on("touchmove", function (evt) {
            evt.stopPropagation();
        });
        $(".ol-overlaycontainer-stopevent").on("pointermove", function (evt) {
            evt.stopPropagation();
        });
    }
});

export default map;
