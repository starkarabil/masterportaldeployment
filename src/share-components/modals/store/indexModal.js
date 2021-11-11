export default {
    namespaced: true,
    state: {
        showing: false
    },
    mutations: {
        setShowing (state, prm) {
            state.showing = prm;
        }
    },
    getters: {
        showing: ({showing}) => showing
    }
};
