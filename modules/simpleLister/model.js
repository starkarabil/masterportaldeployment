define([

], function () {

    var
        SimpleLister;

    SimpleLister = Backbone.Model.extend({
        defaults: {
            featuresInExtent: [],
            featuresPerPage: 20,
            glyphicon: "glyphicon-chevron-right",
            display: "none"
        },

        initialize: function () {
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
                featuresObj = [];

            _.each(features, function (feature) {
                featuresObj.push(JSON.parse(feature));
            });
            this.setFeaturesInExtent(featuresObj);
        },

        // getter for featuresInExtent
        getFeaturesInExtent: function () {
            return this.get("featuresInExtent");
        },

        // setter for featuresInExtent
        setFeaturesInExtent: function (value) {
            this.set("featuresInExtent", value);
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
        }
    });

    return SimpleLister;
});
