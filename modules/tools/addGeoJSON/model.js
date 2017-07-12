define(function (require) {

    var
        ol = require("openlayers"),
        AddGeoJSON;

    AddGeoJSON = Backbone.Model.extend({
        defaults: {
            reader: new ol.format.GeoJSON(),
            features: [],
            layerId: "",
            layerName: ""
        },

        initialize: function () {
            var channel = Radio.channel("AddGeoJSON");

            this.listenTo(channel, {
                "addFeaturesFromGBM": function (hits, id, layerName) {
                    this.setLayerId(id);
                    if (this.getLayerName !== name) {
                        this.addLayer();
                        this.setLayerName(layerName);
                    }
                    this.createFeaturesFromGBM(hits);
                }
            });

            channel.on({
                "addFeatures": function (features, name, hoverInfos) {
                    var model,
                        layer,
                        source;

                    this.setLayerId(name);
                    this.setLayerName(name);
                    this.createFeaturesFromGeoJson(features);
                    // if model, and thus the ol.layer, doesn't exist in the modelList: Create Model and add Layer.
                    model = Radio.request("ModelList", "getModelByAttributes", {id: this.getLayerId()});
                    if (!model) {
                        this.addLayer(hoverInfos);
                    }
                    // if layer exists: Add features
                    else {
                        model = Radio.request("ModelList", "getModelByAttributes", {id: this.getLayerId()});
                        layer = model ? model.get("layer") : null;
                        source = layer ? layer.getSource() : null;
                        if (source) {
                            if (source instanceof ol.source.Cluster) {
                                source = source.getSource();
                            }
                            // Also add featuresToHide so that we have the whole data in the source.
                            // Thus we prevent adding of duplicate features by source.addFeatures()
                            source.addFeatures(model.get("featuresToHide"));
                            source.addFeatures(this.getFeatures());

                            var featuresToShow = source.getFeatures();

                            // After adding the new features, remove the featuresToHide from the source
                            featuresToShow = _.difference(featuresToShow, model.get("featuresToHide"));
                            source.clear();
                            source.addFeatures(featuresToShow);
                        }
                    }
                }
            }, this);
        },
        addLayer: function (hoverInfos) {
            // Im Parser die Layer erzeugen
            Radio.trigger("Parser", "addGeoJSONLayer", this.getLayerName(), this.getLayerId(), this.getFeatures(), hoverInfos);
            // Der Modellist sagen sie soll sich den Layer vom Parser holen
            Radio.trigger("ModelList", "addModelsByAttributes", {id: this.getLayerId()});
        },

        /**
         * Erzeugt aus den Attributen im "IT-GBM" Index OpenLayers Features
         * @param  {Object[]} hits - Trefferliste mit Attributen
         */
        createFeaturesFromGBM: function (hits) {
            var features = [];

            _.each(hits, function (hit) {
                var feature = new ol.Feature({
                    geometry: this.readAndGetGeometry(hit.geometry_UTM_EPSG_25832)
                });

                feature.setProperties(_.omit(hit, "geometry_UTM_EPSG_25832"));
                feature.setId(hit.id);
                features.push(feature);
            }, this);

            this.setFeatures(features);
        },

        /**
         * Erzeugt aus einem GeoJSON OpenLayers Features
         * @param  {Object[]} features - GeoJSON
         */
        createFeaturesFromGeoJson: function (features) {
            var features;

            features = this.getReader().readFeatures(features);

            _.each(features, function (feature) {
                if (feature.get("OBJECTID")) {
                    feature.setId(feature.get("OBJECTID"));
                }
            });
            this.setFeatures(features);
        },

        /**
         * Liest die Geometrie aus einem GeoJSON und gibt sie zurück
         * @param  {GeoJSON} geometry
         * @return {ol.geom.Geometry}
         */
        readAndGetGeometry: function (geometry) {
            return this.getReader().readGeometry(geometry, {
                dataProjection: "EPSG:25832"
            });
        },
        // getter for features
        getFeatures: function () {
            return this.get("features");
        },
        // setter for features
        setFeatures: function (value) {
            this.set("features", value);
        },
        // getter for layerName
        getLayerName: function () {
            return this.get("layerName");
        },
        // setter for layerName
        setLayerName: function (value) {
            this.set("layerName", value);
        },
        // getter for layerId
        getLayerId: function () {
            return this.get("layerId");
        },
        // setter for layerId
        setLayerId: function (value) {
            this.set("layerId", value);
        },
        // getter for reader
        getReader: function () {
            return this.get("reader");
        }
    });

    return AddGeoJSON;

});
