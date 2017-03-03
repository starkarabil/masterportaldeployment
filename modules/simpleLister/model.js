define([
    "openlayers"

], function () {

    var ol = require("openlayers"),
        SimpleListerModel;

    SimpleListerModel = Backbone.Model.extend({
        defaults: {
            featuresInExtent: [],
            featuresPerPage: 20, // Anzahl initialer Features in Liste
            totalFeaturesInPage: 0, // Aktuelle Anzahl an Features in Liste
            totalFeatures: 0, // Anzahl aller Features im Extent
            glyphicon: "glyphicon-chevron-right",
            display: "none"
        },

        initialize: function () {
            Radio.on("MouseHover", "selected", this.mouseHoverSelected, this);
            Radio.trigger("Map", "registerListener", "moveend", this.getLayerFeaturesInExtent, this);
            this.getParams();
        },
        getParams: function () {
            var simpleLister = Radio.request("Parser", "getPortalConfig").simpleLister;

            this.setLayerId(simpleLister.layerId);
            this.setErrortxt(simpleLister.errortxt || "Keine Features im Kartenausschnitt");
            this.setFeaturesPerPage(simpleLister.featuresPerPage);
        },

        // holt sich JSON-Objekte aus Extent und gewünschte Anzahl in Liste und initiiert setter
        getLayerFeaturesInExtent: function () {
            var featuresPerPage = this.get("featuresPerPage"),
                jsonfeatures = Radio.request("ModelList", "getLayerFeaturesInExtent", this.getLayerId()),
                totalFeatures = jsonfeatures.length;

            this.set("totalFeatures", totalFeatures);
            this.setFeaturesInExtent(jsonfeatures, featuresPerPage);
        },

        // holt sich JSON-Objekte aus Extent und verdoppelt gewünschte Anzahl in Liste und initiiert setter
        appendFeatures: function () {
            var featuresPerPage = this.get("featuresPerPage") + this.get("totalFeaturesInPage"),
                jsonfeatures = Radio.request("ModelList", "getLayerFeaturesInExtent", this.getLayerId());

            this.setFeaturesInExtent(jsonfeatures, featuresPerPage);
        },

        // getter for featuresInExtent
        getFeaturesInExtent: function () {
            return this.get("featuresInExtent");
        },

        // setter for featuresInExtent
        setFeaturesInExtent: function (jsonFeaturesInExtent, number) {
            var totalFeatures = jsonFeaturesInExtent.length,
                number = totalFeatures < number ? totalFeatures : number,
                jsonFeatures = _.last(jsonFeaturesInExtent, number),
                features = [];

            _.each(jsonFeatures, function (jsonFeature) {
                features.push(JSON.parse(jsonFeature));
            });

            this.set("featuresInExtent", features);
            this.set("totalFeaturesInPage", number);
            this.trigger("render");
        },

        // getter for glyphicon
        getGlyphicon: function () {
            return this.get("glyphicon");
        },
        // setter for glyphicon
        setGlyphicon: function (value) {
            this.set("glyphicon", value);
        },

        // getter for display
        getDisplay: function () {
            return this.get("display");
        },
        // setter for display
        setDisplay: function (value) {
            this.set("display", value);
        },

        // getter for layerId
        getLayerId: function () {
            return this.get("layerId");
        },
        // setter for layerId
        setLayerId: function (value) {
            this.set("layerId", value);
        },
        // getter for errortxt
        getErrortxt: function () {
            return this.get("errortxt");
        },
        // setter for errortxt
        setErrortxt: function (value) {
            this.set("errortxt", value);
        },

        // setter für featuresPerPage
        setFeaturesPerPage: function (value) {
            this.set("featuresPerPage", value);
        },
        // getter für featuresPerPage
        getFeaturesPerPage: function () {
            return this.get("featuresPerPage");
        },

        mouseHoverSelected: function (evt) {
            _.each(evt.selected, function (feature) {
                var isClusterFeature = feature.get("features") ? true : null;

                if (isClusterFeature) {
                    _.each(feature.get("features"), function (subfeature) {
                        this.trigger("highlightItem", subfeature.getId());
                    }, this);
                }
                else {
                    this.trigger("highlightItem", feature.getId());
                }
            }, this);

            _.each(evt.deselected, function (feature) {
                var isClusterFeature = feature.get("features") ? true : null;

                if (isClusterFeature) {
                    _.each(feature.get("features"), function (subfeature) {
                        this.trigger("lowlightItem", subfeature.getId());
                    }, this);
                }
                else {
                    this.trigger("lowlightItem", feature.getId());
                }
            }, this);
        },

        triggerMouseHoverById: function (id) {
            var features = this.get("featuresInExtent"),
                feature = _.find(features, function (feat) {
                    return feat.id.toString() === id;
                }),
                coord = feature ? feature.geometry.coordinates : null;

            if (coord) {
                Radio.trigger("MouseHover", "hoverByCoordinates", coord);
            }
        },

        triggerMouseHoverLeave: function () {
            Radio.trigger("MouseHover", "destroy");
        }
    });

    return SimpleListerModel;
});
