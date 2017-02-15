define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        BaselayerToggleModel;
    "use strict";

    BaselayerToggleModel = Backbone.Model.extend({
        defaults: {
            baselayerArray: Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true}),
            activeBaseLayer: Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true, isVisibleInMap: true})[0],
            nextBaseLayer: ""
        },
        initialize: function () {
            this.findNextBaselayer();
            this.listenTo(Radio.channel("BaselayerToggle"), {
                "layerChanged": this.layerChanged
            });
        },
        layerChanged: function () {
            var activeBaseLayer = Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true, isVisibleInMap: true})[0];

            if (_.isUndefined(activeBaseLayer) === false) {
                this.set("activeBaseLayer", activeBaseLayer);
                this.findNextBaselayer();
            }
        },
        findNextBaselayer: function () {
            var activeLayerId = this.get("activeBaseLayer").id,
                baselayerArray = this.get("baselayerArray"),
                baselayerArrayLength = baselayerArray.length,
                activeLayerIndex = _.findIndex(baselayerArray, function (lay) {
                     return lay.id === activeLayerId;
                }),
                nextLayerIndex = activeLayerIndex >= baselayerArrayLength - 1 ? 0 : activeLayerIndex + 1,
                nextBaseLayer = baselayerArray[nextLayerIndex];

            this.set("nextBaseLayer", nextBaseLayer);
        },
        baselayerToggle: function () {
            var activeBaseLayer = this.get("activeBaseLayer"),
                nextBaseLayer = this.get("nextBaseLayer");

            this.set("activeBaseLayer", nextBaseLayer);
            this.findNextBaselayer();
            this.triggerLayerVisibility(nextBaseLayer.get("name"), activeBaseLayer.get("name"));
        },
        triggerLayerVisibility: function (showLayerName, hideLayerName) {
            Radio.trigger("ModelList", "showLayers", [showLayerName]);
            Radio.trigger("ModelList", "hideLayers", [hideLayerName]);
        }
    });

    return new BaselayerToggleModel();
});
