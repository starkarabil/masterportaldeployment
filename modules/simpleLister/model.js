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
            glyphicon: "glyphicon-chevron-right",
            display: "none"
        },

        initialize: function () {
            Radio.on("MouseHover", "selected", this.mouseHoverSelected, this);
            Radio.trigger("Map", "registerListener", "moveend", this.getLayerFeaturesInExtent, this);
            this.getParams();
        },
        getParams: function () {
            var simpleLister = Radio.request("Parser","getPortalConfig").simpleLister;

            this.setLayerId(simpleLister.layerId);
            this.setErrortxt(simpleLister.errortxt || "Keine Features im Kartenausschnitt");
            this.setFeaturesPerPage(simpleLister.featuresPerPage);
        },

        getLayerFeaturesInExtent: function () {
            var features = Radio.request("ModelList", "getLayerFeaturesInExtent", this.getLayerId()),
                featuresPerPage =  this.get("featuresPerPage");

            this.setFeaturesInExtent(features, featuresPerPage);
        },

        // put more Features in List
        appendFeatures: function () {
            var features = Radio.request("ModelList", "getLayerFeaturesInExtent", this.getLayerId()),
                number =  this.get("featuresPerPage") + this.get("totalFeaturesInPage");

            this.setFeaturesInExtent(features, number);
        },

        // getter for featuresInExtent
        getFeaturesInExtent: function () {
            return this.get("featuresInExtent");
        },

        // setter for featuresInExtent
        setFeaturesInExtent: function (features, number) {
            var featuresObj = _.last(features, number);

            this.set("featuresInExtent", featuresObj);
            this.set("totalFeaturesInPage", number);
        },

        // getter for glyphicon
        getGlyphicon: function () {
            return this.get("glyphicon");
        },
        // setter for glyphicon
        setGlyphicon: function (value) {
            this.set("glyphicon",value);
        },

        // getter for display
        getDisplay: function () {
            return this.get("display");
        },
        // setter for display
        setDisplay: function (value) {
            this.set("display",value);
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
                var selLayer = evt.target.getLayer(feature),
                    isClusterFeature = selLayer ? selLayer.getSource() instanceof ol.source.Cluster : null;

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
                var selLayer = evt.target.getLayer(feature),
                    isClusterFeature = selLayer ? selLayer.getSource() instanceof ol.source.Cluster : null;

                if (isClusterFeature) {
                    _.each(feature.get("features"), function (subfeature) {
                        this.trigger("lowlightItem", subfeature.getId());
                    }, this);
                }
                else {
                    this.trigger("lowlightItem", feature.getId());
                }
            }, this);
        }
    });

    return SimpleListerModel;
});
