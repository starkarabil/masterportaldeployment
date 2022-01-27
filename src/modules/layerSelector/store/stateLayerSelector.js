/**
 * User type definition
 * @typedef {Object} LayerselectorState
 * @property {Object[]} events
 * @property {String} events.source The name of the event. It has to be equal to the source attribute the module sets.
 * @property {String[]} events.showLayerId Layer IDs of Layer to be selected in the layer tree.
 * @property {String[]} events.layerIds Layer IDs to add to the layer tree.
 * @property {String} events.openFolderForLayerIds List of Layer IDs to open their folders in the layer tree.
 * @property {Function} events.filter Function to check if this event should be triggered.
 * @property {String} events.deselectPreviousLayers Deselects the previous layers if it has the value allways.
 * @property {Boolean} events.showMenuInDesktopMode If the Event should run in the desktop mode.
 * @property {Integer[]} events.extent Bounding Box to zoom to when this event is triggered.
 * @property {Object} default Object to overwrite the missing parts in the events objects.
 * @property {Object} eventMap Map of registered parameters.
 */
const state = {
    events: [],
    default: {
        showMenuInDesktopMode: false,
        showLayerId: null,
        deselectPreviousLayers: "allways",
        layerIds: [],
        openFolderForLayerIds: [],
        filter: null,
        extent: null
    },
    eventMap: {
        "comparefeatures_select": "Tools/CompareFeatures/selectedLayer",
        "fileimport_imported": "Tools/FileImport/importedFileNames",
        "measure_geometry": "Tools/Measure/selectedGeometry"
    },
    initialized: false
};

export default state;
