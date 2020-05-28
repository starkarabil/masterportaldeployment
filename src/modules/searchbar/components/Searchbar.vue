<script>
import {mapGetters} from "vuex";

export default {
    name: "Searchbar",
    data: () => ({inputMessage: ""}),
    computed: {
        ...mapGetters("Searchbar", ["minimalCharacters", "placeholder", "resultSettings", "query"])
    },
    methods: {
        /**
         * Checks if input is longer than minimal characters, then saves the value as query in store.
         * @param {event} event - The keyup event.
         * @returns {void}
         */
        keyUp (event) {
            const inputValue = event.target.value;

            // todo abort search
            if (inputValue.length >= this.minimalCharacters) {
                this.$store.commit("Searchbar/query", inputValue);
            }
        },

        /**
         * Clean the input field and the query in the store.
         * @returns {void}
         */
        cleanInputMessage () {
            this.inputMessage = "";
            this.$store.commit("Searchbar/query", "");
            // todo close recommended list
        }
    }
};
</script>

<template lang="html">
    <div class="form-group">
        <input
            v-model="inputMessage"
            class="searchbar-inputField form-control"
            :placeholder="placeholder"
            @keyup="keyUp"
        >
        <span
            v-if="inputMessage.length > 0"
            class="glyphicon glyphicon-remove"
            @click="cleanInputMessage"
        />
        <span
            v-else
            class="glyphicon glyphicon-search"
        />
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
    .glyphicon {
        position: absolute;
        right: 0px;
    }
    .glyphicon-remove {
        cursor: pointer;
    }
</style>
