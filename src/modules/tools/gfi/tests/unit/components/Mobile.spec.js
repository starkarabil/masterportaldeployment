import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Mobile from "../../../components/templates/Mobile.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/Mobile.vue", () => {

    it("should have a title", () => {
        const wrapper = shallowMount(Mobile, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/html",
                    getTitle: () => "Hallo"
                }
            },
            localVue
        });

        expect(wrapper.find(".modal-title").text()).to.be.equal("Hallo");
    });

    it("should have the child component Default (-Theme)", () => {
        const wrapper = shallowMount(Mobile, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/html",
                    getTitle: () => "Hallo"
                }
            },
            localVue
        });

        expect(wrapper.findComponent({name: "Default"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        const wrapper = shallowMount(Mobile, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/html",
                    getTitle: () => "Hallo"
                }
            },
            localVue
        });

        expect(wrapper.find("button.close").exists()).to.be.true;
    });


    it("should emitted close event if button is clicked", async () => {
        const wrapper = shallowMount(Mobile, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo"
                    }
                },
                localVue
            }),
            button = wrapper.find(".close");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should emitted close event if clicked outside the modal", async () => {
        const wrapper = shallowMount(Mobile, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo"
                    }
                },
                localVue
            }),
            div = wrapper.find(".modal-mask");


        await div.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the modal", async () => {
        const wrapper = shallowMount(Mobile, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo"
                    }
                },
                localVue
            }),
            modal = wrapper.find(".modal-dialog");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should render the footer slot within .modal-footer", () => {
        const wrapper = shallowMount(Mobile, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/html",
                        getTitle: () => "Hallo"
                    }
                },
                slots: {
                    footer: "<div>Footer</div>"
                },
                localVue
            }),
            footer = wrapper.find(".modal-footer");

        expect(footer.text()).to.be.equal("Footer");
    });

});