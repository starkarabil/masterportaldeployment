import axios from "axios";
import {WFS, GeoJSON} from "ol/format.js";

/**
 * Parses a GML featureCollection
 * @param {String<XML>} featureCollection - the featureCollection to parse
 * @returns {module:ol/Feature[]} the features of the collection
 */
export function parseWFSFeatures (featureCollection) {
    return new WFS().readFeatures(featureCollection);
}

/**
 * Parses a GeoJSON featureCollection
 * @param {String<XML>} featureCollection - the featureCollection to parse
 * @returns {module:ol/Feature[]} the features of the collection
 */
export function parseGeoJSONFeatures (featureCollection) {
    return new GeoJSON().readFeatures(featureCollection);
}

/**
 * Handles the WFS GetFeature request (as POST request).
 * See https://openlayers.org/en/latest/apidoc/module-ol_format_WFS-WFS.html#writeGetFeature
 * @param {String} url - The url of the WFS.
 * @param {Object} payload - The request body for the WFS request.
 * @param {String | String[]} payload.featureTypes - The layer names to fetch from the WFS. Is required.
 * @param {String} [payload.srsName="EPSG:25832"] - The CRS the data should be returned in, if possible. Defaults to UTM32N.
 * @param {String} [payload.featureNS] - The namespace of the featureTypes.
 * @param {String} [payload.propertyNames] - A list of properties to restrict the request.
 * @param {String} [payload.bbox] - A extent to restrict the request.
 * @param {String} [payload.geometryName] - geometryName to use for the BBOX filter.
 * @param {String} [payload.filter] - An XML encoded filter function.
 * @param {String} [payload.resultType] - The resultType to return from the WFS, defaults to GML3 for Hamburgs UDP.
 * @param {Boolean} [payload.returnFeatures=true] - If true, returns the result as OL Features
 * @returns {Promise<Object|String|undefined|module:ol/Feature[]>} Promise object represents the GetFeature request.
 */
export async function getFeaturePost (url, payload) {
    // For now only implemented for version 1.1.0
    const {featureTypes, srsName, featureNS, propertyNames, bbox, geometryName, filter, resultType} = payload,
        request = new WFS().writeGetFeature({
            srsName,
            featureNS,
            featureTypes,
            propertyNames,
            bbox,
            geometryName,
            filter,
            resultType
        }),
        response = await fetch(url, {
            method: "POST",
            body: new XMLSerializer().serializeToString(request)
        });

    // parse JSON if output is GeoJSON
    if (resultType === "JSON" || resultType === "application/json") {
        return response.json();
    }

    // parse String if output is XML
    return response.text();
}

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
