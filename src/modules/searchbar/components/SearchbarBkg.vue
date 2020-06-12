<script>
import {mapGetters} from "vuex";
import {fetch as fetchPolyfill} from "whatwg-fetch";

export default {
    name: "SearchbarBkg",
    data () {
        // todo: daten aus der config.json holen und hier überschreiben!
        return {
            id: "bkg",
            extent: [
                454591,
                5809000,
                700000,
                6075769
            ],
            suggestCount: 10,
            epsg: "EPSG:25832",
            filter: "filter=(typ:*)",
            score: 0.6,
            suggestUrl: "/bkg_suggest",
            geoSearchUrl: "/bkg_geosearch",
            searchResults: [],
            fetches: {}
        };
    },
    computed: {
        ...mapGetters("Searchbar", ["searchInputValue"])
    },
    watch: {
        /**
         * Watcher for the attribute searchInputValue.
         * Starts the search if this value is not an empty string.
         * @param {string} searchInputValue - The input of the searchbar.
         * @returns {void}
         */
        searchInputValue (searchInputValue) {
            if (searchInputValue !== "") {
                this.searchResults = [];
                this.commitDataToStore("Searchbar/changeSearch", this.id, true);
                this.search(searchInputValue);
            }
        }
    },
    created () {
        this.commitDataToStore("Searchbar/createSearch");
    },
    methods: {

        /**
         * Commits data to vuex store.
         * @param {string} statetAttribute - The attribute in state.
         * @param {string} [id=this.id] - The id of the search.
         * @param {boolean} [isBusy=false] - Shows if the search is still working.
         * @param {object[]} [searchResults=[]] - The results from search.
         * @returns {void}
         */
        commitDataToStore (statetAttribute, id = this.id, isBusy = false, searchResults = []) {
            this.$store.commit(statetAttribute, {
                id: id,
                isBusy: isBusy,
                searchResults: searchResults
            });
        },

        /**
         * Starts the search with bkg service.
         * @param {string} searchInputValue - The input string to search.
         * @returns {void}
         */
        search: function (searchInputValue) {
            const suggestUrl = this.createSuggestUrl(searchInputValue);

            this.fetchDataFromBkgSuggestService(suggestUrl);
        },

        /**
         * Creates the complete URL to send request for bkg suggest search service.
         * @param {string} searchInputValue - The input string to search.
         * @returns {string} The search string for search service from bkg.
         */
        createSuggestUrl: function (searchInputValue) {
            return this.suggestUrl + "?bbox=" + this.extent + "&outputformat=json&srsName=" + this.epsg + "&query=" + encodeURIComponent(searchInputValue) + "&" + this.filter + "&count=" + this.suggestCount;
        },

        /**
         * Fetches the data form bkg search service.
         * @param {string} suggestUrl - URL with search parameters.
         * @returns {void}
         */
        fetchDataFromBkgSuggestService: function (suggestUrl) {
            this.fetch(suggestUrl, "suggest", this.startFetchDataFromBkgGeoSearchService);
        },

        /**
         * Start fetcheing data from geosearch bkg service.
         * @param {object[]} searchResults - Results from search with bkg service.
         * @returns {void}
         */
        startFetchDataFromBkgGeoSearchService: function (searchResults) {
            console.log(searchResults);
            
            const resultsFilteredByScore = this.filterSearchResultsByScore(searchResults),
                sortedSearchResults = this.sortSearchResults(resultsFilteredByScore);

            if (sortedSearchResults.length === 0) {
                this.commitDataToStore("Searchbar/changeSearch");
            }

            this.searchResultLength = sortedSearchResults.length;

//Bevor das passiert, alle geosearches abborden.
            sortedSearchResults.forEach(result => {
                const geoSearchUrl = this.createGeoSearchUrl(result.suggestion);

                this.fetch(geoSearchUrl, "geoSearch", this.addResultToLocalArray);
            });
        },

        /**
         * Filter out all results whose score is not greater than the specified score.
         * @param {object[]} [searchResults=[]] - Results from search wiht bkg service.
         * @returns {object[]} The filtered search results.
         */
        filterSearchResultsByScore: function (searchResults = []) {
            return searchResults.filter(result => result.score > this.score);
        },

        /**
         * Sorts the search results by attribute score.
         * @param {object[]} [searchResults=[]] - Results from search wiht bkg service.
         * @returns {object[]} The sorted search results.
         */
        sortSearchResults: function (searchResults = []) {
            return searchResults.sort((a, b) => a.score < b.score ? 1 : -1);
        },


        /**
         * Creates the complete URL to send request for bkg geo search.
         * @param {string} resultSuggestion - The result from suggest search.
         * @returns {void}
         */
        createGeoSearchUrl: function (resultSuggestion) {
            return this.geoSearchUrl + "?bbox=" + this.extent + "&outputformat=json&srsName=" + this.epsg + "&count=1&query=" + encodeURIComponent(resultSuggestion);
        },

        /**
         * Function to fetches URLs.
         * @param {string} url - URL to search.
         * @param {string} urlType - The URL type to search.
         * @param {function} successFunction - Function to work with success.
         * @returns {void}
         */
        fetch: function (url, urlType, successFunction) {
            const controller = new AbortController(),
                signal = controller.signal;

            // Suggest darf immer nur einer gleichzeitig laufen
            if (urlType === "suggest" && this.fetches[urlType] !== undefined) {
                this.fetches.controller.abort();
                this.fetches = Radio.request("Util", "omit", this.fetches[urlType], urlType);
            }

            this.fetches.controller = controller;
            this.fetches[urlType] = fetchPolyfill(url, {signal})
                .then(response => response.json())
                .then(searchResults => {
                    successFunction(searchResults);
                })
                .catch(error => {
                    if (error.message !== "Aborted") {
                        this.commitDataToStore("Searchbar/changeSearch");
                        console.warn("The fetch of the data failed with the following error message: " + error.message);
                    }
                });
        },

        /**
         * Adds search results to the local array searchresults
         * @param {object[]} searchResult - The results from search with bkg geo search.
         * @returns {void}
         */
        addResultToLocalArray: function (searchResult) {
            let searchResults = [];

            this.searchResults.push(searchResult);
            searchResults = this.searchResults;

            if (searchResults.length === this.searchResultLength) {
                this.commitSearchResultsToStore(searchResults);
            }
        },

        /**
         * Prepare the results and commit to Searchbar results.
         * @param {object[]} searchResults - The results from search with bkg geo search.
         * @returns {void}
         */
        commitSearchResultsToStore: function (searchResults) {
            const preparedSearchResults = [];

            searchResults.forEach(searchResult => {
                preparedSearchResults.push({
                    name: searchResult.features[0].properties.text,
                    type: searchResult.features[0].properties.typ,
                    geometry: searchResult.features[0].geometry,
                    searchId: this.id,
                    searchResultsLength: searchResults.length
                });
            });
console.log(preparedSearchResults);

            this.commitDataToStore("Searchbar/changeSearch", this.id, false, preparedSearchResults);
        }
    }
};
</script>

<template>
    <div class="Bkg-Searchbar">
        <!-- nothing -->
    </div>
</template>
