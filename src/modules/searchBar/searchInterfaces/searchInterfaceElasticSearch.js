import SearchInterface from "./searchInterface";

/**
 * The search interface to the elasticSearch.
 * @param {Object} hitMap Object mapping result object attributes to keys.
 * @param {String} hitMap.coordinate Attribute value will be mapped to the attribute key.
 * @param {String} hitMap.id Attribute value will be mapped to the attribute key.
 * @param {String} hitMap.name Attribute value will be mapped to the attribute key.
 * @param {String} serviceId Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.
 *
 * @param {String} [hitIcon="glyphicon-list"] CSS icon class of search results, shown before the result name.
 * @param {Object} [hitType="common:modules.searchbar.type.subject"] Search result type shown in the result list after the result name.
 * @param {String[]} [onClick=["activateLayerInTopicTree", "addLayerToTopicTree", "openTopicTree"]] Actions that are fired when clicking on the search result.
 * @param {String[]} [onHover] Actions that are fired when hovering on the search result.
 * @param {Object} [payload={}] Matches the customObject description.
 * @param {String} [responseEntryPath=""] Response JSON attribute path to found features.
 * @param {String} [searchStringAttribute="searchString"] Search string attribute name for `payload` object.
 * @param {String} [type="POST"] Request type.
 * @param {Boolean} [useProxy=false] Defines whether the URL should be proxied.
 * @constructs
 * @extends SearchInterface
 * @returns {void}
 */
export default function SearchInterfaceElasticSearch ({hitMap, serviceId, hitIcon, hitType, onClick, onHover, payload, responseEntryPath, searchStringAttribute, type, useProxy} = {}) {
    SearchInterface.call(this, onClick || ["activateLayerInTopicTree", "addLayerToTopicTree", "openTopicTree"], onHover);

    this.hitMap = hitMap;
    this.serviceId = serviceId;

    this.hitIcon = hitIcon || "glyphicon-list";
    this.hitType = hitType || "common:modules.searchbar.type.subject";
    this.payload = payload || {};
    this.responseEntryPath = responseEntryPath || "";
    this.searchStringAttribute = searchStringAttribute || "searchString";
    this.type = type || "POST";
    this.useProxy = useProxy || false;
}

SearchInterfaceElasticSearch.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in elasticSearch search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
SearchInterfaceElasticSearch.prototype.search = function (searchInput) {
    // Do something
    return searchInput; // Dummy for linter
};
