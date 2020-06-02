<script>
import {mapGetters} from "vuex";
import {fetch as fetchPolyfill} from "whatwg-fetch";

export default {
    name: "BKGSearch",
    data () {
        // todo: daten aus der config.json holen und hier überschreiben!
        return {
            "extent": [
                454591,
                5809000,
                700000,
                6075769
            ],
            "suggestCount": 10,
            "epsg": "EPSG:25832",
            "filter": "filter=(typ:*)",
            "score": 0.6,
            "suggestServiceURL": "/bkg_suggest",
            "geosearchServiceURL": "/bkg_geosearch"
        };
    },
    computed: {
        ...mapGetters("Searchbar", ["searchInputValue"])
    },
    watch: {
        searchInputValue (searchInputValue) {
            if (searchInputValue !== "") {
                this.search(searchInputValue);
            }
        }
    },
    methods: {
        /**
         * Starts the search with bkg service.
         * @param {string} searchInputValue - The input string to search.
         * @returns {void}
         */
        search: function (searchInputValue) {
            const suggestURL = this.createSuggestURL(searchInputValue);

            this.fetchDataFromBKGSearchService(suggestURL);
        },

        /**
         * Creates the complete URL to send request for bkg search service.
         * @param {string} searchInputValue - The input string to search
         * @returns {string} The search string for search service from bkg.
         */
        createSuggestURL: function (searchInputValue) {
            return this.suggestServiceURL + "?bbox=" + this.extent + "&outputformat=json&srsName=" + this.epsg + "&query=" + encodeURIComponent(searchInputValue) + "&" + this.filter + "&count=" + this.suggestCount;
        },

        /**
         * Featches the data form bkg search service.
         * @param {string} suggestURL - URL with search parameters.
         * @returns {void}
         */
        fetchDataFromBKGSearchService: function (suggestURL) {
            // todo: Suche abbrechen, wenn neuer Suchstring eintrifft.

            fetchPolyfill(suggestURL)
                .then(response => response.json())
                .then(searchResults => {
                    const resultsFilterByScore = this.filtersearchResultsByScore(searchResults);

                    this.prepareSearchresults(resultsFilterByScore);
                })
                .catch(error => {
                    console.warn("The fetch of the data failed with the following error message: " + error);
                });
        },

        /**
         * Filter out all results whose score is not greater than the specified score.
         * @param {object[]} searchResults - Results from search wiht bkg service.
         * @returns {object[]} The filtered search results.
         */
        filtersearchResultsByScore: function (searchResults) {
            return searchResults.filter(result => result.score > this.score);
        },

        /**
         * Prepare the results and commit to Searchbar results.
         * @param {object[]} resultsFilterByScore - Filtered results from search wiht bkg service.
         * @returns {void}
         */
        prepareSearchresults: function (resultsFilterByScore) {
            // todo: bkgSearch
            resultsFilterByScore.forEach(result => {
                this.$store.commit("Searchbar/searchResults", {
                    name: result.suggestion,
                    type: result.type,
                    service: "bkg"
                });
            });
        }
    }
};
</script>

<template>
    <div class="BKG-Searchbar">
        <!-- nothing -->
    </div>
</template>
