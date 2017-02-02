define(function () {

    var RemoteInterface = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("RemoteInterface");

            channel.reply({
                "getCenter": this.getCenter,
                "getMapState": this.getMapState,
                "getDragMarkerAddress": this.getDragMarkerAddress,
                "getDragMarkerPosition": this.getDragMarkerPosition,
                "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX,
                "getZoomLevel": this.getZoomLevel,
                "getBaseLayers": this.getBaseLayers
            }, this);

            channel.on({
                "addFeatures": this.addFeatures,
                "hideAllFeatures": this.hideAllFeatures,
                "hideFeatures": this.hideFeatures,
                "hideLayers": this.hideLayers,
                "hideMapMarker": this.hideMapMarker,
                "setCenter": this.setCenter,
                "setDragMarkerPosition": this.setDragMarkerPosition,
                "setZoomLevel": this.setZoomLevel,
                "showAllFeatures": this.showAllFeatures,
                "showFeatures": this.showFeatures,
                "showLayer": this.showLayer,
                "showMapMarker": this.showMapMarker,
                "zoomToFeature": this.zoomToFeature,
                "zoomToFeatures": this.zoomToFeatures,
                "showLayers": this.showLayers
            }, this);

            Radio.on("Map", "changedExtent", this.changedExtent)
        },
        showAllFeatures: function (name) {
            Radio.trigger("ModelList","showAllFeatures", name);
        },
        hideAllFeatures: function (name) {
            Radio.trigger("ModelList","hideAllFeatures", name);
        },
        showFeatures: function (name, featureIds) {
            Radio.trigger("ModelList","showFeaturesByIds", name, featureIds);
        },
        hideFeatures: function (name, featureIds) {
            Radio.trigger("ModelList","hideFeaturesByIds", name, featureIds);
        },

        addFeatures: function (features, name) {
            Radio.trigger("AddGeoJSON", "addFeatures", features, name);
        },

        // getter for baseLayers
        getBaseLayers: function () {
            return Radio.request("ModelList", "getBaseLayers");
        },
        // setter for Layers
        showLayers: function (layerNames) {
            return Radio.request("Map", "showLayers", layerNames);
        },
        getCenter: function () {
            return Radio.request("MapView", "getCenter");
        },

        getMapState: function () {
            return Radio.request("SaveSelection", "getMapState");
        },

        getDragMarkerAddress: function () {
            return Radio.request("DragMarker", "getNearestAddress");
        },

        getDragMarkerPosition: function () {
            return Radio.request("DragMarker", "getPosition");
        },

        getWGS84MapSizeBBOX: function () {
            return Radio.request("Map", "getWGS84MapSizeBBOX");
        },

        getZoomLevel: function () {
            return Radio.request("MapView", "getZoomLevel");
        },

        hideLayers: function (value) {
            Radio.trigger("ModelList", "hideLayers", value);
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

        setDragMarkerPosition: function (coordinate) {
            Radio.trigger("DragMarker", "setPosition", coordinate);
        },

        showLayer: function (value) {
            Radio.trigger("ModelList", "showLayer", value);
        },

        showMarker: function (value) {
            Radio.trigger("MapMarker", "showMarker", value);
        },
        showLayers: function (layerNames) {
            Radio.trigger("ModelList", "showLayers", layerNames);
        },
        zoomToFeature: function (feature) {
            Radio.trigger("MapView", "zoomToFeature", feature);
        },
        zoomToFeatures: function (features) {
            Radio.trigger("MapView", "zoomToFeatures", features);
        },
        changedExtent: function (extent) {
            Radio.trigger("RemoteInterface", "changedExtent", extent);
        }
    });

    return RemoteInterface;
});
