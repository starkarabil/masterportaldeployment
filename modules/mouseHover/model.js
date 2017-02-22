define([
    "openlayers",
    "backbone.radio",
    "eventbus",
    "bootstrap/popover"
], function (ol, Radio, EventBus) {

    var MouseHoverPopup = Backbone.Model.extend({
        defaults: {
            cursor: "pointer",
            previousCursor: undefined,
            // select interaction reagiert auf pointermove
            selectPointerMove: new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,
                multi: false,
                filter: function (feature, layer) {
                    return Radio.request("MouseHover", "hasHoverInfo", feature, layer);
                },
                layers: function (ollayer) {
                    return Radio.request("MouseHover", "isHoverLayer", ollayer);
                },
                hitTolerance: 2,
                style: this.hoverStyleFunction
            }),
            mouseHoverInfos: [],
            mhpresult: "",
            mhpcoordinates: [],
            oldSelection: "",
            GFIPopupVisibility: false
        },
        initialize: function () {
            // Radio channel
            var channel = Radio.channel("MouseHover");

            channel.reply({
                "isHoverLayer": this.isHoverLayer,
                "hasHoverInfo": this.hasHoverInfo
            }, this);

            // select interaction Listener
            this.get("selectPointerMove").on("select", this.checkForEachFeatureAtPixel, this);
            Radio.trigger("Map", "addInteraction", this.get("selectPointerMove"));
            Radio.trigger("Map", "registerListener", "click", this.clickOnMap, this);

            // Erzeuge Overlay
            $("#lgv-container").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");
            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));
            this.set("element", this.get("mhpOverlay").getElement());
            Radio.trigger("Map", "addOverlay", this.get("mhpOverlay"));

            // Lese MouseHover Definition aus config
            this.getMouseHoverInfos();

            // Hack für clusterFeatures
            var mouseHoverInfos = this.get("mouseHoverInfos");

            mouseHoverInfos.push({
                id: "999998",
                mouseHoverField: {
                    header: ["str", "hsnr"],
                    text: "kat"
                }
            });
            this.set("mouseHoverInfos", mouseHoverInfos);


            // Listeners
            this.listenTo(Radio.channel("GFI"), {
                "isVisible": this.GFIPopupVisibility
            }, this);
            this.listenTo(Radio.channel("MapView"), {
                "changedZoomLevel": this.hoverOffClusterFeature
            }, this);

            this.setHoverLayer(Radio.request("Map", "createLayerIfNotExists", "hover_layer"));
            // Hack für clusterFeatures
            var hoverLayer = this.getHoverLayer();

            hoverLayer.set("id", "999998");
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
         * Erstellt initial eine Liste aller Vektorlayer mit Definition eines mouseHoverFields.
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

        GFIPopupVisibility: function (GFIPopupVisibility) {
            this.set("GFIPopupVisibility", GFIPopupVisibility);
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
        styleSelectedFeatures: function (features) {
            features.forEach(function (feature) {
                var newStyle = feature.getStyle()[0].clone();
                // bei ClusterFeatures
                if (feature.get("features").length > 1) {
                    newStyle.getImage().setOpacity(0.5);
                    feature.setStyle([newStyle]);
                    this.hoverOnClusterFeature(feature);
                }
                else {
                    newStyle.getImage().setScale(1.2);
                    if (_.isNull(newStyle.getText()) === false) {
                        newStyle.getText().setOffsetY(1.2 * newStyle.getText().getOffsetY());
                    }
                    feature.setStyle([newStyle]);
                }
            }, this);
        },

        // Deselected Features: Symbol zurücksetzen
        styleDeselectedFeatures: function (features) {
            features.forEach(function (feature) {
                var newStyle = feature.getStyle()[0].clone();

                // bei ClusterFeatures
                if (feature.get("features").length > 1) {
                    newStyle.getImage().setOpacity(1);
                    feature.setStyle([newStyle]);
                    // this.hoverOffClusterFeature();
                }
                else {
                    newStyle.getImage().setScale(1);
                    if (_.isNull(newStyle.getText()) === false) {
                        newStyle.getText().setOffsetY(newStyle.getText().getOffsetY() / 1.2);
                    }
                    feature.setStyle([newStyle]);
                }
            }, this);
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
            this.styleSelectedFeatures(selected);

            // Styling rückgängig machen
            this.styleDeselectedFeatures(deselected);

            // Setze Cursor Style
            this.setCursor(selected);

            // Erzeuge Liste selektierter Features
            _.each(selected, function (selFeature) {
                var selLayer = evt.target.getLayer(selFeature),
                    isClusterFeature = selLayer.getSource() instanceof ol.source.Cluster;

                if (isClusterFeature) {
                    // hack für clusterFeatures
                    if (selFeature.get("features").length <= 1) {
                        _.each(selFeature.get("features"), function (feature) {
                            selectedFeatures.push({
                                feature: feature,
                                layerId: selLayer.get("id")
                            });
                        });
                    }
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
            if (arr1.length !== arr2.length) {
                return false;
            }
            for (var i = 0; i < arr1.length; i++) {
                var obj1 = arr1[i],
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
                coord;

            if (pFeatureArray.length > 0) {
                // für jedes gehoverte Feature...
                _.each(pFeatureArray, function (element) {
                    var featureProperties = element.feature.getProperties(),
                        featureGeometry = element.feature.getGeometry(),
                        listEintrag = _.find(mouseHoverInfos, function (mouseHoverInfo) {
                            return mouseHoverInfo.id === element.layerId;
                        });

                    if (listEintrag) {
                        var mouseHoverField = listEintrag.mouseHoverField;

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
                            var headerFields = mouseHoverField.header,
                                textFields = mouseHoverField.text,
                                hoverHeader = "",
                                hoverText = "";

                            _.each(headerFields, function (headerField) {
                                hoverHeader = hoverHeader = "" ? _.values(_.pick(featureProperties, headerField)) : hoverHeader + " " + _.values(_.pick(featureProperties, headerField));
                            });

                            _.each(textFields, function (textField) {
                                hoverText = hoverText = "" ? _.values(_.pick(featureProperties, textField)) : hoverText + " " + _.values(_.pick(featureProperties, textField));
                            });

                            // hack für clusterFeatures
                            if (hoverHeader.length <= 2) {
                                hoverHeader = "HoverHeader";
                            }
                            if (hoverText.length === 3) {
                                hoverText = "HoverText";
                            }

                            value = "<span class='mouseHoverTitle'>" + hoverHeader + "</span></br>" + "<span class='mouseHoverText'>" + hoverText + "</span>";
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
                    this.get("mhpOverlay").setOffset([10, -15]);
                    this.set("mhpcoordinates", coord);
                    this.set("mhpresult", value);
                }
            }
        },
        // prüft die anzahl der geclusterten Features und ob die Features übereinander liegen
        hoverOnClusterFeature: function (clusterFeature) {
            var featureArray = clusterFeature.get("features"),
                source = this.getHoverLayer().getSource(),
                stylelistmodel = Radio.request("StyleList", "returnModelByValue", "mml"),
                hasFeaturesWithSameExtent = false,
                maxFeatures = 8;

            source.clear();
            hasFeaturesWithSameExtent = this.hasFeaturesWithSameExtent(featureArray);
            if (!hasFeaturesWithSameExtent) {
                if (featureArray.length <= maxFeatures) {
                    this.createCircle(clusterFeature);
                }
                else {
                    console.log("Mehr als " + maxFeatures + " Features. Klicken zum Zoomen");
                }
            }
            else {
                console.log("gleicher extent");
                this.createCircle(clusterFeature);
            }
        },
        // erstellt um die Clusterkooridnate die geclusterten Features
        createCircle: function (clusterFeature) {
            var featureArray = clusterFeature.get("features"),
                anchor = clusterFeature.getGeometry().getCoordinates(),
                source = this.getHoverLayer().getSource(),
                options = Radio.request("MapView", "getOptions");
                size = featureArray.length,
                radians = (360 / size) * (Math.PI / 180);
                stylelistmodel = Radio.request("StyleList", "returnModelByValue", "mml");

                _.each(featureArray, function (feature, index) {
                    var newClusterFeature = clusterFeature.clone(),
                        geom = newClusterFeature.getGeometry();

                    geom.setCoordinates([anchor[0], anchor[1] + (options.scale / 150)]);
                    geom.rotate(index * radians, anchor);
                    newClusterFeature.set("features",[feature]);
                    newClusterFeature.setGeometry(geom);
                    newClusterFeature.setStyle(stylelistmodel.getClusterStyle(newClusterFeature));
                    source.addFeature(newClusterFeature);
                });

        },
        // prüft über den Extent ob Features übereinander liegen
        hasFeaturesWithSameExtent: function (featureArray) {
            xMinArray = [],
            yMinArray = [],
            xMaxArray = [],
            yMaxArray = [],
            size = featureArray.length,
            hasFeaturesWithSameExtent = false;

            _.each(featureArray, function (feature, index) {
                    xMinArray.push(feature.getGeometry().getExtent()[0]);
                    yMinArray.push(feature.getGeometry().getExtent()[1]);
                    xMaxArray.push(feature.getGeometry().getExtent()[2]);
                    yMaxArray.push(feature.getGeometry().getExtent()[3]);
            });

            xMinArray = _.uniq(xMinArray);
            yMinArray = _.uniq(yMinArray);
            xMaxArray = _.uniq(xMaxArray);
            yMaxArray = _.uniq(yMaxArray);

            if (xMinArray.length === 1 && yMinArray.length === 1 && xMaxArray.length === 1 && yMaxArray.length === 1) {
                hasFeaturesWithSameExtent = true;
            }
            return hasFeaturesWithSameExtent;
        },

        hoverOffClusterFeature: function () {
            this.getHoverLayer().getSource().clear();
        },
        setHoverLayer: function (value) {
            this.set("hoverLayer", value);
        },
        getHoverLayer: function () {
            return this.get("hoverLayer");
        },
        // listener-funktion, die bei click auf die Map aufgerufen wird.
        clickOnMap: function (evt) {
            var eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent),
                isFeatureAtPixel = Radio.request("Map", "hasFeatureAtPixel", eventPixel);


            if (isFeatureAtPixel === true) {
                Radio.trigger("Map", "forEachFeatureAtPixel", eventPixel, this.featureClicked);
            }
            else {
                this.hoverOffClusterFeature();
            }
        },
        // zoomt bei Klick auf das Cluster Feature auf den extent aller geclusterten Features
        featureClicked: function (feature) {
            var extent = [];

            if (feature.get("features") && feature.get("features").length > 1) {
                _.each(feature.get("features"), function (feature) {
                    if (extent.length === 0) {
                        extent.push(feature.getGeometry().getExtent()[0]);
                        extent.push(feature.getGeometry().getExtent()[1]);
                        extent.push(feature.getGeometry().getExtent()[2]);
                        extent.push(feature.getGeometry().getExtent()[3]);
                    }
                    else {
                        if (extent[0] > feature.getGeometry().getExtent()[0]) {
                            extent[0] = feature.getGeometry().getExtent()[0];
                        }
                        if (extent[1] > feature.getGeometry().getExtent()[1]) {
                            extent[1] = feature.getGeometry().getExtent()[1];
                        }
                        if (extent[2] < feature.getGeometry().getExtent()[2]) {
                            extent[2] = feature.getGeometry().getExtent()[2];
                        }
                        if (extent[3] < feature.getGeometry().getExtent()[3]) {
                            extent[3] = feature.getGeometry().getExtent()[3];
                        }
                    }
                });
                Radio.trigger("Map","zoomToExtent", extent);
            }
        }
    });

    return new MouseHoverPopup();
});
