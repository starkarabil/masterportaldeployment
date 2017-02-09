define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        GeoJSONLayer;

    GeoJSONLayer = Layer.extend({

        /**
         * [createLayerSource description]
         * @return {[type]} [description]
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: this.get("url"),
                features: this.getFeatures()
            }));
        },

        /**
         * [createClusterLayerSource description]
         * @return {[type]} [description]
         */
        createClusterLayerSource: function () {
            this.setClusterLayerSource(new ol.source.Cluster({
                source: this.getLayerSource(),
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
                style: this.getStyle()
            }));
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
        },

        /**
         * Zeigt alle Features mit dem Default-Style an
         */
        showAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(this.getStyles());
            }, this);
        },

        /**
         * Versteckt alle Features mit dem Hidden-Style
         */
        hideAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures();

            collection.forEach(function (feature) {
                feature.setStyle(this.getHiddenStyle());
            }, this);
        },

        /**
         * Zeigt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        showFeaturesByIds: function (featureIdList) {
            _.each(featureIdList, function (id) {
                var feature = this.getLayerSource().getFeatureById(id);

                feature.setStyle(this.getStyles());
            }, this);
        },

        /**
         * Versteckt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        hideFeaturesByIds: function (featureIdList) {
            _.each(featureIdList, function (id) {
                var feature = this.getLayerSource().getFeatureById(id);

                feature.setStyle(this.getHiddenStyle());
            }, this);
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
        },

        getHiddenStyle: function () {
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(255, 255, 255, 0)"
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(49, 159, 211, 0)"
                })
            });
        }
    });

    return GeoJSONLayer;
});
