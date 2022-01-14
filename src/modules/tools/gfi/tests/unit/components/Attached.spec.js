import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Attached from "../../../components/templates/Attached.vue";

const localVue = createLocalVue();

config.mocks.$t = key => key;
localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/Attached.vue", () => {
    const mountOptions = {
        propsData: {
            feature: {
                getTheme: () => "Default",
                getMimeType: () => "text/xml",
                getTitle: () => "Hallo"
            }
        },
        components: {
            Default: {
                name: "Default",
                template: "<span />"
            }
        },
        computed: {
            clickCoord: () => [],
            styleContent: () => [{
                "max-width": "",
                "max-height": ""
            }]
        },
        localVue
    };

    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });
    /**
         * Is needed to run the tests.
         * Check if its fixed with vue 3
         * @see https://github.com/vuejs/vue-test-utils-next/issues/293
         * @returns {void}
         */
    before(() => {
        global.ShadowRoot = () => "";
    });

    it("should have a title", () => {
        wrapper = shallowMount(Attached, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            components: {
                Default: {
                    template: "<span />"
                }
            },
            computed: {
                clickCoord: () => [],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            localVue
        });

        expect(wrapper.find(".gfi-header h5").text()).to.be.equal("Hallo");
    });

    it("should have the child component Default (-Theme)", () => {
        wrapper = shallowMount(Attached, mountOptions);

        expect(wrapper.findComponent({name: "Default"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        wrapper = shallowMount(Attached, mountOptions);

        expect(wrapper.find("button.close").exists()).to.be.true;
    });


    it("should emitted close event if button is clicked", async () => {
        wrapper = shallowMount(Attached, mountOptions);
        const button = wrapper.find(".close");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the content", async () => {
        wrapper = shallowMount(Attached, mountOptions);
        const modal = wrapper.find(".gfi-content");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should render the footer slot within .gfi-footer", () => {
        wrapper = shallowMount(Attached, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            components: {
                Default: {
                    template: "<span />"
                }
            },
            computed: {
                clickCoord: () => [],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            slots: {
                footer: "<div class=\"gfi-footer\">Footer</div>"
            },
            localVue
        });
        const footer = wrapper.find(".gfi-footer");

        expect(footer.text()).to.be.equal("Footer");
    });
});
