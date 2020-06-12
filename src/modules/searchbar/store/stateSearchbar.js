import bkg from "../components/SearchbarBkg.vue";
import test from "../components/SearchbarTest.vue";
// import test2 from "../components/SearchbarTest2.vue";

export default {
    minimalCharacters: 3,
    placeholder: "Suche Beispiel",
    searchInputValue: "",
    resultSettings: {
        length: 5,
        zoomLevelForPoint: 3,
        zoomOnHover: true,
        hightlightOnHover: true,
        zoomOnClick: true,
        highlightOnClick: true
    },
    components: {
        bkg: bkg,
        test: test
        // test2: test2
    },
    searches: []
};
