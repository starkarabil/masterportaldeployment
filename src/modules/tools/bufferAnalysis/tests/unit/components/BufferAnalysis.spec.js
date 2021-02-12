import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import BufferAnalysisComponent from "../../../components/BufferAnalysis.vue";
import BufferAnalysis from "../../../store/indexBufferAnalysis";
import {expect} from "chai";
import sinon from "sinon";
import {createLayersArray} from "../store/helpers/functions";
// import Layer from "../../../../../../../modules/core/modelList/layer/model";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe.only("src/modules/tools/bufferAnalysis/components/BufferAnalysis.vue", () => {
    const mockMapGetters = {
            map: () => ({removeLayer: sinon.spy()})
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            bufferAnalysis:
                            {
                                "name": "translate#common:menu.tools.bufferAnalysis",
                                "glyphicon": "glyphicon-random"
                            }
                        }
                    }
                }
            }
        };
    let store;

    beforeEach(() => {

        BufferAnalysis.actions.checkIntersection = sinon.spy();
        BufferAnalysis.actions.showBuffer = sinon.spy();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        BufferAnalysis
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/BufferAnalysis/setActive", true);
    });

    it("renders the bufferAnalysis", () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue});

        expect(wrapper.find("#layer-analysis").exists()).to.be.true;
    });

    it("do not render the bufferAnalysiss select if not active", () => {
        store.commit("Tools/BufferAnalysis/setActive", false);
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue});

        expect(wrapper.find("#layer-analysis").exists()).to.be.false;
    });

    it("has initially set nothing to layer-analysis-select-source and layer-analysis-select-target", () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
            selectSource = wrapper.find("#layer-analysis-select-source"),
            selectTarget = wrapper.find("#layer-analysis-select-target");

        expect(selectSource.element.value).to.equals("");
        expect(selectTarget.element.value).to.equals("");
    });

    it("has initially set eight available options to select", async () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
            layers = createLayersArray(3);
        let options = [];

        await store.commit("Tools/BufferAnalysis/setSelectOptions", layers);
        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equals(8); // 2 * 3 (selectOptions) + 2 (resultType)
    });

    it("triggers all important actions when all inputs are set", async () => {
        const wrapper = shallowMount(BufferAnalysisComponent, {store, localVue}),
            selectSource = wrapper.find("#layer-analysis-select-source"),
            sourceOptions = selectSource.findAll("option"),
            selectTarget = wrapper.find("#layer-analysis-select-target"),
            targetOptions = selectTarget.findAll("option"),
            range = wrapper.find("#layer-analysis-range-text"),
            layers = createLayersArray(3);

        await store.commit("Tools/BufferAnalysis/setSelectOptions", layers);
        await wrapper.vm.$nextTick();

        sourceOptions.at(1).setSelected();
        await wrapper.vm.$nextTick();
        expect(layers[1].setIsSelectedSpy.calledOnce).to.equal(true);

        range.setValue(1000);
        await wrapper.vm.$nextTick();
        expect(BufferAnalysis.actions.showBuffer.calledOnce).to.equal(true);

        targetOptions.at(2).setSelected();
        await wrapper.vm.$nextTick();
        expect(layers[2].setIsSelectedSpy.calledTwice).to.equal(true);
        expect(BufferAnalysis.actions.checkIntersection.calledOnce).to.equal(true);
    });
});
