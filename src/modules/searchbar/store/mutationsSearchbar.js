export default {
    searchInputValue (state, value) {
        state.searchInputValue = value;
    },
    searchResults (state, value) {
        state.searchResults.push(value);
    }
};
