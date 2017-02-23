define(function () {

    var RemoteInterface = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("RemoteInterface");

            channel.reply({
                "getCenter": this.getCenter,
                "getMapState": this.getMapState,
                "getDragMarkerPosition": this.getDragMarkerPosition,
                "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX,
                "getZoomLevel": this.getZoomLevel,
                "getVisibleBaseLayers": this.getVisibleBaseLayers,
                "getAllBaseLayers": this.getAllBaseLayers,
                "getLayerFeaturesInExtent": this.getLayerFeaturesInExtent
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
                "updateMapSize": this.updateMapSize,
                "zoomToFeature": this.zoomToFeature,
                "zoomToFeatures": this.zoomToFeatures,
                "showLayers": this.showLayers,
                "showDragMarker": this.showDragMarker,
                "hideDragMarker": this.hideDragMarker,
                "requestDragMarkerAddress": this.requestDragMarkerAddress
            }, this);

            Radio.on("Map", "changedExtent", this.changedExtent);
            Radio.on("DragMarker", "newAddress", this.newDragMarkerAddress);
        },

        showDragMarker: function () {
            Radio.trigger("DragMarker", "show");
        },

        hideDragMarker: function () {
            Radio.trigger("DragMarker", "hide");
        },

        getLayerFeaturesInExtent: function (name) {
            return Radio.request("ModelList", "getLayerFeaturesInExtent", name);
        },

        showAllFeatures: function (name) {
            Radio.trigger("ModelList", "showAllFeatures", name);
        },

        hideAllFeatures: function (name) {
            Radio.trigger("ModelList", "hideAllFeatures", name);
        },

        showFeatures: function (name, featureIds) {
            Radio.trigger("ModelList", "showFeaturesByIds", name, featureIds);
        },

        hideFeatures: function (name, featureIds) {
            Radio.trigger("ModelList", "hideFeaturesByIds", name, featureIds);
        },

        addFeatures: function (features, name) {
            Radio.trigger("AddGeoJSON", "addFeatures", features, name);
        },

        getVisibleBaseLayers: function () {
            return Radio.request("ModelList", "getVisibleBaseLayers");
        },

        getAllBaseLayers: function () {
            return Radio.request("ModelList", "getAllBaseLayers");
        },

        getCenter: function () {
            return Radio.request("MapView", "getCenter");
        },

        getMapState: function () {
            return Radio.request("SaveSelection", "getMapState");
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

        updateMapSize: function () {
            Radio.trigger("Map", "updateSize");
        },

        zoomToFeature: function (feature) {
            Radio.trigger("MapView", "zoomToFeature", feature);
        },

        zoomToFeatures: function (features) {
            Radio.trigger("MapView", "zoomToFeatures", features);
        },

        changedExtent: function (extent) {
            Radio.trigger("RemoteInterface", "changedExtent", extent);
        },

        newDragMarkerAddress: function (dragMarkerAddress) {
            Radio.trigger("RemoteInterface", "newDragMarkerAddress", dragMarkerAddress);
        },

        requestDragMarkerAddress: function () {
            Radio.trigger("DragMarker", "requestAddress");
        }
    });

    return RemoteInterface;
});
