define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var Legend = Backbone.Model.extend({

        defaults: {
            getLegendURLParams: "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=",
            legendParams: [],
            wmsLayerList: [],
            paramsStyleWMS: [],
            paramsStyleWMSArray: [],
            visible: false
        },

        initialize: function () {
            var channel = Radio.channel("Legend");

            channel.reply({
               "getLegendParams": this.getLegendParams
            }, this);

            this.listenTo(Radio.channel("ModelList"), {
                "updatedSelectedLayerList": this.setLayerList
            });
            this.listenTo(Radio.channel("StyleWMS"), {
                "updateParamsStyleWMS": this.updateParamsStyleWMSArray
            });

            this.listenTo(this, {
                "change:wmsLayerList": this.setLegendParamsFromWMS,
                "change:wfsLayerList": this.setLegendParamsFromWFS,
                "change:groupLayerList": this.setLegendParamsFromGROUP,
                "change:paramsStyleWMSArray": this.updateLegendFromStyleWMSArray
            });

            this.setLayerList();
        },

        setVisible: function (val) {
            this.set("visible", val);
        },

        getVisible: function () {
            return this.get("visible");
        },

        updateParamsStyleWMSArray: function (params) {
            var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            paramsStyleWMSArray2 = [];

            _.each (paramsStyleWMSArray, function (paramsStyleWMS) {
                if (params.styleWMSName !== paramsStyleWMS.styleWMSName) {
                    paramsStyleWMSArray2.push(paramsStyleWMS);
                }
            });
            paramsStyleWMSArray2.push(params);
            this.set("paramsStyleWMS", params);
            this.set("paramsStyleWMSArray", paramsStyleWMSArray2);

        },

        updateLegendFromStyleWMSArray: function () {
            var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
                legendParams = this.get("legendParams");

            _.each(this.get("legendParams"), function (legendParam, i) {
                    _.find (paramsStyleWMSArray, function (paramsStyleWMS) {
                        if (legendParam.layername === paramsStyleWMS.styleWMSName) {
                            var layername = legendParam.layername,
                                isVisibleInMap = legendParam.isVisibleInMap;

                            legendParams.splice(i, 1, {params: paramsStyleWMS,
                                               layername: layername,
                                               typ: "styleWMS",
                                               isVisibleInMap: isVisibleInMap});

                        }
                    });
            });
            this.set("legendParams", legendParams);
        },

        getLegendParams: function () {
            return this.get("legendParams");
        },
        createLegend: function () {
            this.set("legendParams", []);
            this.set("legendParams", _.sortBy(this.get("tempArray"), function (obj) {
                return obj.layername;
            }));
        },

        setLayerList: function () {
            var filteredLayerList,
                groupedLayers,
                modelList = Radio.request("ModelList", "getCollection");

//            layerlist = modelList.where({type: "layer", isVisibleInMap: true});
            this.unsetLegendParams();
            // Die Layer die in der Legende dargestellt werden sollen
            filteredLayerList = _.filter(modelList.models, function (layer) {
                return layer.get("legendURL") !== "ignore";
            });

            // Liste wird nach Typen(WMS, WFS,...) gruppiert
            groupedLayers = _.groupBy(filteredLayerList, function (layer) {
                return layer.get("typ");
            });
            // this.set("tempArray", []);
            if (_.has(groupedLayers, "WMS")) {
                this.set("wmsLayerList", groupedLayers.WMS);
            }
            if (_.has(groupedLayers, "WFS")) {
                this.set("wfsLayerList", groupedLayers.WFS);
            }
            if (_.has(groupedLayers, "GROUP")) {
                this.set("groupLayerList", groupedLayers.GROUP);
            }
            this.createLegend();
        },

        unsetLegendParams: function () {
            this.set("wfsLayerList", "");
            this.set("wmsLayerList", "");
            this.set("groupLayerList", "");
            this.set("tempArray", []);
        },

        setLegendParamsFromWMS: function () {
            var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            paramsStyleWMS = "";

            _.each(this.get("wmsLayerList"), function (layer) {
                paramsStyleWMS = _.find(paramsStyleWMSArray, function (paramsStyleWMS) {
                    if (layer.get("name") === paramsStyleWMS.styleWMSName) {
                        return true;
                    }
                });
                if (paramsStyleWMS) {

                    this.push("tempArray", {
                        layername: layer.get("name"),
                        typ: "styleWMS",
                        params: paramsStyleWMS,
                        isVisibleInMap: layer.get("isVisibleInMap")
                    });
                }
                else {
                    var legendURL = layer.get("legendURL");

                    this.push("tempArray", {
                        layername: layer.get("name"),
                        img: legendURL,
                        typ: "WMS",
                        isVisibleInMap: layer.get("isVisibleInMap")
                    });
                }
            }, this);
        },

        setLegendParamsFromWFS: function () {
            _.each(this.get("wfsLayerList"), function (layer) {
                if (layer.get("loadend") === "ready") {
                    if (typeof layer.get("legendURL") === "string") {
                        this.push("tempArray", {
                            layername: layer.get("name"),
                            img: layer.get("legendURL"),
                            typ: "WFS",
                            isVisibleInMap: layer.get("isVisibleInMap")
                        });
                    }
                    else {
                        var image = [],
                            name = [],
                            style = Radio.request("StyleList", "returnModelById", layer.getStyleId()),
                            styleClass = style.get("class"),
                            styleSubClass = style.get("subClass"),
                            styleFieldValues = style.get("styleFieldValues");

                        if (styleClass === "POINT") {
                            // Custom Point Styles
                            if (styleSubClass === "CUSTOM") {
                                _.each(styleFieldValues, function (styleFieldValue) {
                                    image.push(style.get("imagePath") + styleFieldValue.imageName);
                                    if (_.has(styleFieldValue, "legendValue")) {
                                        name.push(styleFieldValue.legendValue);
                                    }
                                    else {
                                        name.push(styleFieldValue.styleFieldValue);
                                    }
                                });
                            }
                            // Circle Point Style
                            if (styleSubClass === "CIRCLE") {
                                image.push(this.createCircleSVG(style));
                                name.push(layer.get("name"));
                            }
                            else {
                                if (style.get("imageName") !== "blank.png") {
                                    image.push(style.get("imagePath") + style.get("imageName"));
                                }
                                name.push(layer.get("name"));
                            }
                        }
                        // Simple Line Style
                        if (styleClass === "LINE") {
                            image.push(this.createLineSVG(style));
                            if (style.has("legendValue")) {
                                name.push(style.get("legendValue"));
                            }
                            else {
                                name.push(layer.get("name"));
                            }
                        }
                        // Simple Polygon Style
                        if (styleClass === "POLYGON") {
                            image.push(this.createPolygonSVG(style));
                            if (style.has("legendValue")) {
                                name.push(style.get("legendValue"));
                            }
                            else {
                                name.push(layer.get("name"));
                            }
                        }
                        this.push("tempArray", {
                            layername: layer.get("name"),
                            legendname: name,
                            img: image,
                            typ: "WFS",
                            isVisibleInMap: layer.get("isVisibleInMap")
                        });
                    }
                }
            }, this);
        },
        createCircleSVG: function (style) {
            var svg = "",
                circleStrokeColor = style.returnColor(style.get("circleStrokeColor"), "hex"),
                circleStrokeOpacity = style.get("circleStrokeColor")[3].toString() || 0,
                circleStrokeWidth = style.get("circleStrokeWidth"),
                circleFillColor = style.returnColor(style.get("circleFillColor"), "hex"),
                circleFillOpacity = style.get("circleFillColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
            svg += circleStrokeColor;
            svg += "' stroke-opacity='";
            svg += circleStrokeOpacity;
            svg += "' stroke-width='";
            svg += circleStrokeWidth;
            svg += "' fill='";
            svg += circleFillColor;
            svg += "' fill-opacity='";
            svg += circleFillOpacity;
            svg += "'/>";
            svg += "</svg>";

            return svg;
        },
        createLineSVG: function (style) {
            var svg = "",
                strokeColor = style.returnColor(style.get("lineStrokeColor"), "hex"),
                strokeWidth = parseInt(style.get("lineStrokeWidth"), 10),
                strokeOpacity = style.get("lineStrokeColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<path d='M 05 30 L 30 05' stroke='";
            svg += strokeColor;
            svg += "' stroke-opacity='";
            svg += strokeOpacity;
            svg += "' stroke-width='";
            svg += strokeWidth;
            svg += "' fill='none'/>";
            svg += "</svg>";

            return svg;
        },
        createPolygonSVG: function (style) {
            var svg = "",
                fillColor = style.returnColor(style.get("polygonFillColor"), "hex"),
                strokeColor = style.returnColor(style.get("polygonStrokeColor"), "hex"),
                strokeWidth = parseInt(style.get("polygonStrokeWidth"), 10),
                fillOpacity = style.get("polygonFillColor")[3].toString() || 0,
                strokeOpacity = style.get("polygonStrokeColor")[3].toString() || 0;

            svg += "<svg height='35' width='35'>";
            svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
            svg += fillColor;
            svg += ";fill-opacity:";
            svg += fillOpacity;
            svg += ";stroke:";
            svg += strokeColor;
            svg += ";stroke-opacity:";
            svg += strokeOpacity;
            svg += ";stroke-width:";
            svg += strokeWidth;
            svg += ";'/>";
            svg += "</svg>";

            return svg;
        },
        /**
         * Übergibt GroupLayer in den tempArray. Für jeden GroupLayer wird der Typ "Group" gesetzt und als legendURL ein Array übergeben.
         */
        setLegendParamsFromGROUP: function () {
            var groupLayerList = this.get("groupLayerList");

            _.each(groupLayerList, function (groupLayer) {
                var legendURLS = groupLayer.get("legendURL"),
                    name = groupLayer.get("name"),
                    isVisibleInMap = groupLayer.get("isVisibleInMap");

                this.push("tempArray", {
                    layername: name,
                    img: legendURLS,
                    typ: "GROUP",
                    isVisibleInMap: isVisibleInMap
                });
            }, this);
        },

        /**
         * @desc Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * @param {String} attribute - Das Attribut das gesetzt werden soll.
         * @param {whatever} value - Der Wert des Attributs.
         */
        push: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        }
    });

    return new Legend();
});
