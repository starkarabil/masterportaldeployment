define([

], function () {

    var
        SimpleLister;

    SimpleLister = Backbone.Model.extend({
        defaults: {
            featuresInExtent: []
        },

        initialize: function () {
        },

        getLayerFeaturesInExtent: function (name) {
            var features = Radio.request("ModelList", "getLayerFeaturesInExtent", name),
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
    }
    });

    return SimpleLister;
});
