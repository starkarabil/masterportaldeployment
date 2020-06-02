<script>
// Hiwneis: Testsuche, um zu testen, wie sich die Suche verhält, wenn mehere Suchservices Ergebnisse liefern!
import {mapGetters} from "vuex";

export default {
    name: "TestSearch",
    data () {
        return {
            "test": "123"
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
        search: function (searchInputValue) {
            const exmapleArray = [{
                name: "Test1" + searchInputValue,
                type: "TesttypA",
                service: "test"
            },
            {
                name: "Test2" + searchInputValue,
                type: "TesttypA",
                service: "test"
            },
            {
                name: "Test3" + searchInputValue,
                type: "TesttypB",
                service: "test"
            }];

            exmapleArray.forEach(result => this.$store.commit("Searchbar/searchResults", result));
        }
    }
};
</script>

<template>
    <div class="BKG-Searchbar">
        <!-- nothing -->
    </div>
</template>

