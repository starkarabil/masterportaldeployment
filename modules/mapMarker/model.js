define([
        "openlayers",
    "eventbus",

    "config",
    "modules/core/util"
    ], function (ol, EventBus, Config, Util) {
    "use strict";
    var MapHandlerModel = Backbone.Model.extend({
        defaults: {
            marker: new ol.Overlay({
                positioning: "bottom-center",
                stopEvent: false
            }),
            wkt: "",
            markers: [],
            source: new ol.source.Vector(),
            zoomLevel: 7,
            zoomLevelStreet: 4
        },
        initialize: function () {
            var searchConf = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr;

//            this.set("layer", new ol.layer.Vector({
//                source: this.get("source")
//            }));
//            EventBus.trigger("addLayer", this.get("layer"));
            Radio.trigger("Map", "addOverlay", this.get("marker"));
            this.listenTo(EventBus, {
                "layerlist:sendVisiblelayerList": this.checkLayer
            });

            if (_.has(searchConf, "zoomLevel")) {
                this.set("zoomLevel", searchConf.zoomLevel);
            }
            if (_.has(searchConf, "zoomLevelStreet")) {
                this.set("zoomLevelStreet", searchConf.zoomLevelStreet);
            }
        },

        getExtentFromString: function () {
            var format = new ol.format.WKT(),
                feature = format.readFeature(this.get("wkt")),
                extent = feature.getGeometry().getExtent();

            return extent;
        },

        /**
        * @description Hilsfunktion zum ermitteln eines Features mit textueller Beschreibung
        */
        getWKTFromString: function (type, geom) {
            var wkt,
                split,
                regExp;

            if (type === "POLYGON") {
                split = geom.split(" ");

                wkt = type + "((";
            _.each(split, function (element, index, list) {
                if (index % 2 === 0) {
                    wkt += element + " ";
                }
                else if (index === list.length - 1) {
                    wkt += element + "))";
                }
                else {
                    wkt += element + ", ";
                }
            });
            }
            else if (type === "POINT") {
                wkt;

                wkt = type + "(";
                wkt += geom[0] + " " + geom[1];
                wkt += ")";
            }
            else if (type === "MULTIPOLYGON") {
                wkt = type + "(((";
                _.each(geom, function (element, index) {
                    split = geom[index].split(" ");

                    _.each(split, function (element, index, list) {
                        if (index % 2 === 0) {
                            wkt += element + " ";
                        }
                        else if (index === list.length - 1) {
                            wkt += element + "))";
                        }
                        else {
                            wkt += element + ", ";
                        }
                    });
                    if (index === geom.length - 1) {
                        wkt += ")";
                    }
                    else {
                        wkt += ",((";
                    }
                });
                regExp = new RegExp(", \\)\\?\\(", "g");

                wkt = wkt.replace(regExp, "),(");
            }
            this.set("wkt", wkt);

            return wkt;
        },

        // frägt das model in zoomtofeatures ab und bekommt ein Array mit allen Centerpoints der BBOX pro Feature
        askForMarkers: function () {
            var centers,
                id,
                marker,
                imglink,
                markers;

            if (_.has(Config, "zoomtofeature")) {
                centers = Radio.request("zoomtofeature", "getCenterList"),
                    imglink = Config.zoomtofeature.imglink;

                _.each(centers, function (center, i) {
                    id = "featureMarker" + i;

                    // lokaler Pfad zum IMG-Ordner ist anders
                    $("#map").append("<div id=" + id + " class='featureMarker'><img src='" + Util.getPath(imglink) + "'></div>");

                    marker = new ol.Overlay({
                        id: id,
                        positioning: "bottom-center",
                        element: document.getElementById(id),
                        stopEvent: false
                    });

                    marker.setPosition(center);
                    markers = this.get("markers");

                    markers.push(marker);
                    this.set("markers", markers);
                    Radio.trigger("Map", "addOverlay", marker);

                }, this);
                EventBus.trigger("layerlist:getVisiblelayerList");
            }
        },
        checkLayer: function (layerlist) {
            var layer,
                markers;

            if (Config.zoomtofeature) {
                layer = _.find(layerlist, {id: Config.zoomtofeature.layerid});

                EventBus.trigger("mapMarker:getMarkers");
                markers = this.get("markers");

                _.each(markers, function (marker) {
                    if (layer === undefined) {
                        Radio.trigger("Map", "removeOverlay", marker);
                    }
                    else {
                        Radio.trigger("Map", "addOverlay", marker);
                    }
                });
            }
        }
    });

    return MapHandlerModel;
});
