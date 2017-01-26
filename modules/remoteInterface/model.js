define(function () {

    var RemoteInterface = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("RemoteInterface");

            channel.reply({
                "getCenter": this.getCenter,
                "getMapState": this.getMapState,
                "getMeldePinAddress": this.getMeldePinAddress,
                "getMeldePinPosition": this.getMeldePinPosition,
                "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX,
                "getZoomLevel": this.getZoomLevel
            }, this);

            channel.on({
                "addFeatures": this.addFeatures,
                "hideAllFeatures": this.showAllFeatures,
                "hideFeatures": this.showFeatures,
                "hideLayer": this.hideLayer,
                "hideMapMarker": this.hideMapMarker,
                "setCenter": this.setCenter,
                "setMeldePinPosition": this.setMeldePinPosition,
                "setZoomLevel": this.setZoomLevel,
                "showAllFeatures": this.showAllFeatures,
                "showFeatures": this.showFeatures,
                "showLayer": this.showLayer,
                "showMapMarker": this.showMapMarker,
                "zoomToFeature": this.zoomToFeature,
                "zoomToFeatures": this.zoomToFeatures
            }, this);
        },

        addFeatures: function (features, name) {
            Radio.trigger("AddFeatures", "addFeatures", features, name);
        },

        getCenter: function () {
            return Radio.request("MapView", "getCenter");
        },

        getMapState: function () {
            return Radio.request("SaveSelection", "getMapState");
        },

        getMeldePinAddress: function () {
            return Radio.request("DragMarker", "getNearestAddress");
        },

        getMeldePinPosition: function () {
            return Radio.request("DragMarker", "getCenter");
        },

        getWGS84MapSizeBBOX: function () {
            return Radio.request("Map", "getWGS84MapSizeBBOX");
        },

        getZoomLevel: function () {
            return Radio.request("MapView", "getZoomLevel");
        },

        hideLayer: function (value) {
            Radio.trigger("ModelList", "hideLayer", value);
        },

        hideMarker: function () {
            Radio.trigger("MapMarker", "hideMarker");
        },

        setZoomLevel: function (value) {
            Radio.trigger("MapView", "setZoomLevel", value);
        },

        setCenter: function (value) {
            Radio.trigger("MapView", "setCenter", value);
        },

        setMeldePinPosition: function (coordinate) {
            Radio.trigger("DragMarker", "setCenter", coordinate);
        },

        showLayer: function (value) {
            Radio.trigger("ModelList", "showLayer", value);
        },

        showMarker: function (value) {
            Radio.trigger("MapMarker", "showMarker", value);
        },

        zoomToFeature: function (feature) {
            Radio.trigger("MapView", "zoomToFeature", feature);
        },

        zoomToFeatures: function (features) {
            Radio.trigger("MapView", "zoomToFeatures", features);
        }
    });

    return RemoteInterface;
});
