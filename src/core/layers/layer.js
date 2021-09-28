import store from "../../app-store";

export default function Layer (attrs, layer, initialize = true) {
    const defaults = {
        hitTolerance: 0,
        isNeverVisibleInTree: false,
        isRemovable: false,
        isSelected: false,
        isSettingVisible: false,
        isVisibleInMap: false,
        layerInfoClicked: false,
        singleBaselayer: false,
        legend: true,
        maxScale: "1000000",
        minScale: "0",
        selectionIDX: 0,
        showSettings: true,
        styleable: false,
        supported: ["2D"],
        transparency: 0,
        isOutOfRange: undefined,
        isSecured: false,
        singleBaselayer: false,
        domId: "layer-list-group-item-" + attrs.id,
        showTopicText: i18next.t("common:tree.showTopic"),
        removeTopicText: i18next.t("common:tree.removeTopicText"),
        changeClassDivisionText: i18next.t("common:tree.changeClassDivision"),
        transparencyText: i18next.t("common:tree.transparency"),
        increaseTransparencyText: i18next.t("common:tree.increaseTransparency"),
        reduceTransparencyText: i18next.t("common:tree.reduceTransparency"),
        removeLayerText: i18next.t("common:tree.removeLayer"),
        levelUpText: i18next.t("common:tree.levelUp"),
        levelDownText: i18next.t("common:tree.levelDown"),
        settingsText: i18next.t("common:tree.settings"),
        infosAndLegendText: i18next.t("common:tree.infosAndLegend")
    };

    this.layer = layer;
    this.attributes = {...Object.assign({}, this.layer.values_, defaults, attrs)};
    delete this.attributes.source;
    if (initialize) {
        this.initialize(attrs);
    }
    else if (attrs.isSelected === true || Radio.request("Parser", "getTreeType") === "light") {
        this.setIsVisibleInMap(typeof attrs.isSelected !== "boolean" ? false : attrs.isSelected);
    }
    this.checkForScale(Radio.request("MapView", "getOptions"));
    this.registerInteractionMapViewListeners();
}

Layer.prototype.initialize = function (attrs) {
    if (store.state.configJson.Portalconfig.singleBaselayer !== undefined) {
        this.set("singleBaselayer", store.state.configJson.Portalconfig.singleBaselayer);
    }

    if (attrs.isSelected === true || Radio.request("Parser", "getTreeType") === "light") {
        this.updateLayerTransparency();
        // this.initResolutions();
        this.setIsVisibleInMap(typeof attrs.isSelected !== "boolean" ? false : attrs.isSelected);
        this.set("isRemovable", Radio.request("Parser", "getPortalConfig").layersRemovable);
        Radio.request("Map", "getMap").addLayer(this.layer);
    }
    else {
        this.layer.setVisible(false);
    }
    // this.initResolutions();
};
Layer.prototype.createLayer = function () {
    // do in children
    console.warn("function Layer.createLayer must be overwritten in extended layers!");
};
/**
* Register interaction with map view. Listens to change of cale.
* @listens Core#RadioTriggerMapViewChangedOptions
* @returns {void}
*/
Layer.prototype.registerInteractionMapViewListeners = function () {
    Radio.channel("MapView").on({
        "changedOptions": function (options) {
            this.checkForScale(options);
        }
    }, this);
};


Layer.prototype.initResolutions = function () {
    const resoByMaxScale = Radio.request("MapView", "getResoByScale", this.get("maxScale"), "max"),
        resoByMinScale = Radio.request("MapView", "getResoByScale", this.get("minScale"), "min");

    this.setMaxResolution(resoByMaxScale + (resoByMaxScale / 100));
    this.setMinResolution(resoByMinScale);
},
Layer.prototype.setMaxResolution = function (value) {
    this.layer.setMaxResolution(value);
};
Layer.prototype.setMinResolution = function (value) {
    this.layer.setMinResolution(value);
};
Layer.prototype.removeLayer = function () {
    const map = Radio.request("Map", "getMap");

    this.setIsVisibleInMap(false);
    Radio.trigger("ModelList", "removeLayerById", this.layer.get("id"));
    map.removeLayer(this.layer);
};
Layer.prototype.createLegend = function () {
    createLegend(this.layer);
};
Layer.prototype.toggleIsSelected = function () {
    this.setIsSelected(this.attributes.isSelected === undefined ? true : !this.attributes.isSelected);
};

