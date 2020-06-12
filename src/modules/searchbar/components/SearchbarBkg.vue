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
            searchResults: []
        };
    },
    computed: {
        ...mapGetters("Searchbar", ["searchInputValue"])
    },

    watch: {
        searchInputValue (searchInputValue) {
            if (searchInputValue !== "") {
                this.searchResults = [];
                this.$store.commit("Searchbar/changeSearch", {
                    id: this.id,
                    isBusy: true,
                    searchResults: [],
                    searchResultsLength: 0
                });

                this.search(searchInputValue);
            }
        }
    },
    created () {
        this.$store.commit("Searchbar/createSearch", {
            id: this.id,
            isBusy: false,
            searchResults: []
        });
    },
    methods: {
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
         * Creates the complete URL to send request for bkg search service.
         * @param {string} searchInputValue - The input string to search
         * @returns {string} The search string for search service from bkg.
         */
        createSuggestUrl: function (searchInputValue) {
            return this.suggestUrl + "?bbox=" + this.extent + "&outputformat=json&srsName=" + this.epsg + "&query=" + encodeURIComponent(searchInputValue) + "&" + this.filter + "&count=" + this.suggestCount;
        },

        /**
         * Featches the data form bkg search service.
         * @param {string} suggestUrl - URL with search parameters.
         * @returns {void}
         */
        fetchDataFromBkgSuggestService: function (suggestUrl) {
            this.fetch(suggestUrl, this.fetchDataFromBkgGeoSearchService);
        },

        /**
         * Fetches data from geosearch bkg service.
         * @param {object[]} searchResults - Results from search wiht bkg service.
         * @returns {void}
         */
        fetchDataFromBkgGeoSearchService: function (searchResults) {
            const resultsFilteredByScore = this.filterSearchResultsByScore(searchResults);

            if (resultsFilteredByScore.length === 0) {
                this.$store.commit("Searchbar/changeSearch", {
                    id: this.id,
                    isBusy: false,
                    searchResults: []
                });
            }

            this.searchResultLength = resultsFilteredByScore.length;

            resultsFilteredByScore.forEach(result => {
                const geoSearchUrl = this.createGeoSearchUrl(result.suggestion);

                this.fetch(geoSearchUrl, this.addResultToLocalArray);
            });
        },

        addResultToLocalArray: function (searchResult) {
            let searchResults = [];

            this.searchResults.push(searchResult);
            searchResults = this.searchResults;

            if (searchResults.length === this.searchResultLength) {
                this.commitSearchResultsToStore(searchResults);
            }
        },

        /**
         * Function to fetches URLs.
         * @param {string} url - URL to search.
         * @param {function} successFunction - Function to work with success.
         * @returns {void}
         */
        fetch: function (url, successFunction) {
            // Todo abbrechbar machen, wenn ein weiterer Request kommt
            fetchPolyfill(url)
                .then(response => response.json())
                .then(searchResults => {
                    successFunction(searchResults);
                })
                .catch(error => {
                    // todo isBusy auf false setzen
                    console.warn("The fetch of the data failed with the following error message: " + error);
                });
        },

        /**
         * Filter out all results whose score is not greater than the specified score.
         * @param {object[]} searchResults - Results from search wiht bkg service.
         * @returns {object[]} The filtered search results.
         */
        filterSearchResultsByScore: function (searchResults) {
            return searchResults.filter(result => result.score > this.score);
        },

        /**
         * todo
         * @param {string} resultSuggestion - todo
         * @returns {void}
         */
        createGeoSearchUrl: function (resultSuggestion) {
            return this.geoSearchUrl + "?bbox=" + this.extent + "&outputformat=json&srsName=" + this.epsg + "&count=1&query=" + encodeURIComponent(resultSuggestion);
        },

        /**
         * Prepare the results and commit to Searchbar results.
         * @param {object[]} searchResults - todo
         * @returns {void}
         */
        commitSearchResultsToStore: function (searchResults) {
            const preparedSearchResults = [];

            // todo nach Scoring sortieren.
            searchResults.forEach(searchResult => {
                preparedSearchResults.push({
                    name: searchResult.features[0].properties.text,
                    type: searchResult.features[0].properties.typ,
                    geometry: searchResult.features[0].geometry,
                    searchId: this.id,
                    searchResultsLength: searchResults.length
                });
            });

            this.$store.commit("Searchbar/changeSearch", {
                id: this.id,
                isBusy: false,
                searchResults: preparedSearchResults
            });
        }
    }
};
</script>

<template>
    <div class="Bkg-Searchbar">
        <!-- nothing -->
    </div>
</template>
