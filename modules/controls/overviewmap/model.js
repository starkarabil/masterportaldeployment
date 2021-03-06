import ImageWMS from "ol/source/ImageWMS.js";
import Image from "ol/layer/Image.js";
import View from "ol/View.js";
import {OverviewMap} from "ol/control.js";

const OverviewMapModel = Backbone.Model.extend(/**@lends OverviewMapModel.prototype */{
    defaults: {
        baselayer: "",
        newOvmView: ""
    },
    /**
     * @class OverviewMapModel
     * @memberof Controls.Overviewmap
     * @extends Backbone.Model
     * @constructs
     * @fires Map#RadioRequestMapGetMap
     * @fires MapView#RadioRequestMapViewGetResolutions
     * @fires Parser#RadioRequestParserGetItemByAttributes
     * @fires Parser#RadioRequestParserGetInitVisibBaseLayer
     * @fires Map#RadioTriggerMapAddControl
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerWhere
     * @fires AlertingModel#RadioTriggerAlertAlert
     */
    initialize: function () {
        var map = Radio.request("Map", "getMap"),
            maxResolution = _.first(Radio.request("MapView", "getResolutions")),
            mapView = map.getView(),
            layers = map.getLayers().getArray(),
            ovmConfig = Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}),
            ovmConfigRes = _.isUndefined(ovmConfig) === false ? ovmConfig.attr : ovmConfig,
            initVisibBaselayer = Radio.request("Parser", "getInitVisibBaselayer"),
            initVisibBaselayerId = _.isUndefined(initVisibBaselayer) === false ? initVisibBaselayer.id : initVisibBaselayer,
            newOlView;

        newOlView = new View({
            center: mapView.getCenter(),
            projection: mapView.getProjection(),
            resolution: mapView.getResolution(),
            resolutions: [ovmConfigRes.resolution ? ovmConfigRes.resolution : maxResolution]
        });
        this.setNewOvmView(newOlView);
        this.setBaselayer(ovmConfigRes.baselayer ? this.getBaseLayerFromCollection(layers, ovmConfigRes.baselayer) : this.getBaseLayerFromCollection(layers, initVisibBaselayerId));
        if (_.isUndefined(this.get("baselayer")) === false) {
            Radio.trigger("Map", "addControl", this.newOverviewmap());
        }
        else {
            $("#overviewmap").remove();
        }
    },

    /**
     * Creates a new overview map.
     * @returns {ol/control/OverviewMap} - The generated overview map.
     */
    newOverviewmap: function () {
        var overviewmap = new OverviewMap({
            collapsible: false,
            className: "ol-overviewmap ol-custom-overviewmap",
            target: "overviewmap",
            layers: [
                this.getOvmLayer(this.get("baselayer"))
            ],
            view: this.get("newOvmView")
        });

        return overviewmap;
    },

    /**
     * @description Derives the baselayer from the given layer collection
     * @param {Layer[]} layers The Array of layers
     * @param {string} baselayer The id of the baselayer
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerWhere
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @returns {object} - Baselayer params.
     */
    getBaseLayerFromCollection: function (layers, baselayer) {
        var modelFromCollection,
            baseLayerParams;

        modelFromCollection = Radio.request("RawLayerList", "getLayerWhere", {id: baselayer});
        if (_.isUndefined(modelFromCollection) === false) {
            baseLayerParams = {
                layerUrl: modelFromCollection.get("url"),
                params: {
                    t: new Date().getMilliseconds(),
                    zufall: Math.random(),
                    LAYERS: modelFromCollection.get("layers"),
                    FORMAT: modelFromCollection.get("format") === "nicht vorhanden" ? "image/png" : modelFromCollection.get("format"),
                    VERSION: modelFromCollection.get("version"),
                    TRANSPARENT: modelFromCollection.get("transparent").toString()
                }
            };

            return baseLayerParams;
        }

        Radio.trigger("Alert", "alert", "Die Overviewmap konnte nicht erstellt werden da kein Layer f??r die angegebene ID gefunden wurde. (" + baselayer + ")");

        return undefined;


    },

    /**
     * Creates the layer for the overview map
     * @param {string} baselayer Id of baselayer
     * @returns {ol/Image} - The open layer image layer
     */
    getOvmLayer: function (baselayer) {
        var imageLayer;

        if (baselayer instanceof Image === false) {
            imageLayer = new Image({
                source: new ImageWMS({
                    url: baselayer.layerUrl,
                    params: baselayer.params
                })
            });
        }

        return imageLayer;
    },

    // setter for baselayer
    setBaselayer: function (value) {
        this.set("baselayer", value);
    },

    // setter for newOvmView
    setNewOvmView: function (value) {
        this.set("newOvmView", value);
    }

});

export default OverviewMapModel;
