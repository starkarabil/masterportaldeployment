import {fetchRoutingOrsIsochrones} from "../../utils/isochrones/routing-ors-isochrones";
import Polygon from "ol/geom/Polygon";
import Feature from "ol/Feature";
import mapCollection from "../../../../../core/dataStorage/mapCollection";

export default {
    /**
     * Finds the Route for the current waypoints.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    async findIsochrones ({rootState, state, dispatch, commit}) {
        if (state?.waypoint?.getCoordinates().length < 2) {
            return;
        }
        const {waypoint, isochronesAreaSource} = state,
            wgs84Coords = await dispatch(
                "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                waypoint.getCoordinates(),
                {root: true}
            ),
            map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode);

        commit("setIsLoadingIsochrones", true);
        await dispatch("resetIsochronesResult");

        try {
            const result = await dispatch("fetchIsochrones", {wgs84Coords: wgs84Coords, transformCoordinates: true});

            isochronesAreaSource.addFeatures(
                result.getAreas().map(
                    area => new Feature({
                        geometry: new Polygon(area.getCoordinates()),
                        value: area.getValue(),
                        maximum: area.getMaximum(),
                        interval: area.getInterval(),
                        speedProfile: area.getSpeedProfile(),
                        optimization: area.getOptimization(),
                        color: area.getColor(),
                        avoidSpeedProfileOptions: area.getAvoidSpeedProfileOptions()
                    })
                )
            );
            map.getView().fit(isochronesAreaSource.getExtent());

            commit("setRoutingIsochrones", result);
        }
        catch (err) {
            dispatch("Alerting/addSingleAlert", {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: err.message
            }, {root: true});
        }
        commit("setIsLoadingIsochrones", false);
    },

    /**
     * Zooms to the selected geosearchresult
     * @param {Object} context actions context object.
     * @returns {void}
     */
    zoomOnWaypoint ({state, rootState}) {
        const map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode);

        map.getView().fit(state.waypoint.getFeature().getGeometry(), {maxZoom: 7});
    },

    /**
     * Resets the isochrones results from the map and state
     * @param {Object} context actions context object.
     * @returns {void}
     */
    resetIsochronesResult ({state, commit}) {
        state.isochronesAreaSource.clear();
        commit("setRoutingIsochrones", null);
    },

    /**
     * Fetches the isochrones from the configured external service with the needed parameters.
     * @param {Object} context actions context object.
     * @param {Object} params with wgs84Coords([Number, Number][]) and transformCoordinates(Boolean)
     * @param {[Number, Number]} [params.wgs84Coords] coordinates in wgs84 projection
     * @param {Boolean} [params.transformCoordinates] the coordinates should be projected to local projection
     * @returns {RoutingIsochrones} routingIsochrones
     */
    async fetchIsochrones ({state, dispatch, getters}, {wgs84Coords, transformCoordinates}) {
        const {settings} = state,
            {selectedAvoidSpeedProfileOptions} = getters;

        if (settings.type === "ORS") {
            return fetchRoutingOrsIsochrones({
                coordinates: wgs84Coords,
                transformCoordinatesToLocal: coordinates => dispatch(
                    "Tools/Routing/transformCoordinatesWgs84ToLocalProjection",
                    coordinates,
                    {root: true}
                ),
                speedProfile: settings.speedProfile,
                optimization: settings.isochronesMethodOption,
                avoidSpeedProfileOptions: selectedAvoidSpeedProfileOptions,
                transformCoordinates: transformCoordinates
            });
        }

        throw new Error("Isochrones is not configured correctly.");
    },

    /**
     * Called when isochrones tab is created and initializes the map layer and map interactions
     * @param {Object} context actions context object.
     * @returns {void}
     */
    initIsochrones ({rootState, state, commit, dispatch}) {
        const {isochronesPointLayer, isochronesAreaLayer, isochronesPointDrawInteraction, mapListenerAdded} = state,
            map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode);

        if (!mapListenerAdded) {
            isochronesPointDrawInteraction.on("drawend", event => dispatch("onIsochronesPointDrawEnd", event));
            dispatch("createIsochronePointModifyInteractionListener");
            commit("setMapListenerAdded", true);
        }

        map.addLayer(isochronesAreaLayer);
        map.addLayer(isochronesPointLayer);

        dispatch("createIsochronesPointDrawInteraction");
    },

    /**
     * Called when isochrones tab is closed and removes the map layer and map interactions
     * @param {Object} context actions context object.
     * @returns {void}
     */
    closeIsochrones ({rootState, state, dispatch}) {
        const {isochronesPointLayer, isochronesAreaLayer} = state,
            map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode);

        map.removeLayer(isochronesPointLayer);
        map.removeLayer(isochronesAreaLayer);
        dispatch("removeIsochronesPointDrawInteraction");
    },

    /**
     * Executed when User clicks on the Map to add a center waypoint
     * @param {Object} context actions context object.
     * @param {Object} event OL OnDrawEvent.
     * @returns {void}
     */
    async onIsochronesPointDrawEnd ({state, dispatch, rootState}, event) {
        const {waypoint, isochronesPointSource, isochronesPointDrawInteraction} = state,
            map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode),
            coordinates = await dispatch(
                "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                event.feature.getGeometry().getCoordinates(),
                {root: true}
            ),
            geoSearchResult = await dispatch(
                "Tools/Routing/fetchTextByCoordinates",
                {
                    coordinates
                },
                {root: true}
            );

        waypoint.setDisplayName(geoSearchResult ? geoSearchResult.getDisplayName() : null);
        waypoint.setCoordinates(event.feature.getGeometry().getCoordinates());
        isochronesPointSource.removeFeature(event.feature);

        map.removeInteraction(isochronesPointDrawInteraction);
    },

    /**
     * Creates event listener called when the user drags/modifies the center point.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createIsochronePointModifyInteractionListener ({state, dispatch}) {
        const {isochronesPointModifyInteraction, waypoint} = state;

        isochronesPointModifyInteraction.on("modifyend", async () => {
            const coordinates = await dispatch(
                    "Tools/Routing/transformCoordinatesLocalToWgs84Projection",
                    waypoint.getCoordinates(),
                    {root: true}
                ),
                geoSearchResult = await dispatch(
                    "Tools/Routing/fetchTextByCoordinates",
                    {
                        coordinates
                    },
                    {root: true}
                );

            waypoint.setDisplayName(geoSearchResult.getDisplayName());
        });
    },

    /**
     * Creates a new draw interaction depending on state to either draw
     * lines or polygons. The method will first remove any prior draw
     * interaction created by this tool.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    createIsochronesPointDrawInteraction ({state, dispatch, rootState}) {
        dispatch("removeIsochronesPointDrawInteraction");
        const {
                isochronesPointModifyInteraction,
                isochronesPointSnapInteraction,
                isochronesPointDrawInteraction
            } = state,

            map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode);

        if (state.waypoint.getCoordinates().length < 2) {
            map.addInteraction(isochronesPointDrawInteraction);
        }
        map.addInteraction(isochronesPointModifyInteraction);
        map.addInteraction(isochronesPointSnapInteraction);
    },

    /**
     * Removes the draw interaction. This includes aborting any current
     * unfinished drawing, removing the interaction from the map, and
     * removing the interaction from the store.
     * @param {Object} context actions context object.
     * @returns {void}
     */
    removeIsochronesPointDrawInteraction ({state, rootState}) {
        const {
                isochronesPointDrawInteraction,
                isochronesPointModifyInteraction,
                isochronesPointSnapInteraction
            } = state,

            map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode);

        isochronesPointDrawInteraction.abortDrawing();

        map.removeInteraction(isochronesPointDrawInteraction);
        map.removeInteraction(isochronesPointModifyInteraction);
        map.removeInteraction(isochronesPointSnapInteraction);
    }
};