/**
 * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
 * @param {object} options -
 * @returns {void}
 **/
Layer.prototype.checkForScale = function (options) {
    const lastValue = this.set("isOutOfRange");

    if (options && parseFloat(options.scale, 10) <= parseInt(this.get("maxScale"), 10) && parseFloat(options.scale, 10) >= parseInt(this.get("minScale"), 10)) {
        this.set("isOutOfRange", false);
        if (lastValue !== false) {
            Radio.trigger("Menu", "change:isOutOfRange", this, false);
        }
    }
    else {
        this.set("isOutOfRange", true);
        if (lastValue !== true) {
            Radio.trigger("Menu", "change:isOutOfRange", this, true);
        }
    }
};
/**
 * If a single WMS-T is shown: Remove the TimeSlider.
 * If two WMS-T are shown: Remove the LayerSwiper; depending if the original layer was closed, update the layer with a new time value.
 *
 * @returns {void}
 */
Layer.prototype.removeTimeLayer = function () {
    const id = this.get("id");

    // If the swiper is active, two WMS-T are currently active
    if (store.getters["WmsTime/layerSwiper"].active) {
        if (!id.endsWith(store.getters["WmsTime/layerAppendix"])) {
            this.setIsSelected(true);
        }
        store.dispatch("WmsTime/toggleSwiper", id);
    }
    else {
        store.commit("WmsTime/setTimeSliderActive", {active: false, currentLayerId: ""});
    }
};
Layer.prototype.setIsVisibleInMap = function (newValue) {
    this.set("isVisibleInMap", newValue);
    this.layer.setVisible(newValue);
    console.log("setvisible:", newValue);
};
Layer.prototype.setTransparency = function (newValue) {
    const opacity = (100 - newValue) / 100;

    this.set("transparency", newValue);
    this.layer.setOpacity(opacity);
};
Layer.prototype.decTransparency = function () {
    const transparency = parseInt(this.get("transparency"), 10);

    if (transparency <= 100 && transparency > 0) {
        this.setTransparency(transparency - 10);
        Radio.trigger("Menu", "rerender");
        Radio.trigger("MenuSelection", "rerender");
    }
};
Layer.prototype.incTransparency = function () {
    const transparency = parseInt(this.get("transparency"), 10);

    if (transparency <= 90) {
        this.setTransparency(transparency + 10);
        Radio.trigger("Menu", "rerender");
        Radio.trigger("MenuSelection", "rerender");
    }
};
Layer.prototype.updateLayerTransparency = function () {
    const opacity = (100 - this.get("transparency")) / 100;

    // Auch wenn die Layer im simple Tree noch nicht selected wurde können
    // die Settings angezeigt werden. Das Layer objekt wurden dann jedoch noch nicht erzeugt und ist undefined
    this.layer.setOpacity(opacity);
};
Layer.prototype.setIsVisibleInTree = function (newValue) {
    this.set("isVisibleInTree", newValue);
    Radio.trigger("Menu", "change:isVisibleInTree", this);
};
Layer.prototype.resetSelectionIDX = function () {
    this.setSelectionIDX(0);
};
Layer.prototype.setSelectionIDX = function (newValue) {
    this.set("selectionIDX", newValue);
};
Layer.prototype.getOpacity = function () {
    return this.layer.getOpacity();
};
Layer.prototype.getVisible = function () {
    return this.layer.getVisible();
};
Layer.prototype.setIsSettingVisible = function (newValue) {
    this.set("isSettingVisible", newValue);
};
Layer.prototype.toJSON = function () {
    return JSON.parse(JSON.stringify(this.attributes));
};
Layer.prototype.setIsExpanded = function (newValue) {
    this.set("isExpanded", newValue);
};
Layer.prototype.getSource = function () {
    return this.layer.getSource();
};
Layer.prototype.set = function (arg1, arg2) {
    if (typeof arg1 === "object") {
        Object.keys(arg1).forEach(key => {
            this.attributes[key] = arg1[key];
        });
    }
    else if (typeof arg1 === "string") {
        this.attributes[arg1] = arg2;
    }
};
Layer.prototype.get = function (key) {
    if (key === "layer") {
        return this.layer;
    }
    else if (key === "layerSource") {
        return this.layer.getSource();
    }
    return this.attributes[key];
};
Layer.prototype.has = function (key) {
    return this.attributes[key] !== undefined;
};
Layer.prototype.getLayerStatesArray = function () {
    return this.layer.getLayerStatesArray();
};
Layer.prototype.setLayerInfoChecked = function (newValue) {
    this.set("layerInfoChecked", newValue);
};
Layer.prototype.toggleIsSettingVisible = function () {
    const layers = Radio.request("ModelList", "getCollection"),
        oldValue = this.attributes.isSettingVisible;

    layers.setIsSettingVisible(false);
    this.setIsSettingVisible(!oldValue);
    Radio.trigger("Menu", "renderSetting");
    Radio.trigger("MenuSelection", "renderSetting");
};
Layer.prototype.setIsSelected = function (newValue) {
    const map = Radio.request("Map", "getMap"),
        treeType = Radio.request("Parser", "getTreeType");

    this.set("isSelected", newValue);
    handleSingleBaseLayer(newValue, this, map);
    this.setIsVisibleInMap(newValue);
    if (treeType !== "light") {
        this.resetSelectionIDX();
    }

    if (newValue) {
        console.log("addLayerToIndex layer:", this.layer, "  index:", this.get("selectionIDX"));
        Radio.trigger("Map", "addLayerToIndex", [this.layer, this.get("selectionIDX")]);
    }
    else {
        console.log("remove layer:", this.layer.get("name"));
        map.removeLayer(this.layer);
    }
    if (treeType !== "light") {
        Radio.trigger("ModelList", "updateLayerView");
        Radio.trigger("ModelList", "updateSelection", this);
        Radio.trigger("Menu", "rerender");
    }
};
/**
* Toggles the attribute isVisibleInMap
* @return {void}
*/
Layer.prototype.toggleIsVisibleInMap = function () {
    if (this.get("isVisibleInMap") === true) {
        this.setIsVisibleInMap(false);
    }
    else {
        this.setIsSelected(true);
    }
    if (Radio.request("Parser", "getTreeType") !== "light") {
        Radio.trigger("MenuSelection", "rerender");
        // todo braucht man das?
        // Radio.trigger("Layer", "layerVisibleChanged", this.get("id"), this.get("isVisibleInMap"), this);
    }
};
Layer.prototype.updateLayerSource = function () {
    const layer = Radio.request("Map", "getLayerByName", this.get("name"));

    if (this.get("layerSource") !== null) {
        layer.setSource(this.get("layerSource"));
        layer.getSource().refresh();
    }
};
Layer.prototype.changeLang = function (lng) {
    this.attributes.selectedTopicsText = i18next.t("common:tree.removeSelection");
    // this.layer.values_.selectedTopicsText= i18next.t("common:tree.removeSelection");
    this.attributes.infosAndLegendText = i18next.t("common:tree.infosAndLegend");
    // this.layer.values_.infosAndLegendText= i18next.t("common:tree.infosAndLegend");
    this.attributes.removeTopicText = i18next.t("common:tree.removeTopic");
    // this.layer.values_.removeTopicText= i18next.t("common:tree.removeTopic"),
    this.attributes.showTopicText = i18next.t("common:tree.showTopic");
    // this.layer.values_.showTopicText= i18next.t("common:tree.showTopic");
    this.attributes.securedTopicText = i18next.t("common:tree.securedTopic");
    // this.layer.values_.securedTopicText= i18next.t("common:tree.securedTopic");
    this.attributes.changeClassDivisionText = i18next.t("common:tree.changeClassDivision");
    // this.layer.values_.changeClassDivisionText= i18next.t("common:tree.changeClassDivision");
    this.attributes.settingsText = i18next.t("common:tree.settings");
    // this.layer.values_.settingsText= i18next.t("common:tree.settings");
    this.attributes.increaseTransparencyText = i18next.t("common:tree.increaseTransparency");
    // this.layer.values_.increaseTransparencyText= i18next.t("common:tree.increaseTransparency");
    this.attributes.reduceTransparencyText = i18next.t("common:tree.reduceTransparency");
    // this.layer.values_.reduceTransparencyText= i18next.t("common:tree.reduceTransparency");
    this.attributes.removeLayerText = i18next.t("common:tree.removeLayer");
    // this.layer.values_.removeLayerText= i18next.t("common:tree.removeLayer");
    this.attributes.levelUpText = i18next.t("common:tree.levelUp");
    // this.layer.values_.levelUpText= i18next.t("common:tree.levelUp");
    this.attributes.levelDownText = i18next.t("common:tree.levelDown");
    // this.layer.values_.levelDownText= i18next.t("common:tree.levelDown");
    this.attributes.transparencyText = i18next.t("common:tree.transparency");
    // this.layer.values_.transparencyText= i18next.t("common:tree.transparency");
// todo ind: translate name, key is defined in config.json
// if (layer.has("i18nextTranslate") && typeof layer.get("i18nextTranslate") === "function") {
//     layer.get("i18nextTranslate")(function (key, value) {
//         if (!model.has(key) || typeof value !== "string") {
//             return;
//         }
//         model.set(key, value);
//     });
// }
};
Layer.prototype.moveDown = function () {
    Radio.trigger("ModelList", "moveModelInTree", this, -1);
};
Layer.prototype.moveUp = function () {
    Radio.trigger("ModelList", "moveModelInTree", this, 1);
};

