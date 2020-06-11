import bkg from "../components/SearchbarBkg.vue";
import test from "../components/SearchbarTest.vue";

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
    },
    searches: []
};
