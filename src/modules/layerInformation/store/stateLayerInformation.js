/**
 * User type definition
 * @typedef {Object} layerInformationState
 */
export default {
    active: false,
    // configured in rest-services.json
    metaDataCatalogueId: "2",
    // true if Layerinformation is visible
    isVisible: false,
    uniqueIdList: [],
    datePublication: null,
    dateRevision: null,
    downloadLinks: null,
    periodicityKey: null,
    periodicity: null,
    idCounter: 0,
    layerInfo: {},
    additionalLayer: {},
    abstractText: "Test",
    title: "",
    noMetadataLoaded: "",
    metaURLs: []
};