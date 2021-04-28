<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import {scaleLayerStyle} from "./utils";

/**
 * Overview control that shows a mini-map to support a user's
 * sense of orientation within the map.
 *
 * TODO Currently using radio to detect 3D mode. Should eventually
 * listen to the vuex map module as soon as modes are modeled
 * there.
 * @listens Map#RadioTriggerMapChange
 */
export default {
    name: "EasyReadMode",
    components: {
        ControlIcon
    },
    props: {
        layerIds: {
            type: Array,
            required: true
        },
        scaleFactor: {
            type: Number,
            required: false,
            default: 2
        },
        scaleText: {
            type: Boolean,
            required: false,
            default: false
        },
        attributes: {
            type: Array,
            required: false,
            default: () => ["polygonStrokeWidth", "circleRadius", "clusterCircleRadius"]
        }
    },
    data: function () {
        return {
            open: this.isInitOpen,
            overviewMap: null,
            mapChannel: Radio.channel("Map"),
            visibleInMapMode: null, // set in .created
            attrs: null
        };
    },
    computed: {
        ...mapGetters("Map", ["map", "layerById"]),
        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        },
        localeSuffix () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? "Table" : "Control";
        },
        easyReadMode: {
            get () {
                return this.$store.state.easyReadMode;
            },
            set (v) {
                this.$store.commit("setEasyReadMode", v);
            }
        }
    },
    created () {
        this.checkModeVisibility();
        this.mapChannel.on("change", this.checkModeVisibility);
        this.attrs = this.scaleText ? [...this.attributes, "textScale", "clusterTextScale"] : this.attributes;
    },
    beforeDestroy () {
        this.mapChannel.off("change", this.checkModeVisibility);
    },
    methods: {
        toggleEasyReadMode () {
            this.easyReadMode = !this.easyReadMode;

            this.scaleLayerStyles();
        },
        scaleLayerStyles () {
            const scaleFactor = this.easyReadMode ? this.scaleFactor : 1 / this.scaleFactor;
            let layerId;

            for (layerId of this.layerIds) {
                scaleLayerStyle(layerId, scaleFactor, this.attrs);
            }
        },
        /**
         * Sets visibility flag depending on map mode; OverviewMap is not available in 3D mode.
         * @returns {void}
         */
        checkModeVisibility () {
            this.visibleInMapMode = Radio.request("Map", "getMapMode") !== "3D";
        }
    }
};
</script>

<template>
    <div
        v-if="visibleInMapMode"
        id="easy-read-mode-wrapper"
    >
        <component
            :is="component"
            class="easy-read-mode-button"
            :title="$t(`common:modules.controls.easy-read-mode.${easyReadMode ? 'disable' : 'enable'}`)"
            :icon-name="easyReadMode ? 'eye-close' : 'eye-open'"
            :on-click="toggleEasyReadMode"
        />
    </div>
    <div
        v-else
        :class="{hideButton: 'easy-read-mode-button'}"
    >
    </div>
</template>

<style lang="less" scoped>
    /* .ol-overviewmap has fixed height in openlayers css;
     * measured this value for 12px space between control contents */
    .space-above {
        margin-top: 136px;
    }
</style>

<style lang="less">
    /* ⚠️ unscoped css, extend with care;
     * control (.ol-overviewmap) is out of scope;
     * overriding with global rule that avoids leaks
     * by using local id #overviewmap-wrapper */

    @import "~variables";
    @box-shadow: 0 6px 12px @shadow;

    #easy-read-mode-wrapper {
        position: relative;
    }
    .hideButton {
        display: none;
    }
</style>
