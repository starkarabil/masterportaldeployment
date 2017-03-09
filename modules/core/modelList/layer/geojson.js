define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        GeoJSONLayer;

    GeoJSONLayer = Layer.extend({
        defaults: {
            featuresToHide: new Array()
        },
        /**
         * [createLayerSource description]
         * @return {[type]} [description]
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector({
                format: new ol.format.GeoJSON()
            }));
        },
        /**
         * Lädt die JSON-Datei und startet parse
         */
        updateData: function () {
            this.fetch({
                url: this.get("url"),
                cache: false,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Layerdaten (JSON) konnten nicht geladen werden!</strong>", kategorie: "alert-danger"});
                }
            });
        },
        /**
         * konvertiert die Daten in ol.features
         */
        parse: function (data) {
            var vectorSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON()
                });

            this.updateLayerSourceData(vectorSource.getFormat().readFeatures(data));
        },

        updateLayerSourceData(features) {
            var count = 0;

            features.forEach(function (feature) {
                if (!feature.getId()) {
                    feature.setId(count);
                    count ++;
                }
            });
            this.getLayerSource().clear();
            this.getLayerSource().addFeatures(features);
        },

        /**
         * [createClusterLayerSource description]
         * @return {[type]} [description]
         */
        createClusterLayerSource: function () {
            this.setClusterLayerSource(new ol.source.Cluster({
                source: this.getLayerSource(),
                format: new ol.format.GeoJSON(),
                distance: this.getClusterDistance()
            }));
        },

        /**
         * [createLayer description]
         * @return {[type]} [description]
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: (this.has("clusterLayerSource") === true) ? this.getClusterLayerSource() : this.getLayerSource(),
                style: this.getStyle(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId(),
                mouseHoverField: this.get("mouseHoverField")
            }));

            this.updateData();
        },

        /**
         * [createLayerStyle description]
         * @return {[type]} [description]
         */
        createStyle: function () {
            var styleId = this.getStyleId();

            if (this.has("clusterLayerSource")) {
                this.set("style", function (feature) {
                    // Anzahl der Features
                    var size = feature.get("features").length,
                        stylelistmodel;

                    // Wenn mehrere Features vorhanden sind, wird geprüft, ob dafür ein extra Style vorhanden ist
                    if (size > 1) {
                        stylelistmodel = Radio.request("StyleList", "returnModelById", styleId + "_cluster");
                    }
                    // Ansonsten nimm den normal one
                    if (_.isUndefined(stylelistmodel) === true) {
                        stylelistmodel = Radio.request("StyleList", "returnModelByValue", styleId);
                    }
                    feature.setStyle(stylelistmodel.getClusterStyle(feature));
                });
            }
            else {
                this.set("style", function (feature) {
                    stylelistmodel = Radio.request("StyleList", "returnModelByValue", styleId);
                    feature.setStyle(stylelistmodel.getSimpleStyle());
                });
            }
        },

        /**
         * Zeigt alle Features mit dem Default-Style an
         */
        showAllFeatures: function () {
            var source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide();

                _.each(featuresToHide, function (feature) {
                    source.addFeature(feature);
                    featuresToHide = _.without(featuresToHide, feature);
                });
                this.setFeaturesToHide(featuresToHide);
        },

        /**
         * Versteckt alle Features mit dem Hidden-Style
         */
        hideAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures(),
                source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide();

            collection.forEach(function (feature) {
                featuresToHide.push(feature);
                source.removeFeature(feature);
            }, this);
        },

        /**
         * Zeigt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        showFeaturesByIds: function (featureIdList) {
            var source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide();

            _.each(featureIdList, function (id) {
                _.each(featuresToHide, function (feature) {
                    if (String(feature.getId()) === id) {
                        source.addFeature(feature);
                        featuresToHide = _.without(featuresToHide, feature);
                    }
                }, this);
            }, this);
            this.setFeaturesToHide(featuresToHide);
        },

        /**
         * Versteckt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        hideFeaturesByIds: function (featureIdList) {
            var source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide();

            _.each(featureIdList, function (id) {
                var feature = this.getLayerSource().getFeatureById(id);

                if (feature) {
                    featuresToHide.push(feature);
                    source.removeFeature(feature);
                }
            }, this);
        },

        // getter for FeaturesToHide
        getFeaturesToHide: function () {
            return this.get("featuresToHide");
        },
        // setter for FeaturesToHide
        setFeaturesToHide: function (value) {
            this.set("featuresToHide", value);
        },
        // Setter
        setClusterLayerSource: function (value) {
            this.set("clusterLayerSource", value);
        },

        // Getter
        getFeatures: function () {
            return this.get("features");
        },

        getClusterLayerSource: function () {
            return this.get("clusterLayerSource");
        },

        getClusterDistance: function () {
            return this.get("clusterDistance");
        },

        getStyleId: function () {
            return this.get("styleId");
        },

        getStyle: function () {
            if (this.get("id") === "flurst" || this.get("id") === "potfl") {
                return this.getDefaultStylePolygon();
            }
            else {
                return this.get("style");
            }
        },

        getDefaultStylePolygon: function () {
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(49, 159, 211, 0.8)"
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(50, 50, 50, 1)",
                    width: 1
                })
            });
        }
    });

    return GeoJSONLayer;
});
