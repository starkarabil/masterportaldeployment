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
                multi: true,
                filter: function (feature, layer) {
                    return Radio.request("MouseHover", "hasHoverInfo", feature, layer);
                },
                layers: function (ollayer) {
                    return Radio.request("MouseHover", "isHoverLayer", ollayer);
                }
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

            $("#lgv-container").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");

            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));

            this.getMouseHoverInfos();
            this.set("element", this.get("mhpOverlay").getElement());
            EventBus.on("GFIPopupVisibility", this.GFIPopupVisibility, this); // GFIPopupStatus auslösen. Trigger in GFIPopoupView
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
                })
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

        // Vergrößert das Symbol
        scaleFeaturesUp: function (features) {
            features.forEach(function (feature) {
                var newStyle = feature.getStyle()[0].clone();

                newStyle.getImage().setScale(1.2);
                if (_.isNull(newStyle.getText()) === false) {
                    newStyle.getText().setOffsetY(1.2 * newStyle.getText().getOffsetY());
                }
                feature.setStyle([newStyle]);
            });
        },

        // Verkleinert das Symbol
        scaleFeaturesDown: function (features) {
            features.forEach(function (feature) {
                var newStyle = feature.getStyle()[0].clone();

                newStyle.getImage().setScale(1);
                if (_.isNull(newStyle.getText()) === false) {
                    newStyle.getText().setOffsetY(newStyle.getText().getOffsetY() / 1.2);
                }
                feature.setStyle([newStyle]);
            });
        },

        // Erzeuge Liste selektierter Features aus evt
        checkForEachFeatureAtPixel: function (evt) {
            if (evt.mapBrowserEvent.dragging) {
                return;
            }

            var selected = evt.selected,
                deselected = evt.deselected,
                selectedFeatures = [];

            // Skaliert Vektorsymbol selektierter Features
            this.scaleFeaturesUp(selected);

            // Deskaliert Vektorsymbol deselektierter Features
            this.scaleFeaturesDown(deselected);

            // Setze Cursor Style
            this.setCursor(selected);

            // Erzeuge Liste selektierter Features
            _.each(selected, function (selFeature) {
                var selLayer = evt.target.getLayer(selFeature),
                    isClusterFeature = selLayer.getSource() instanceof ol.source.Cluster

                if (isClusterFeature) {
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
                    })
                }
            });
            this.checkSelektion(selectedFeatures);
        },

        // Prüft, ob sich die selectedFeatures verändert haben und zeichnet ggf. neu.
        checkSelektion: function (selectedFeatures) {
            if (this.get("oldSelection") === "") {
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
        }
    });

    return new MouseHoverPopup();
});
