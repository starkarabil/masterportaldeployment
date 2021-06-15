import axios from "axios";

/**
 * Handles the WFS GetFeature request.
 * @param {String} url - The url of the WFS.
 * @param {String | String[]} featureType - The layer name, resp. the layer names if WFS version is >2.0.0.
 * @param {String} [version="1.1.0"] - The version of the WFS.
 * @param {String} [propertyName] - A list of properties to restrict the request.
 * @param {String} [bbox] - A extent to restrict the request.
 * @param {String} [filter] - An XML encoded filter function.
 * @returns {Promise<Object|undefined>} Promise object represents the DescribeFeatureType request.
 */
export function getFeature (url, featureType, version = "1.1.0", propertyName, bbox, filter) {
    return axios.get(url, {
        // the params "service", "request", "version" are required
        params: {
            service: "WFS",
            request: "GetFeature",
            version: version,
            typeName: `de.hh.up:${featureType}`,
            typeNames: Array.isArray(featureType) ? featureType.join(",") : featureType,
            propertyName,
            bbox,
            filter
        }
    })
        .then(response => response.data)
        .catch(error => errorHandling(error));
}

/**
 * Handles an axios error.
 * @param {Object} error - The axios error object.
 * @returns {void}
 * @see {@link https://github.com/axios/axios#handling-errors}
 */
export function errorHandling (error) {
    let errorMessage = "";

    if (error.response) {
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
        errorMessage = "The request was made and the server responded with a status code that falls out of the range of 2xx.";
    }
    else if (error.request) {
        // `error.request` is an instance of XMLHttpRequest
        console.error(error.request);
        errorMessage = "The request was made but no response was received.";
    }
    else {
        console.error("Error", error.message);
        errorMessage = "Something happened in setting up the request that triggered an Error.";
    }
    console.error("getFeature: " + errorMessage);
    console.warn(error.config);
}

/**
 * Constructs an XML encoded filter to be used in the "filter" param of a getFeature request
 * @param {"PropertyIsEqualTo" | "PropertyIsNotEqualTo" | "PropertyIsLessThan" | "PropertyIsGreaterThan" | "PropertyIsLessThanOrEqualTo" | "PropertyIsGreaterThanOrEqualTo" | "PropertyIsBetween" | "PropertyIsLike"} operation - the comparison function to use
 * @param {String} valueReference - the property name to check
 * @param {String} literal - the literal value to check against
 * @returns {String} - the XML encoded filter
 */
export function createFilter (operation, valueReference, literal) {
    return `<Filter><${operation}><ValueReference>${valueReference}</ValueReference><Literal>${literal}</Literal></${operation}></Filter>`;
}
