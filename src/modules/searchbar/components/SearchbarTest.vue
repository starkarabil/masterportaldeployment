<script>
// Hiwneis: Testsuche, um zu testen, wie sich die Suche verhält, wenn mehere Suchservices Ergebnisse liefern!
import {mapGetters} from "vuex";

export default {
    name: "SearchbarTest",
    data () {
        return {
            id: "test",
            test: "123"
        };
    },
    computed: {
        ...mapGetters("Searchbar", ["searchInputValue"])
    },
    watch: {
        searchInputValue (searchInputValue) {
            if (searchInputValue !== "") {
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
        search: function (searchInputValue) {
            const exampleArray = [{
                name: "Test1" + searchInputValue,
                type: "TesttypA",
                geometry: {
                    coordinates: [564570.63, 5937829.56],
                    type: "Point"
                },
                searchType: "test"
            },
            {
                name: "Test2" + searchInputValue,
                type: "TesttypA",
                geometry: {
                    coordinates: [123, 456],
                    type: "Line"
                },
                searchType: "test"
            },
            {
                name: "Test3" + searchInputValue,
                type: "TesttypB",
                geometry: {
                    coordinates: [123, 456],
                    type: "Polygon"
                },
                searchType: "test"
            }];

            this.$store.commit("Searchbar/changeSearch", {
                id: this.id,
                isBusy: false,
                searchResults: exampleArray,
                searchResultsLength: exampleArray.length
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

