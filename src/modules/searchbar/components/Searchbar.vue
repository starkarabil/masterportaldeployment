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
            return searches.every(singleSearch => singleSearch.isBusy === false);
        },

        /**
         * Find first results from search results.
         * @param {object[]} searchResults - The results from search requests.
         * @returns {object[]} The first results.
         */
        findFirstResultsByType: function (searchResults) {
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
            // this.$store.commit("Searchbar/searchResults", []);
            this.resultList = [];
        },

        zoomAndHighlightResult: function (result) {
            const geometry = result.geometry;

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
        <div class="form-group has-feedback has-feedback-left">
            <input
                v-model="inputMessage"
                class="searchbar-inputField form-control"
                :placeholder="placeholder"
                @keyup="keyUp"
            >
            <span
                v-if="inputMessage.length > 0"
                class="glyphicon glyphicon-remove form-control-feedback"
                @click="cleanInputMessage"
            />
            <span
                v-else
                class="glyphicon glyphicon-search form-control-feedback"
            />
            <div>
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
                        >
                            {{ result.searchType }}
                            <!-- <span class="badge">10</span> -->
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
    @font_family_1: "MasterPortalFont Bold","Arial Narrow",Arial,sans-serif;

    .searchbar-inputField {
        &::placeholder {
            font-family: @font_family_1;
            font-size: 13px;
        }
    }

    .glyphicon-remove {
        pointer-events: initial;
        cursor: pointer;
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
