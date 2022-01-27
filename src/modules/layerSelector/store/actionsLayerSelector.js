import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import {Radio} from "backbone";
import store from "../../../app-store";
import globalGetters from "../../../app-store/getters";
import globalState from "../../../app-store/state";

/**
 * @const {String} configPaths an array of possible config locations. First one found will be used
 * @const {Object} actions vue actions
 */
const configPaths = [
        "configJs.layerSelector"
    ],
    actions = {
        /**
         * Sets the config-params of this layerselector into state.
         * @param {Object} context the context Vue instance
         * @returns {Boolean} false, if config does not contain the layerselector
         */
        initialize: context => {
            const cfg = fetchFirstModuleConfig(context, configPaths, "layerSelector");

            context.dispatch("fillConfig");

            context.dispatch("receiveEvents");

            return cfg;
        },

        /**
         * fills configs with the default values
         * @param {Object} context the context
         * @returns {void}
         */
        fillConfig: function ({state}) {
            const evts = state.events,
                defValues = state.default;

            evts.forEach((obj) => {
                if (obj.source) {
                    if (obj.showMenuInDesktopMode === undefined) {
                        obj.showMenuInDesktopMode = defValues.showMenuInDesktopMode;
                    }
                    if (obj.showLayerId === undefined) {
                        obj.showLayerId = defValues.showLayerId;
                    }
                    if (obj.deselectPreviousLayers === undefined) {
                        obj.deselectPreviousLayers = defValues.deselectPreviousLayers;
                    }
                    if (obj.layerIds === undefined) {
                        obj.layerIds = defValues.layerIds;
                    }
                    if (obj.openFolderForLayerIds === undefined) {
                        obj.openFolderForLayerIds = defValues.openFolderForLayerIds;
                    }
                    if (obj.filter === undefined) {
                        obj.filter = defValues.filter;
                    }
                }
            });
        },

        /**
         * create configured watches
         * @param {Object} context the context
         * @returns {void}
         */
        receiveEvents: function ({state, dispatch}) {
            const evts = state.events;

            evts.forEach((evt) => {
                const source = state.eventMap[evt.source];

                store.watch((mainState, mainGetters) => mainGetters[source], newVal => {
                    dispatch("handleEvent", {cfg: evt, input: newVal});
                });
            });
        },

        /**
         * deselects already selected layers
         * @param {Object} vueObject Object with state, dispatch etc.
         * @param {String} treeType which type of layer tree is used
         * @returns {void}
         */
        deselectSelectedLayers: function ({treeType}) {
            let selectedLayerList;

            if (treeType === "custom") {
                selectedLayerList = Radio.request("ModelList", "getModelsByAttributes", {isSelected: true});
                selectedLayerList.forEach(selectedLayer => {
                    Radio.trigger("ModelList", "setModelAttributesById", selectedLayer.id, {isSelected: false});
                });
            }
            else {
                console.warn("function is supported in treeType custom only");
            }
        },

        /**
         * handles the event if it was executed
         * @param {Object} context the context
         * @param {Object} param.cfg the configured object for this case
         * @param {Object} param.input the new value of the watched attribute
         * @returns {void}
         */
        handleEvent: async function ({dispatch}, {cfg, input}) {
            const isMobile = globalGetters.mobile(globalState),
                layerIds = cfg.layerIds,
                showMenuInDesktopMode = cfg.showMenuInDesktopMode,
                showLayerId = cfg.showLayerId,
                deselectPreviousLayers = cfg.deselectPreviousLayers,
                openFolderForLayerIds = cfg.openFolderForLayerIds,
                filter = cfg.filter,
                extent = cfg.extent,
                minResolution = cfg.minResolution,
                treeType = globalGetters.treeType(globalState);
            let filterResult;

            // filter handling
            if (filter instanceof Function) {
                filterResult = await dispatch("handleEventFilter", {filter: filter, input: input});
                if (filterResult !== true) {
                    // ignore non matching events
                    return;
                }
            }

            // remove current selected
            if (deselectPreviousLayers === "allways") {
                await dispatch("deselectSelectedLayers", {treeType: treeType});
            }

            // add layer
            await dispatch("handleEventAddLayers", {layerIds: layerIds, treeType: treeType});

            // show layer
            if (showLayerId instanceof String) {
                await dispatch("handleEventShowLayers", {showLayerId: showLayerId, showMenuInDesktopMode: showMenuInDesktopMode, isMobile: isMobile});
            }

            // opens the corresponding folders for the configured layers
            if (isMobile === false) {
                await dispatch("handleEventOpenFolder", {openFolderForLayerIds: openFolderForLayerIds});
            }

            // zoom to configured extent
            if (extent instanceof Array && extent.length === 4) {
                await dispatch("handleEventExtend", {extent: extent, minResolution: minResolution});
            }
        },

        /**
         * executes the filter
         * @param {Object} context the context
         * @param {Function} param.filter function to check if this config should be used
         * @param {*} param.input the value wich executes this event
         * @returns {Boolean} true if the configured filter function returns true, otherwise false
         */
        handleEventFilter: function (context, {filter, input}) {
            return filter.apply(this, [input]);
        },

        /**
         * adds layers to the tree
         * @param {Object} context the context
         * @param {String[]} param.layerIds layer ids to add
         * @param {String} param.treeType type of the layertree
         * @returns {void}
         */
        handleEventAddLayers: function (context, {layerIds, treeType}) {
            layerIds.forEach(layerId => {
                if (treeType === "custom") {
                    Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
                    Radio.trigger("ModelList", "setModelAttributesById", layerId, {isSelected: true});
                }
                else {
                    console.warn("function is supported in treeType custom only");
                }
            });
        },

        /**
         * activates given layers
         * @param {Object} context the context
         * @param {String[]} param.showLayerId the layer ids to show
         * @param {Boolean} param.showMenuInDesktopMode  if the client shows menu in desktop mode
         * @param {Boolean} param.isMobile if the client runs in mobile mode
         * @returns {void}
         */
        handleEventShowLayers: function (context, {showLayerId, showMenuInDesktopMode, isMobile}) {
            if (showMenuInDesktopMode === true && isMobile === false) {
                Radio.trigger("ModelList", "showModelInTree", showLayerId);
            }
            else {
                Radio.trigger("ModelList", "addModelsByAttributes", {id: showLayerId});
                Radio.trigger("ModelList", "setModelAttributesById", showLayerId, {isSelected: true});
            }
        },

        /**
         * opens configured layer folders
         * @param {Object} context the context
         * @param {String[]} param.openFolderForLayerIds configured layer ids
         * @returns {void}
         */
        handleEventOpenFolder: function (context, {openFolderForLayerIds}) {
            openFolderForLayerIds.forEach(layerId => {
                const lightModel = Radio.request("Parser", "getItemByAttributes", {id: layerId});

                Radio.trigger("ModelList", "addAndExpandModelsRecursive", lightModel.parentId);
            });
        },

        /**
         * zooms to the given extent with the given resolution
         * @param {Object} context the context
         * @param {Integer[]} param.extent the extent to zoom to
         * @param {Number} param.minResolution the minimal resolution to zoom to
         * @returns{void}
         */
        handleEventExtend: function (context, {extent, minResolution}) {
            if (minResolution instanceof Number) {
                Radio.trigger("Map", "zoomToExtent", extent, {minResolution: minResolution});
            }
            else {
                Radio.trigger("Map", "zoomToExtent", extent);
            }
        }
    };

export default actions;
