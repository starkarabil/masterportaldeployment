<script>
// Hiwneis: Testsuche, um zu testen, wie sich die Suche verhält, wenn mehere Suchservices Ergebnisse liefern!
import {mapGetters} from "vuex";

export default {
    name: "SearchbarTest2",
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
                    searchResults: []
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
        search: function () {
            this.$store.commit("Searchbar/changeSearch", {
                id: this.id,
                isBusy: false,
                searchResults: []
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

