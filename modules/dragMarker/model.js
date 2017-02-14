define(function (require) {

    var Backbone = require("backbone"),
        ol = require("openlayers"),
        Radio = require("backbone.radio"),
        EventBus = require("eventbus"),
        DragMarkerModel;

    "use strict";
    DragMarkerModel = Backbone.Model.extend({
        defaults: {
            coordinate: [565754, 5933960], // Start-Koordinate
            cursor: "pointer",
            previousCursor: undefined,
            featureName: "DragMarkerPoint",
            dragMarkerLayer: new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [17, 40], // Anchor for marker_red_small.png
                        anchorXUnits: "pixels",
                        anchorYUnits: "pixels",
                        opacity: 0.7,
                        src: "../../components/lgv-config/img/marker_red_small.png"
                    })
                }),
                alwaysOnTop: true,
                visible: true
            }),
            dragInteraction: new ol.interaction.Pointer({
                handleDownEvent: function () {
                    return Radio.request("DragMarker", "handleDownEvent");
                },
                handleDragEvent: function (evt) {
                    Radio.trigger("DragMarker", "handleDragEvent", evt);
                },
                handleMoveEvent: function () {
                    Radio.trigger("DragMarker", "handleMoveEvent");
                },
                handleUpEvent: function () {
                    return Radio.request("DragMarker", "handleUpEvent");
                }
            }),
            dragMarkerFeature: null,
            featureAtPixel: "",
            sourceHH: null,
            url: "../mml/landesgrenze_hh.json",
            nearestAddress: null
        },

        initialize: function () {
            EventBus.on("searchbar:hit", this.searchbarhit, this);

            // Radio channel
            var channel = Radio.channel("DragMarker");

            channel.on({
                "handleDragEvent": this.handleDragEvent,
                "handleMoveEvent": this.handleMoveEvent,
                "setPosition": this.setPosition,
                "hide": this.hideMarker,
                "show": this.showMarker
            }, this);

            channel.reply({
                "handleDownEvent": this.handleDownEvent,
                "handleUpEvent": this.handleUpEvent,
                "getPosition": this.getPosition
            }, this);

            // external Radio channel
            Radio.on("ReverseGeocoder", "addressComputed", this.setNearestAddress, this);

            // internal Listeners
            this.listenTo(this, {"change:nearestAddress": this.newAddress});

            // Prepare Map
            Radio.trigger("Map", "addLayerToIndex", [this.get("dragMarkerLayer"), Radio.request("Map", "getLayers").getArray().length]);
            Radio.trigger("Map", "addInteraction", this.get("dragInteraction"));
            Radio.trigger("Map", "registerListener", "pointermove", this.featureAtPixel, this);

            // Set defaults
            this.setPosition(this.get("coordinate"));
            this.getBoundaryHH();
            this.checkInitialVisibility();
        },

        checkInitialVisibility: function () {
            var visible = Radio.request("Parser","getPortalConfig").mapMarkerModul.visible;

            if (visible === false) {
                this.hideMarker();
            }
            else {
                this.showMarker();
            }
        },
        getDragMarkerLayer: function () {
            return this.get("dragMarkerLayer");
        },

        showMarker: function () {
            this.getDragMarkerLayer().setVisible(true);
        },

        hideMarker: function () {
            this.getDragMarkerLayer().setVisible(false);
        },

        // liest die landesgrenze_hh.json ein und ruft dann parse auf
        getBoundaryHH: function () {
            this.fetch({
                url: this.get("url"),
                cache: false,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Landesgrenze kann nicht geladen werden!", kategorie: "alert-danger"});
                }
            });
        },

        parse: function (data) {
            this.getFeatureFromResponse(data);
        },

        // sets polygon of hamburg
        getFeatureFromResponse: function (data) {
            var vectorSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON()
                });

            vectorSource.addFeatures(vectorSource.getFormat().readFeatures(data));
            this.set("sourceHH", vectorSource);
        },

        // returns boolean isInside Hamburg
        isInsideHH: function (coord) {
            var featureAtCoord = this.get("sourceHH").getFeaturesAtCoordinate(coord),
                isInside = featureAtCoord.length > 0 ? true : false;

            return isInside;
        },

        // sets feature to specific coordiante without zooming
        setPosition: function (coordinate) {
            var pointFeature = new ol.Feature({
                name: this.get("featureName"),
                geometry: new ol.geom.Point(coordinate)
            });

            this.get("dragMarkerLayer").getSource().clear();
            this.get("dragMarkerLayer").getSource().addFeature(pointFeature);
            this.set("coordinate", coordinate);
            this.triggerNewCoordinate(coordinate);
        },

        // replies specific coordinate of feature
        getPosition: function () {
            return this.get("coordinate");
        },

        // receives new address from WPS
        setNearestAddress: function (response) {
            this.set("nearestAddress", response);
        },

        featureAtPixel: function (evt) {
            if (evt.dragging === true) {
                return;
            }
            var feature = evt.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });

            if (feature && feature.get("name") === this.get("featureName")) {
                this.set("featureAtPixel", feature);
            }
            else {
                this.set("featureAtPixel", null);
            }
        },

        // gets called when address gets selected
        searchbarhit: function (hit) {
            var coord = _.isArray(hit.coordinate) ? hit.coordinate : _.map(hit.coordinate.split(" "), function (t) {
                    return parseFloat(t);
                }),
                type = coord.length === 2 ? "point" : coord.length === 10 ? "bbox" : undefined,
                nestedArr = [];

            if (type === "point") {
                this.setPosition(coord);
                this.zoomTo(coord);
            }
            else if (type === "bbox") {
                _.each(coord, function (num, index, array) {
                    if (index % 2 === 0) {
                        nestedArr.push ([num, array[index + 1]]);
                    }
                });
                var geom = new ol.geom.LineString(nestedArr),
                    newCoord = ol.extent.getCenter(geom.getExtent());

                this.setPosition(newCoord);
                this.zoomTo(newCoord);
            }
        },

        // zoom auf Koordinate
        zoomTo: function (coord) {
            Radio.trigger("MapView", "setCenter", coord, 7);
        },

        // trigger new center coordinate
        triggerNewCoordinate: function () {
            Radio.trigger("ReverseGeocoder", "request", this.get("coordinate"));
        },

        // trigger newAddress gefunden. Kann auch Fehlerobjekt sein.
        newAddress: function () {
            Radio.trigger("DragMarker", "newAddress", this.get("nearestAddress"))
        },

        // INTERACTION EVENTS
        // start Event
        handleDownEvent: function () {
            var featureAtPixel = this.get("featureAtPixel");

            if (featureAtPixel) {
                this.set("coordinate", featureAtPixel.getGeometry().getCoordinates());
                this.set("dragMarkerFeature", featureAtPixel);
            }
            return !!featureAtPixel;
        },

        // calculates move-vector
        handleDragEvent: function (evt) {
            var evtCoordinate = evt.coordinate,
                isInside = this.isInsideHH(evtCoordinate);

            if (isInside) {
                this.set("coordinate", evtCoordinate);
                this.get("dragMarkerFeature").getGeometry().setCoordinates([evtCoordinate[0], evtCoordinate[1]]);
            }
        },

        // switch cursorstyles
        handleMoveEvent: function () {
            var featureAtPixel = this.get("featureAtPixel"),
                element = $("#map")[0],
                actualCursor = this.get("cursor"),
                prevCursor = this.get("previousCursor");

            if (featureAtPixel) {
                if (element.style.cursor !== actualCursor) {
                    this.set("previousCursor", element.style.cursor);
                    element.style.cursor = actualCursor;
                }
            }
            else if (prevCursor !== undefined) {
                element.style.cursor = prevCursor;
                this.set("previousCursor", undefined);
            }
        },

        // stop Event
        handleUpEvent: function () {
            this.triggerNewCoordinate();
            this.set("dragMarkerFeature", null);
            return false;
        }
    });

    return DragMarkerModel;
});
