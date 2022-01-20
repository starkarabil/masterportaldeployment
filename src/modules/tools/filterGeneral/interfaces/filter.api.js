import hash from "object-hash";
import {
    getFeaturesByLayerId,
    isFeatureInMapExtent
} from "../utils/openlayerFunctions.js";
import IntervalRegister from "../utils/intervalRegister.js";
import InterfaceOL from "./interface.ol.js";
import InterfaceWFS from "./interface.wfs.js";

/**
 * FilterApi is the api to use in vue environment. It encapsulates the filter interfaces.
 * @class
 */
export default class FilterApi {
    /**
     * @constructor
     * @param {Number} filterId the id of the VueFilter/Layer
     * @param {Object} service the service to use
     */
    constructor (filterId, service) {
        this.filterId = filterId;
        this.service = service;

        if (FilterApi.instance instanceof FilterApi) {
            return FilterApi.instance;
        }
        FilterApi.instance = this;

        FilterApi.intervalRegister = new IntervalRegister();
        FilterApi.cache = {};
        FilterApi.interfaces = {
            ol: new InterfaceOL(FilterApi.intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent}),
            wfs: new InterfaceWFS()
        };
    }
    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Function} onsuccess a function({attrName: Type}[])
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getAttrTypes (onsuccess, onerror) {
        const connector = this.getInterfaceByService(this.service),
            cacheKey = hash.sha1(["getAttrTypes", JSON.stringify(this.service)].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey) && typeof onsuccess === "function") {
            onsuccess(FilterApi.cache[cacheKey]);
            return;
        }
        connector.getAttrTypes(this.service, result => {
            FilterApi.cache[cacheKey] = result;
            if (typeof onsuccess === "function") {
                onsuccess(result);
            }
        }, onerror);
    }
    /**
     * Returns the min and max values of the given service and attrName.
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received values
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @returns {void}
     */
    getMinMax (attrName, onsuccess, onerror, minOnly, maxOnly) {
        const connector = this.getInterfaceByService(this.service),
            cacheKey = hash.sha1(["getMinMax", JSON.stringify(this.service), attrName, minOnly, maxOnly].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey) && typeof onsuccess === "function") {
            onsuccess(FilterApi.cache[cacheKey]);
            return;
        }
        connector.getMinMax(this.service, attrName, result => {
            FilterApi.cache[cacheKey] = result;
            if (typeof onsuccess === "function") {
                onsuccess(result);
            }
        }, onerror, minOnly, maxOnly);
    }
    /**
     * Returns a list of unique values (unsorted) of the given service and attrName.
     * @param {String} attrName the attribute to receive unique values from
     * @param {Function} onsuccess a function([]) with the received unique values as Array of values
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getUniqueValues (attrName, onsuccess, onerror) {
        const connector = this.getInterfaceByService(this.service),
            cacheKey = hash.sha1(["getUniqueValues", JSON.stringify(this.service), attrName].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey) && typeof onsuccess === "function") {
            onsuccess(FilterApi.cache[cacheKey]);
            return;
        }
        connector.getUniqueValues(this.service, attrName, result => {
            FilterApi.cache[cacheKey] = result;
            if (typeof onsuccess === "function") {
                onsuccess(result);
            }
        }, onerror);
    }
    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [refreshed=false] internal parameter to flag filter by refresh
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror, refreshed = false) {
        const connector = this.getInterfaceByService(this.service);

        connector.filter(filterQuestion, onsuccess, onerror, refreshed);
    }
    /**
     * Stops the current filter.
     * @param {Function} onsuccess a function()
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    stop (onsuccess, onerror) {
        const connector = this.getInterfaceByService(this.service);

        if (connector instanceof InterfaceOL) {
            FilterApi.intervalRegister.stopPagingInterval(this.filterId);
            if (typeof onsuccess === "function") {
                onsuccess();
            }
        }
        else if (typeof connector.stop === "function") {
            connector.stop(this.filterId, onsuccess, onerror);
        }
        else if (typeof onerror === "function") {
            onerror(new Error("FilterApi: No usefull connector found for this api service to stop."));
        }
    }

    /**
     * Returns the interface for the given service.
     * @param {Object} service the service to recognize the interface with
     * @returns {Object} an object to use as interface
     */
    getInterfaceByService (service) {
        if (typeof service.type === "string" && service.type.toLowerCase() === "wfs") {
            return FilterApi.interfaces.wfs;
        }
        return FilterApi.interfaces.ol;
    }
}
