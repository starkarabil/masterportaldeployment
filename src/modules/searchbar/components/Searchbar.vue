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
    <div class="searchbar">
        <input
            v-model="inputMessage"
            class="inputField"
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
    .searchbar {
        right: 0px;
        top: 40px;
        position: absolute;
        z-Index: 5;
    }
    .inputField {
        width: 400px;
        height: 30px;
    }
    .glyphicon {
        position: relative;
        right: 20px;
    }
    .glyphicon-remove {
        cursor: pointer;
    }
</style>