function handleSingleBaseLayer (isSelected, wmsLayer, map) {
    const id = wmsLayer.get("id"),
        layerGroup = Radio.request("ModelList", "getModelsByAttributes", {parentId: wmsLayer.get("parentId")}),
        singleBaselayer = wmsLayer.get("singleBaselayer") && wmsLayer.get("parentId") === "Baselayer",
        timeLayer = wmsLayer.get("typ") === "WMS" && wmsLayer.get("time");

    if (isSelected) {
        // This only works for treeType 'custom', otherwise the parentId is not set on the layer
        if (singleBaselayer) {
            layerGroup.forEach(layer => {
                // folders parentId is baselayer too, but they have not a function checkForScale
                if (layer.get("id") !== id && typeof layer.checkForScale === "function") {
                    layer.set({"isSelected": false});
                    layer.set({"isVisibleInMap": false});
                    if (layer.get("layer") !== undefined) {
                        layer.get("layer").setVisible(false);
                    }
                    map.removeLayer(layer.get("layer"));
                    // This makes sure that the Oblique Layer, if present in the layerList, is not selectable if switching between baseLayers
                    layer.checkForScale(Radio.request("MapView", "getOptions"));
                }
            });
            Radio.trigger("Menu", "rerender");
        }
        if (timeLayer) {
            store.commit("WmsTime/setTimeSliderActive", {active: true, currentLayerId: id});
        }
    }
    else if (timeLayer) {
        this.removeTimeLayer();
    }
}

