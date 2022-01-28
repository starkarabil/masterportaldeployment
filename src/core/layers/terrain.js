import store from "../../app-store";
import {terrain} from "masterportalAPI/src";
import getProxyUrl from "../../../src/utils/getProxyUrl";
import mapCollection from "../../core/dataStorage/mapCollection.js";
import * as bridge from "./RadioBridge.js";
import Layer from "./layer";
/**
 * Creates a terrain-layer to display on 3D-map.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function TerrainLayer (attrs) {
    const defaults = {
        supported: ["3D"],
        showSettings: false,
        selectionIDX: -1,
        useProxy: false,
        legend: false,
        isOutOfRange: false
    };

    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    if (attrs.useProxy) {
        attrs.url = getProxyUrl(this.get("url"));
    }

    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);

    store.watch((state, getters) => getters["Map/mapMode"], mode => {
        if (mode === "3D") {
            this.setIsSelected(this.get("isVisibleInMap"));
        }
    }).bind(this);
}
// Link prototypes and add prototype methods, means TerrainLayer uses all methods and properties of Layer
TerrainLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates the layer as a simple object with one function 'setVisible' for calling 'setIsSelected'.
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
TerrainLayer.prototype.createLayer = function (attr) {
    this.layer = terrain.createLayer(attr);
    if (attr.isSelected) {
        this.setIsSelected(true, attr);
    }
};

/**
 * Calls the function setIsSelected.
 * @param {boolean} newValue if true, layer is selected
 * @returns {void}
 */
TerrainLayer.prototype.setVisible = function (newValue) {
    this.setIsSelected(newValue);
};

/**
 * Calls masterportalAPI's terrain-layer to set this layer visible.
 * @param {Boolean} newValue if true, layer is visible
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
TerrainLayer.prototype.setIsSelected = function (newValue, attr) {
    const map = mapCollection.getMap(store.state.Map.mapId, store.state.Map.mapMode);

    if (map && map.mode === "3D") {
        let isVisibleInMap = this.attributes ? this.get("isVisibleInMap") : false;

        if (!this.attributes && attr) {
            isVisibleInMap = attr.isVisibleInMap;
            attr.isSelected = newValue;
        }
        else {
            this.attributes.isSelected = newValue;
        }
        terrain.setVisible(newValue, this.attributes ? this.attributes : attr, map);
        if (isVisibleInMap) {
            this.createLegend();
        }
    }
};

/**
 * Creates the legend.
 * @returns {void}
 */
TerrainLayer.prototype.createLegend = function () {
    const styleModel = bridge.getStyleModelById(this.get("styleId"));
    let legend = this.get("legend");

    /**
     * @deprecated in 3.0.0
     */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "") {
            legend = true;
        }
        else if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }
    if (Array.isArray(legend)) {
        this.setLegend(legend);
    }
    else if (styleModel && legend === true) {
        this.setLegend(styleModel.getLegendInfos());
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};
/**
* Register interaction with map view. Listens to change of scale.
* @returns {void}
*/
TerrainLayer.prototype.registerInteractionMapViewListeners = function () {
    // no listeners shall be registered
};
/**
 * Transforms transparency into opacity and sets opacity on layer.
 * @return {void}
 */
TerrainLayer.prototype.updateLayerTransparency = function () {
    // not needed in 3D
};
/**
 * Sets visible min and max resolution on layer.
 * @returns {void}
 */
TerrainLayer.prototype.setMinMaxResolutions = function () {
    // not needed in 3D
};
/**
 * Checks whether the layer is visible or not based on the scale.
 * @param {object} options - of the map, contains scale of the map
 * @returns {void}
 **/
TerrainLayer.prototype.checkForScale = function () {
    // not needed in 3D
};
/**
 * Setter for transparency and setter for opacitiy of the layer.
 * @param {Number} newValue Tranparency in percent
 * @returns {void}
 */
TerrainLayer.prototype.setTransparency = function () {
    // not needed in 3D
};
