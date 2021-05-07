
import {transformFromMapProjection} from "masterportalAPI/src/crs";
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import coordState from "./stateCoordToolkit";

const getters = {
    ...generateSimpleGetters(coordState),

    // NOTE overwrite getters here if you need a special behaviour in a getter

    /**
     * Transforms the projection.
     * @param {Object} state state of this tool
     * @param {Object} targetProjection the target projection
     * @returns {Object} the transformed projection
     */
    getTransformedPosition: state => (map, targetProjection) => {
        let positionTargetProjection = [0, 0];

        if (state.positionMapProjection !== null && state.positionMapProjection.length > 0) {
            positionTargetProjection = transformFromMapProjection(
                map,
                targetProjection,
                state.positionMapProjection
            );
        }
        return positionTargetProjection;
    },
    /**
     * Returns the projection to the given name.
     * @param {Object} state state of this tool
     * @param {String} name of the projection
     * @returns {Object} projection
     */
    getProjectionByName: state => (name) => {
        const projections = state.projections;

        return projections.find(projection => {
            return projection.name === name;
        });
    }
};

export default getters;