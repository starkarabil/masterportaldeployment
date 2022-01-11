import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsLayerSelector";

const {fillConfig} = actions;

describe("src/modules/layerSelector/store/actionsLayerSelector.js", () => {

    describe("fillConfig", () => {
        it("should fill the config if source is not set and channel or event do not exist", done => {
            const state = {
                events: [
                    {
                        source: "selectNaturraum",
                        filter: (category) => {
                            return category === "Ettersberg";
                        },
                        deselectPreviousLayers: "category",
                        layerIds: ["2101"],
                        extent: [578563, 5692144, 579669, 5692806]
                    }
                ],
                default: {
                    showMenuInDesktopMode: false,
                    showLayerId: null,
                    deselectPreviousLayers: "allways",
                    layerIds: [],
                    openFolderForLayerIds: [],
                    filter: null
                }
            };

            testAction(fillConfig, null, state, {}, [], {}, done);
        });
    });

});
