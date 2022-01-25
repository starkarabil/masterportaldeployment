/**
 * User type definition
 * @typedef {Object} LayerselectorState
 * @property {String} source The name of the event. It has to be equal to the source attribute the module sets.|
 * @property {String[]} showLayerId Layer IDs of Layer to be selected in the layer tree|
 * @property {String[]} layerIds Layer IDs to add to the layer tree.|
 * @property {String} openFolderForLayerIds List of Layer IDs to open their folders in the layer tree.|
 * @property {Function} filter Function to check if this event should be triggered.|
 * @property {String} deselectPreviousLayers Deselects the previous layers if it has the value allways.|
 * @property {Boolean} showMenuInDesktopMode If the Event should run in the desktop mode|
 */
const state = {
    events: [],
    default: {
        showMenuInDesktopMode: false,
        showLayerId: null,
        deselectPreviousLayers: "allways",
        layerIds: [],
        openFolderForLayerIds: [],
        filter: null
    },
    execute: {},
    initialized: false
};

export default state;
