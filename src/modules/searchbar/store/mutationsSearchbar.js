export default {
    searchInputValue (state, value) {
        state.searchInputValue = value;
    },
    createSearch (state, value) {
        state.searches.push(value);
        console.log(state.searches);
        
    },
    changeSearch (state, value) {
        const searches = [];

        state.searches.forEach(singleSearch => {
            if (singleSearch.id === value.id) {
                searches.push(Object.assign(singleSearch, value));
            }
            else {
                searches.push(singleSearch);
            }
        });

        state.searches = searches;
        console.log(state.searches);
        
    }
};
