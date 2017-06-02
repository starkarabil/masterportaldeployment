define(function (require) {
    require("bootstrap");

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        $ = require("jquery"),
        MouseHoverPopup;

    MouseHoverPopup = Backbone.Model.extend({
        defaults: {
            cursor: "pointer",
            previousCursor: undefined,
            // select interaction reagiert auf pointermove
            selectPointerMove: {},
            mouseHoverInfos: [],
            mhpresult: "",
            mhpcoordinates: [],
            oldSelection: "",
            GFIPopupVisibility: false,
            hoverLayer: {},
            zoom: 0,
            overlayStyle: new ol.style.Style ({
                image: new ol.style.Circle({
                        radius: 8,
                        fill: new ol.style.Fill({
                                color: "#005ca9"
                        }),
                        stroke: new ol.style.Stroke({
                                color: "#ffffff",
                                width: 2
                        }),
                        opacity: 0.5
                      })
                })
        },
        initialize: function () {
            var isViewMobile = Radio.request("Util", "isViewMobile");

            if (isViewMobile === false) {
                this.set("selectPointerMove", this.createInteraction());
            }
            // Radio channel
            var channel = Radio.channel("MouseHover");

            channel.on({
                "refreshMouseHoverInfos": this.getMouseHoverInfos
            }, this);
            channel.reply({
                "isHoverLayer": this.isHoverLayer,
                "hasHoverInfo": function () {
                    this.hasHoverInfo();
                }
            }, this);

            channel.on({
                "hoverByCoordinates": this.hoverByCoordinates,
                "resetStyle": this.resetStyle,
                "styleDeselGFI": this.styleDeselGFI
            }, this);

            // select interaction Listener
            if (isViewMobile === false) {
                this.get("selectPointerMove").on("select", this.checkForEachFeatureAtPixel, this);
                Radio.trigger("Map", "addInteraction", this.get("selectPointerMove"));
            }

            // Erzeuge Overlay
            $("#lgv-container").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");
            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));
            this.set("element", this.get("mhpOverlay").getElement());
            Radio.trigger("Map", "addOverlay", this.get("mhpOverlay"));

            // Lese MouseHover Definition aus config
            this.getMouseHoverInfos();

            // Listeners
            this.listenTo(Radio.channel("GFI"), {
                "isVisible": this.setGFIPopupVisibility
            }, this);

            this.listenTo(Radio.channel("Map"), {
                "changedExtent": this.normalStylesExceptGFI
            });
            this.listenTo(Radio.channel("MapView"), {
                "changedZoomLevel": function () {
                    this.setZoom(Radio.request("MapView", "getZoomLevel"));
                }
            }, this);
            this.setZoom(Radio.request("MapView", "getZoomLevel"));
        },
        createInteraction: function () {
            var context = this;

            return new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,
                multi: false,
                filter: function (feature, layer) {
                    return context.hasHoverInfo(feature, layer);
                },
                layers: function (ollayer) {
                    return context.isHoverLayer(ollayer);
                },
                hitTolerance: 2,
                style: this.hoverStyleFunction,
                context: this
            });
        },
        // Reply-Funktion: Meldet true, wenn Featureattribut mit MouseHoverInformation gefüllt ist. Sonst false.
        hasHoverInfo: function (olfeature, ollayer) {
            var mouseHoverInfos = this.get("mouseHoverInfos"),
                ollyerId = ollayer.get("id"),
                hoverLayer = _.find(mouseHoverInfos, function (info) {
                    return info.id === ollyerId;
                }),
                hoverAttribute = hoverLayer.mouseHoverField,
                isClusterFeature = ollayer.getSource() instanceof ol.source.Cluster,
                hasHoverValue;

            if (isClusterFeature) {
                hasHoverValue = _.some(olfeature.get("features"), function (feature) {
                    return feature.get(hoverAttribute) !== "";
                });
            }
            else {
                hasHoverValue = olfeature.get(hoverAttribute) !== "" ? true : false;
            }
            return hasHoverValue;
        },

        // Reply-Funktion: Meldet true, wenn Layer in Liste "mouseHoverInfos" enthalten ist. Sonst false.
        isHoverLayer: function (ollayer) {
            var mouseHoverInfos = this.get("mouseHoverInfos"),
                ollyerId = ollayer.get("id"),
                isHoverLayer = _.find(mouseHoverInfos, function (info) {
                    if (info.id === ollyerId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });

            return isHoverLayer;
        },

        /*
         * Erstellt eine Liste aller Vektorlayer mit Definition eines mouseHoverFields.
        */
        getMouseHoverInfos: function () {
            var wfsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"}),
                geoJsonLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON"}),
                vectorLayers = _.union(wfsLayers, geoJsonLayers),
                mouseHoverLayers = _.filter(vectorLayers, function (layer) {
                    return _.has(layer, "mouseHoverField") && layer.mouseHoverField !== "";
                }),
                mouseHoverInfos = _.map(mouseHoverLayers, function (layer) {
                    return _.pick(layer, "id", "mouseHoverField");
                });

            this.set("mouseHoverInfos", mouseHoverInfos);
        },

        setGFIPopupVisibility: function (value) {
            this.set("GFIPopupVisibility", value);
        },
        getGFIPopupVisibility: function () {
            return this.get("GFIPopupVisibility");
        },

        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.set("oldSelection", "");
            this.unset("mhpresult", {silent: true});
            $(this.get("element")).tooltip("destroy");
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            $(this.get("element")).tooltip("show");
        },

        // Setzt Cursor pointer, wenn Selektion vorliegt
        setCursor: function (features) {
            var element = $("#map")[0],
                actualCursor = this.get("cursor"),
                prevCursor = this.get("previousCursor");

            if (features.length > 0) {
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

        // Selected Features: Symbol anpassen
        styleSelectedFeatures: function (features, evt) {
            var zoom = this.getZoom(),
                layer;

            if (features.length > 0) {
                layer = evt.target.getLayer(features[0]);
                this.setHoverLayer(layer);
            }
            features.forEach(function (feature) {
                // bei ClusterFeatures
                this. styleSelFunc(feature, zoom, evt);
            }, this);
        },

        /**
         * Setzt den Style eines einzelnen Features/ClusterFeatures auf den hoverStyle.
         */
        styleSelFunc: function (feature, zoom, evt) {
            var hoverStyle;

            if (feature.get("features").length > 1) {
                hoverStyle = Radio.request("StyleList", "returnModelById", "mml_cluster_hover");
                feature.setStyle(hoverStyle.getHoverClusterStyle(feature));
                if (zoom === 9 && _.isUndefined(evt) === false) {
                    this.createCircle(feature);
                }
            }
            else {
                hoverStyle = Radio.request("StyleList", "returnModelById", "mml_hover");
                if (_.isUndefined(feature.getStyle()[0]) === false) {
                    feature.setStyle(hoverStyle.getHoverStyle());
                }
            }
        },

        // Deselected Features: Symbol zurücksetzen
        styleDeselectedFeatures: function (features) {
            features.forEach(function (feature) {
                    this.styleDeselFunc(feature);
            }, this);
        },

        /**
         * Setzt den Style eines einzelnen Features/ClusterFeatures zurück.
         */
        styleDeselFunc: function (feature) {
            var normalStyle,
                theme = Radio.request("GFI", "getTheme"),
                GFIfeatureId = theme ? theme.attributes.feature.get("mmlid") : null,
                featureId,
                filteredFeature;

            // bei ClusterFeatures
            if (feature.get("features").length > 1) {
                if (this.getGFIPopupVisibility() === false) {
                    normalStyle = Radio.request("StyleList", "returnModelById", "mml_cluster");
                    feature.setStyle(normalStyle.getSimpleStyle());
                }
                else {
                    filteredFeature = _.filter(feature.get("features"), function (subFeature) {
                        if (subFeature.get("mmlid") === GFIfeatureId) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    featureId = filteredFeature[0] ? filteredFeature[0].get("mmlid") : null;
                    if (GFIfeatureId !== featureId) {
                        normalStyle = Radio.request("StyleList", "returnModelById", "mml_cluster");
                        feature.setStyle(normalStyle.getSimpleStyle());
                    }
                }
            }
            else {
                if (_.isUndefined(feature.getStyle()[0]) === false) {
                    if (this.getGFIPopupVisibility() === false) {
                        normalStyle = Radio.request("StyleList", "returnModelById", "mml");
                        feature.setStyle(normalStyle.getSimpleStyle());
                    }
                    else {
                        featureId = feature.get("features")[0].get("mmlid");
                        if (_.isUndefined(GFIfeatureId) === false || _.isUndefined(featureId) === false) {
                            if (GFIfeatureId !== featureId) {
                                normalStyle = Radio.request("StyleList", "returnModelById", "mml");
                                feature.setStyle(normalStyle.getSimpleStyle());
                            }
                        }
                    }
                }
            }
        },

        /**
         * Setzt den Style eines GFI-Features zurück.
         */
        styleDeselGFI: function () {
            var normalStyle,
                clusterSource = _.size(this.getHoverLayer()) !== 0 ? this.getHoverLayer().getSource() : null,
                clusterFeatures = clusterSource ? clusterSource.getFeatures() : null,
                theme = Radio.request("GFI", "getTheme"),
                filteredFeature,
                GFIfeatureId = theme ? theme.attributes.feature.get("mmlid") : null,
                featureId,
                featureStyle;

            _.each(clusterFeatures, function (clusterFeature) {
                filteredFeature = _.filter(clusterFeature.get("features"), function (subFeature) {
                        if (subFeature.get("mmlid") === GFIfeatureId) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                featureId = filteredFeature[0] ? filteredFeature[0].get("mmlid") : null;

                if (GFIfeatureId === featureId) {
                    if (clusterFeature.get("features").length > 1) {
                        normalStyle = Radio.request("StyleList", "returnModelById", "mml_cluster");
                    }
                    else {
                        normalStyle = Radio.request("StyleList", "returnModelById", "mml");
                    }
                    // MML: special case for overlaying features on highest zoomlevel
                    if (clusterFeature.getStyle()) {
                        if (clusterFeature.getStyle().length === 1) {
                            featureStyle = clusterFeature.getStyle()[0].getImage();
                        }
                        else {
                            featureStyle = clusterFeature.getStyle().getImage();
                        }
                    }
                    // normal case
                    if (!(this.getZoom() === 9 && featureStyle instanceof ol.style.Circle)) {
                        clusterFeature.setStyle(normalStyle.getSimpleStyle());
                    }
                }
            }, this);
        },
        normalStylesExceptGFI: function () {
            var clusterSource = _.size(this.getHoverLayer()) !== 0 ? this.getHoverLayer().getSource() : null,
                clusterFeatures = clusterSource ? clusterSource.getFeatures() : null,
                theme = Radio.request("GFI", "getTheme"),
                GFIfeatureId = theme ? theme.attributes.feature.get("mmlid") : null,
                clusterFeatureId,
                filteredFeature,
                normalStyle,
                hoverStyle,
                featureStyle;

            if (this.getGFIPopupVisibility()) {
                _.each(clusterFeatures, function (clusterFeature) {
                    filteredFeature = _.filter(clusterFeature.get("features"), function (subFeature) {
                        if (subFeature.get("mmlid") === GFIfeatureId) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    clusterFeatureId = filteredFeature[0] ? filteredFeature[0].get("mmlid") : null;

                    if (GFIfeatureId !== clusterFeatureId) {
                        if (clusterFeature.get("features").length > 1) {
                            normalStyle = Radio.request("StyleList", "returnModelById", "mml_cluster");
                            clusterFeature.setStyle(normalStyle.getSimpleStyle());
                        }
                        else {
                            // MML: special case for overlaying features on highest zoomlevel
                            if (clusterFeature.getStyle()) {
                                if (clusterFeature.getStyle().length === 1) {
                                    featureStyle = clusterFeature.getStyle()[0].getImage();
                                }
                                else {
                                    featureStyle = clusterFeature.getStyle().getImage();
                                }
                            }
                            // normal case
                            if (!(this.getZoom() === 9 && featureStyle instanceof ol.style.Circle)) {
                                normalStyle = Radio.request("StyleList", "returnModelById", "mml");
                                clusterFeature.setStyle(normalStyle.getSimpleStyle());
                            }
                        }
                    }
                    else { // Styles für das GFI features werden aktiv gesetzt, benötigt für den ZoomChange "moveeend".
                        if (clusterFeature.get("features").length > 1) {
                            hoverStyle = Radio.request("StyleList", "returnModelById", "mml_cluster_hover");
                            clusterFeature.setStyle(hoverStyle.getHoverClusterStyle(clusterFeature));
                        }
                        else {
                            // MML: special case for overlaying features on highest zoomlevel
                            if (clusterFeature.getStyle()) {
                                if (clusterFeature.getStyle().length === 1) {
                                    featureStyle = clusterFeature.getStyle()[0].getImage();
                                }
                                else {
                                    featureStyle = clusterFeature.getStyle().getImage();
                                }
                            }
                            // normal case
                            if (!(this.getZoom() === 9 && featureStyle instanceof ol.style.Circle)) {
                                normalStyle = Radio.request("StyleList", "returnModelById", "mml_hover");
                                clusterFeature.setStyle(normalStyle.getHoverStyle());
                            }
                        }
                    }
                }, this);
            }
        },
        // Erzeuge Liste selektierter Features aus evt
        checkForEachFeatureAtPixel: function (evt) {
            if (evt.mapBrowserEvent.dragging) {
                return;
            }

            var selected = evt.selected,
                deselected = evt.deselected,
                selectedFeatures = [];

            // Style selected Features
            this.styleSelectedFeatures(selected, evt);

            // Styling rückgängig machen
            this.styleDeselectedFeatures(deselected);

            // Setze Cursor Style
            this.setCursor(selected);

            // Erzeuge Liste selektierter Features
            _.each(selected, function (selFeature) {
                var selLayer = evt.target.getLayer(selFeature),
                    isClusterFeature = selLayer.getSource() instanceof ol.source.Cluster;

                if (isClusterFeature && selFeature.get("features").length <= 1) {
                    _.each(selFeature.get("features"), function (feature) {
                        selectedFeatures.push({
                            feature: feature,
                            layerId: selLayer.get("id")
                        });
                    });
                }
                else {
                    selectedFeatures.push({
                        feature: selFeature,
                        layerId: selLayer.get("id")
                    });
                }
            });
            this.checkSelektion(selectedFeatures);
        },

        // Prüft, ob sich die selectedFeatures verändert haben und zeichnet ggf. neu.
        checkSelektion: function (selectedFeatures) {
            if (selectedFeatures.length === 0) {
                this.destroyPopup(selectedFeatures);
            }
            else if (this.get("oldSelection") === "") {
                this.set("oldSelection", selectedFeatures);
                this.prepMouseHoverFeature(selectedFeatures);
            }
            else {
                if (this.compareArrayOfObjects(selectedFeatures, this.get("oldSelection")) === false) {
                    this.destroyPopup(selectedFeatures);
                    this.set("oldSelection", selectedFeatures);
                    this.prepMouseHoverFeature(selectedFeatures);
                }
            }
        },

        compareArrayOfObjects: function (arr1, arr2) {
            var obj1,
                obj2,
                i;

            if (arr1.length !== arr2.length) {
                return false;
            }
            for (i = 0; i < arr1.length; i++) {
                obj1 = arr1[i],
                obj2 = arr2[i];

                if (_.isEqual(obj1, obj2) === false) {
                    return false;
                }
            }
            return true;
        },

        /**
        * Dies Funktion durchsucht das übergebene pFeatureArray und extrahiert den
        * anzuzeigenden Text sowie die Popup-Koordinate und setzt
        * mhpresult. Auf mhpresult lauscht die View, die daraufhin rendert
        */
        prepMouseHoverFeature: function (pFeatureArray) {
            var mouseHoverInfos = this.get("mouseHoverInfos"),
                value = "",
                coord,
                mouseHoverField,
                headerFields,
                textFields,
                hoverHeader,
                hoverText;

            if (pFeatureArray.length > 0) {
                // für jedes gehoverte Feature...
                _.each(pFeatureArray, function (element) {
                    var featureProperties = element.feature.getProperties(),
                        isClusterFeature = (element.feature.get("features") && element.feature.get("features").length > 1) === true ? true : false,
                        featureGeometry = element.feature.getGeometry(),
                        listEintrag = _.find(mouseHoverInfos, function (mouseHoverInfo) {
                            return mouseHoverInfo.id === element.layerId;
                        });

                    if (listEintrag) {
                        mouseHoverField = listEintrag.mouseHoverField;

                        if (mouseHoverField && _.isString(mouseHoverField)) {
                            if (_.has(featureProperties, mouseHoverField)) {
                                value = value + _.values(_.pick(featureProperties, mouseHoverField))[0];
                            }
                        }
                        else if (mouseHoverField && _.isArray(mouseHoverField)) {
                            _.each(mouseHoverField, function (element) {
                                value = value + "<span>" + _.values(_.pick(featureProperties, element)) + "</span></br>";
                            });
                        }
                        else if (mouseHoverField && _.isObject(mouseHoverField)) {
                            headerFields = mouseHoverField.header,
                            textFields = mouseHoverField.text,
                            hoverHeader = "",
                            hoverText = "";

                            _.each(headerFields, function (headerField) {
                                hoverHeader = hoverHeader === "" ? _.values(_.pick(featureProperties, headerField)) : hoverHeader + " " + _.values(_.pick(featureProperties, headerField));
                            });

                            _.each(textFields, function (textField) {
                                hoverText = hoverText === "" ? _.values(_.pick(featureProperties, textField)) : hoverText + " " + _.values(_.pick(featureProperties, textField));
                            });

                            if (isClusterFeature) {
                                var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: element.layerId});

                                hoverHeader = layerModel.getMouseHoverField().clusterHeader;
                                hoverText = layerModel.getMouseHoverField().clusterText;
                            }

                            value = "<span class='mouseHoverTitle'>" + hoverHeader + "</span></br>" + "<span class='mouseHoverText'>" + hoverText + "</span>";

                            if ((isClusterFeature && this.getZoom() === 9)) {
                                value = "";
                            }

                        }
                        if (!coord) {
                            if (featureGeometry.getType() === "MultiPolygon" || featureGeometry.getType() === "Polygon") {
                                coord = _.flatten(featureGeometry.getInteriorPoints().getCoordinates());
                            }
                            else {

                                coord = featureGeometry.getCoordinates();
                            }
                        }
                    }
                }, this);
                if (value !== "") {
                    this.get("mhpOverlay").setPosition(coord);
                    // this.get("mhpOverlay").setOffset([10, -15]);
                    this.get("mhpOverlay").setOffset([30, -45]);
                    this.set("mhpcoordinates", coord);
                    this.set("mhpresult", value);
                }
            }
        },

        // erstellt um die Clusterkoordinate die Features mit dem gleichen Extent
        createCircle: function (clusterFeature) {
            var arrayLength = clusterFeature.get("features").length,
                anchor = clusterFeature.getGeometry().getCoordinates(),
                source = this.getHoverLayer().getSource(),
                options = Radio.request("MapView", "getOptions"),
                radians = (180 / (arrayLength - 1)) * (Math.PI / 180),
                newStyle = this.getOverlayStyle(),
                newClusterFeature,
                geom,
                oldFeature,
                feature,
                i;

            newStyle.getImage().setOpacity(0.5);
            for (i = 0; i < arrayLength; i++) {
                newClusterFeature = clusterFeature.clone();
                geom = newClusterFeature.getGeometry();
                oldFeature = source.getFeatureById(i);
                feature = newClusterFeature.get("features")[i].clone();

                if (oldFeature) {
                    source.removeFeature(oldFeature);
                }
                geom.setCoordinates([anchor[0] - ((options.scale / 100) ), anchor[1]]); // Abstand 1% vom Maßstab
                geom.rotate(i * radians, anchor);
                feature.setGeometry(geom);
                newClusterFeature.setGeometry(geom);
                newClusterFeature.set("features", [feature]);
                newClusterFeature.setId(i);
                newClusterFeature.setStyle(newStyle);
                source.addFeature(newClusterFeature);
            }
        },

        setHoverLayer: function (value) {
            this.set("hoverLayer", value);
        },
        getHoverLayer: function () {
            return this.get("hoverLayer");
        },
        setZoom: function (value) {
            this.set("zoom", value);
        },

        /**
         * hovert nächstgelegenes Feature an coordinate
         */
        hoverByCoordinates: function (coordinate) {
            var feature,
                zoom = this.getZoom();

            feature = this.getFeatureByCoord(coordinate);
            this.styleSelFunc(feature, zoom);
        },

        /**
         * Setzt den Style des an der übergebenen Koordinate gefundenen Features zurück.
         */
        resetStyle: function (coordinate) {
            var feature;

            feature = this.getFeatureByCoord(coordinate);
            this.styleDeselFunc(feature);
        },

        getZoom: function () {
            return this.get("zoom");
        },

        getOverlayStyle: function () {
            return this.get("overlayStyle");
        },
        /**
         * Holt sich das nächstgelegene Feature zur übergebenen Koordinate.
         */
        getFeatureByCoord: function (coordinate) {
            var mouseHoverInfos = this.get("mouseHoverInfos"),
                feature;

            _.each(mouseHoverInfos, function (mhinfo) {
                var layerid = mhinfo.id,
                    layer = Radio.request("ModelList", "getModelByAttributes", {id: layerid});

                if (layer) {
                    feature = layer.get("layer").getSource().getClosestFeatureToCoordinate(coordinate);
                }

            }, this);
            return feature;
        }
    });

    return new MouseHoverPopup();
});
