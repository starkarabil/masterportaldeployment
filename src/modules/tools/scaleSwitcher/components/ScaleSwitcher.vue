<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import Tool from "../../Tool.vue";
import getters from "../store/gettersScaleSwitcher";
import mutations from "../store/mutationsScaleSwitcher";

/**
 * Tool to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 */
export default {
    name: "ScaleSwitcher",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/ScaleSwitcher", Object.keys(getters)),
        ...mapGetters("Map", ["scales"]),
        scale: {
            get () {
                return this.$store.state.Map.scale;
            },
            set (value) {
                this.$store.commit("Map/setScale", value);
            }
        },
        formattedScales: function () {
            return this.scales.map(scale => {
                return {
                    text: "1:" + scale,
                    value: scale
                };
            });
        }
    },

    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Map", ["setResolutionByIndex"]),
        ...mapMutations("Tools/ScaleSwitcher", Object.keys(mutations)),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.ScaleSwitcher.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        setResolutionWrapper (selected) {
            this.setResolutionByIndex(this.scales.indexOf(selected.value));
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="scale-switcher"
            >
                <v-select
                    id="scale-switcher-select"
                    v-model="scale"
                    label="Maßstab"
                    :items="formattedScales"
                    return-object
                    @change="setResolutionWrapper($event)"
                />
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";

    label {
        margin-top: 7px;
    }
    #scale-switcher-select {
        border: 2px solid @secondary;
    }
</style>
