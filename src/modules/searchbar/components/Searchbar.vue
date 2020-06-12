<script>
import {mapGetters} from "vuex";

export default {
    name: "Searchbar",
    data: () => ({
        inputMessage: "",
        resultList: []
    }),
    computed: {
        ...mapGetters("Searchbar", ["minimalCharacters", "placeholder", "resultSettings", "searchInputValue", "components", "searches"])
    },
    watch: {
        // todo Bei starten der Suche alles zu allen Ergebnissen eine zeile anzeigen mit initial "Suche läuft"!
        // Wenn Suche zu Ende ist Ergebnis anzeigen oder "Nichts gefunden!". Feedback für den Nutzer wichtig.
        searches (searches) {
            if (this.checkIfAllSearchesReady(searches) && this.searchInputValue !== "") {
                this.resultList = this.findFirstResultsByType(searches);
            }

        }
    },
    methods: {
        /**
         * Checks if all searches have finished their search.
         * @param {object[]} searches - All results from search requests.
         * @returns {boolean} Describes if all searches are terminated.
         */
        checkIfAllSearchesReady: function (searches) {
            // todo nicht auf alle warten.
            return searches.every(singleSearch => singleSearch.isBusy === false);
        },

        /**
         * Find first results from search results.
         * @param {object[]} searchResults - The results from search requests.
         * @returns {object[]} The first results.
         */
        findFirstResultsByType: function (searchResults) {
            // todo: konfigurierbar machen ob nur das erste oder die ersten x angezeigt werden sollen.
            // todo: Reihenfolge der Suchergebisse nach Reihenfolge der konfigurierten Suchen (oder index setzen!).
            const firstResults = [];

            searchResults.forEach(singleSearch => {
                firstResults.push(singleSearch.searchResults[0]);
            });

            return firstResults;
        },

        /**
         * Checks if input is longer than minimal characters, then saves the value as query in store.
         * @param {event} event - The keyup event.
         * @returns {void}
         */
        keyUp (event) {
            const inputValue = event.target.value;

            // todo abort search
            if (inputValue.length >= this.minimalCharacters) {
                this.$store.commit("Searchbar/searchInputValue", inputValue);
            }
        },

        /**
         * Clean the input field, the search input value in the store and the result list.
         * @returns {void}
         */
        cleanInputMessage () {
            this.inputMessage = "";
            this.$store.commit("Searchbar/searchInputValue", "");
            this.resultList = [];
        },

        /**
         * Show results from a clicked search.
         * @param {string} searchId - The id from clicked search.
         * @returns {void}
         */
        showResultsFromClickedSearchId: function (searchId) {
            const search = this.searches.find(singleSearch => singleSearch.id === searchId);

            this.resultList = search.searchResults;
        },

        /**
         * Show first results from searches.
         * @returns {void}
         */
        showFirstResultsFromSearches: function () {
            this.resultList = this.findFirstResultsByType(this.searches);
        },

        zoomAndHighlightResult: function (result) {
            const geometry = result.geometry;

            // Todo andere Geometrien
            // Highlighten der Geometrien bzw setzen eines Markers
            // Was ist mit Einträgen ohne Koordinate z.B. Fachlayer aus der Suche tree?
            if (geometry.type.toUpperCase() === "POINT") {
                Radio.trigger("MapView", "setCenter", geometry.coordinates, this.resultSettings.zoomLevelForPoint);
            }
        }
    }
};
</script>

<template lang="html">
    <div class="searchbar">
        <div
            v-for="searchService in components"
            :key="searchService.name"
        >
            <component
                :is="searchService"
                :key="'searchService-' + searchService.name"
            />
        </div>
        <div class="input-group">
            <span class="input-group-btn">
                <button
                    type="submit"
                    class="btn btn-default glyphicon glyphicon-chevron-left"
                    @click="showFirstResultsFromSearches"
                />
            </span>
            <div class="form-group has-feedback">
                <input
                    id="searchbar-inputField"
                    v-model="inputMessage"
                    class="form-control"
                    :placeholder="placeholder"
                    @keyup="keyUp"
                />
                <span
                    v-if="inputMessage.length > 0"
                    class="glyphicon glyphicon-remove form-control-feedback"
                    @click="cleanInputMessage"
                />
                <span
                    v-else
                    class="glyphicon glyphicon-search form-control-feedback"
                />
            </div>
            <div id="result-container">
                <ul class="list-group">
                    <li
                        v-for="result in resultList"
                        :key="result.searchType + result.name"
                        class="list-group-item"
                        @click="zoomAndHighlightResult(result)"
                    >
                        {{ result.name }}
                        <a
                            href="#"
                            class="list-group-item-theme"
                            @click="showResultsFromClickedSearchId(result.searchId)"
                        >
                            {{ result.searchId }}
                            <span class="badge">{{ result.searchResultsLength }}</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
    @font_family_1: "MasterPortalFont Bold","Arial Narrow",Arial,sans-serif;

    #searchbar-inputField {
        width: 400px;
        &::placeholder {
            font-family: @font_family_1;
            font-size: 13px;
        }
    }

    .glyphicon-remove {
        pointer-events: initial;
        cursor: pointer;
        z-index: 3;
    }

    .glyphicon-search {
        z-index: 3;
    }

    #result-container {
        width: 100%;
        z-index: 40;
        top: 3em;
        position: absolute;
        max-height: 50vh;
        overflow: auto;
        left: 0;
    }

    .badge {
        font-size: 90%;
    }

    .list-group-item {
        cursor: pointer;
    }

    .list-group-item-theme {
        float: right;
        color: #337ab7;
        font-size: 90%;
    }
</style>
