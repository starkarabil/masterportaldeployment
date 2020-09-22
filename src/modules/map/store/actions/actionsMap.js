import getScaleFromDpi from "./getScaleFromDpi";
import normalizeLayers from "./normalizeLayers";

let unsubscribes = [],
    loopId = null;

/**
 * When map module is done, the normalized layers should be constructed on the fly when adding layers.
 * For now, these processes happen independently of each other, so we need a hack to get the data.
 * TODO remove this once all layers are added/removed with an action (~= replace map.js with this module)
 * @param {function} commit commit function
 * @param {module:ol/Map} map ol map
 * @returns {void}
 */
function loopLayerLoader (commit, map) {
    clearInterval(loopId);
    loopId = setInterval(() => {
        const [layers, layerIds] = normalizeLayers(map.getLayers().getArray());

        commit("setLayers", layers);
        commit("setLayerIds", layerIds);
    }, 5000);
}

const actions = {
    /**
     * Sets the map to the store. As a side-effect, map-related functions are registered
     * to fire changes when required. Each time a new map is registered, all old listeners
     * are discarded and new ones are registered.
     * @param {object} state state object
     * @param {module:ol/Map} map map object
     * @returns {void}
     */
    setMap ({commit, dispatch}, {map}) {
        // discard old listeners
        if (unsubscribes.length) {
            unsubscribes.forEach(unsubscribe => unsubscribe());
            unsubscribes = [];
        }

        const mapView = map.getView();

        // set map to store
        commit("setMap", map);

        // update state once initially to get initial settings
        dispatch("updateViewState");

        // hack: see comment on function
        loopLayerLoader(commit, map);

        // currently has no change mechanism
        commit("setProjection", mapView.getProjection());

        // note initial values for quick comparisons/resets
        commit("setInitialZoomLevel", mapView.getZoom());
        commit("setInitialCenter", mapView.getCenter());
        commit("setInitialResolution", mapView.getResolution());

        // register listeners with state update functions
        unsubscribes = [
            map.on("moveend", () => dispatch("updateViewState")),
            map.on("pointermove", e => dispatch("updatePointer", e))
        ];
    },
    /**
     * @param {function} commit commit function
     * @param {module:ol/Map} map openlayer map object
     * @param {number} dpi needed to calculate scale
     * @returns {function} update function for state parts to update onmoveend
     */
    updateViewState ({commit, getters, rootGetters}) {
        const {map} = getters,
            mapView = map.getView(),
            {dpi} = rootGetters;

        commit("setZoomLevel", mapView.getZoom());
        commit("setMaxZoomLevel", mapView.getMaxZoom());
        commit("setMinZoomLevel", mapView.getMinZoom());
        commit("setResolution", mapView.getResolution());
        commit("setMaxResolution", mapView.getMaxResolution());
        commit("setMinResolution", mapView.getMinResolution());
        commit("setScale", getScaleFromDpi(map, dpi));
        commit("setBbox", mapView.calculateExtent(map.getSize()));
        commit("setRotation", mapView.getRotation());
        commit("setCenter", mapView.getCenter());
    },
    /**
     * @param {function} commit commit function
     * @param {object} evt update event
     * @returns {function} update function for mouse coordinate
     */
    updatePointer ({commit}, evt) {
        if (evt.dragging) {
            return;
        }
        commit("setMouseCoord", evt.coordinate);
    },
    /**
     * Sets a new zoom level to map and store. All other fields will be updated onmoveend.
     * @param {object} state state object
     * @param {number} zoomLevel zoom level
     * @returns {void}
     */
    setZoomLevel ({getters, commit}, zoomLevel) {
        const {maxZoomLevel, minZoomLevel} = getters;

        if (zoomLevel <= maxZoomLevel && zoomLevel >= minZoomLevel) {
            getters.map.getView().setZoom(zoomLevel);
            commit("setZoomLevel", zoomLevel);
        }
    },
    increaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.zoomLevel + 1);
    },
    decreaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.zoomLevel - 1);
    },
    /**
     * Turns a visible layer invisible and the other way around.
     * @param {object} state state object
     * @param {string} layerId id of the layer to toggle visibility of
     * @returns {void}
     */
    toggleLayerVisibility ({getters, commit}, {layerId}) {
        const layer = getters.layers[layerId];

        if (layer) {
            const nextVisibility = !layer.olLayer.getVisible();

            layer.olLayer.setVisible(nextVisibility);
            commit("setLayerVisibility", {layerId, visibility: nextVisibility});
            return;
        }

        console.warn(`No layer with id ${layerId} found to toggle visibility of.`);
    },
    /**
     * Sets the opacity of a layer.
     * @param {object} actionParams first action parameter
     * @param {object} payload parameter object
     * @param {string} payload.layerId id of layer to change opacity of
     * @param {number} payload.value opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity ({getters, commit}, {layerId, value}) {
        const layer = getters.layers[layerId];

        if (!layer) {
            console.warn(`No layer with id ${layerId} found to set opacity of.`);
            return;
        }

        layer.olLayer.setOpacity(value);
        commit("setLayerOpacity", {layerId, opacity: value});
    },
    /**
     * Sets center and resolution to initial values.
     * @param {object} actionParams first action parameter
     * @returns {void}
     */
    resetView ({state}) {
        const {initialCenter, initialResolution, map} = state,
            view = map.getView();

        view.setCenter(initialCenter);
        view.setResolution(initialResolution);

        // TODO replace trigger when MapMarker is migrated
        Radio.trigger("MapMarker", "hideMarker");
    },
    /**
     * Sets the resolution by the given index of available resolutions.
     * NOTE: is used by scaleSwitcher tutorial.
     * @param {number} index of the resolution
     * @returns {void}
     */
    setResolutionByIndex ({state}, index) {
        const {map} = state,
            view = map.getView();

        view.setResolution(view.getResolutions()[index]);
    },
    /**
     * Adds a listener to maps pointermove and calls callback-funktion
     * @param {object} state state object
     * @param {function} callback  to be called on pointermove
     * @returns {void}
     */
    addPointerMoveHandler ({state}, callback) {
        const {map} = state;

        if (callback) {
            map.on("pointermove", e => callback(e));
        }

    },
    /**
     * Removes a listener from maps pointermove
     * @param {object} state state object
     * @param {function} callback  to be called on pointermove
     * @returns {void}
     */
    removePointerMoveHandler ({state}, callback) {
        const {map} = state;

        map.un("pointermove", e => callback(e));
    },
    /**
     * Adds an interaction to the map.
     * @param {interaction} interaction - Interaction to be added to map.
     * @returns {void}
     */
    addInteraction ({state}, interaction) {
        const {map} = state;

        map.addInteraction(interaction);
    },
    /**
     * Removes an interaction from the map.
     * @param {interaction} interaction - Interaction to be removed from map.
     * @returns {void}
     */
    removeInteraction ({state}, interaction) {
        const {map} = state;

        map.removeInteraction(interaction);
    }
};

export default actions;