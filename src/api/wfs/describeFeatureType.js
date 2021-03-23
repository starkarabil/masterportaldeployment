import axios from "axios";
import xml2json from "../xml2json";

/**
 * Handles the WFS DescribeFeatureType request.
 * @param {String} url - The url of the WFS.
 * @param {String} [version="1.1.0"] - The version of the WFS.
 * @returns {Promise<Object|undefined>} Promise object represents the DescribeFeatureType request.
 */
export function describeFeatureType (url, version = "1.1.0") {
    return axios.get(url, {
        // the params "service", "request", "version" are required
        params: {
            service: "WFS",
            request: "DescribeFeatureType",
            version: version
        }
    }).then(response => {
        return xml2json(response.request.responseXML);
    }).catch(error => errorHandling(error));
}

/**
 * Returns a description of feature.
 * This means a list of the existing attributes of the feature.
 * @param {Object} json - The response of the describe feature request as a json.
 * @param {String} featureTypeName - Is actually the same as the name of a layer.
 * @returns {Object[]|undefined} A list of feature attributes with name and type.
 */
export function getFeatureDescription (json, featureTypeName) {
    if (typeof json !== "object" || json === null || typeof featureTypeName !== "string") {
        console.error(`getFeatureDescription: ${json} has to be defined and an object (not null). ${featureTypeName} has to be defined and a string`);
        return undefined;
    }
    const description = [],
        // path to the featureTypes
        featureType = Array.isArray(json?.schema?.element)
            ? json?.schema?.element?.find(element => element.attributes?.name === featureTypeName)
            : json?.schema?.element;

    if (typeof featureType === "undefined") {
        console.error(`getFeatureDescription: FeatureType "${featureType}" was not found`);
        return undefined;
    }

    // path to the feature attributes
    if (!Array.isArray(featureType.complexType?.complexContent?.extension?.sequence?.element)) {
        console.error(`getFeatureDescription: No attributes were found for the FeatureType "${featureType}"`);
        return undefined;
    }

    featureType.complexType.complexContent.extension.sequence.element.forEach(attribute => {
        description.push(attribute.getAttributes());
    });

    return description;
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
    console.error("describeFeatureType: " + errorMessage);
    console.warn(error.config);
}