/**
 * Initiates the presentation of layer information.
 * @returns {void}
 */
Layer.prototype.showLayerInformation = function () {
    let cswUrl = null,
        showDocUrl = null,
        layerMetaId = null;

    if (this.get("datasets") && Array.isArray(this.get("datasets")) && this.get("datasets")[0] !== null && typeof this.get("datasets")[0] === "object") {
        cswUrl = this.get("datasets")[0]?.csw_url ? this.get("datasets")[0].csw_url : null;
        showDocUrl = this.get("datasets")[0]?.show_doc_url ? this.get("datasets")[0].show_doc_url : null;
        layerMetaId = this.get("datasets")[0]?.md_id ? this.get("datasets")[0].md_id : null;
    }
    const metaID = [],
        name = this.get("name");

    metaID.push(layerMetaId);

    store.dispatch("LayerInformation/layerInfo", {
        "id": this.get("id"),
        "metaID": layerMetaId,
        "metaIdArray": metaID,
        "layername": name,
        "url": this.get("url"),
        "typ": this.get("typ"),
        "cswUrl": cswUrl,
        "showDocUrl": showDocUrl,
        "urlIsVisible": this.get("urlIsVisible")
    });

    store.dispatch("LayerInformation/activate", true);
    store.dispatch("LayerInformation/additionalSingleLayerInfo");
    store.dispatch("LayerInformation/setMetadataURL", layerMetaId);
    store.dispatch("Legend/setLayerIdForLayerInfo", this.get("id"));
    store.dispatch("Legend/setLayerCounterIdForLayerInfo", Date.now());
    this.createLegend();

    this.setLayerInfoChecked(true);
};

Layer.prototype.createLegend = function () {
    // do in children
    console.warn("function Layer.createLegend must be overwritten in extended layers!");
};

// backbone-relevant functions:
Layer.prototype.on = function () { };
Layer.prototype.off = function () { };
Layer.prototype.removeEventListener = function () { };
Layer.prototype.addEventListener = function () { };
Layer.prototype.trigger = function () { };
Layer.prototype.prepareLayerObject = function () { };
Layer.prototype.updateSource = function () { };
