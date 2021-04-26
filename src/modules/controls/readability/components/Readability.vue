<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";

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
    name: "Readability",
    components: {
        ControlIcon
    },
    props: {
        layerIds: {
            type: Object,
            required: true
        },
        scaleBy: {
            type: Number,
            required: false,
            default: 2
        },
        scaleText: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data: function () {
        return {
            open: this.isInitOpen,
            overviewMap: null,
            mapChannel: Radio.channel("Map"),
            visibleInMapMode: null // set in .created
        };
    },
    computed: {
        ...mapGetters("Map", ["map", "layerById"]),
        ...mapGetters(["uiStyle"]),
        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        },
        localeSuffix () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? "Table" : "Control";
        }
    },
    created () {
        this.checkModeVisibility();
        this.mapChannel.on("change", this.checkModeVisibility);
    },
    beforeDestroy () {
        this.mapChannel.off("change", this.checkModeVisibility);
    },
    mounted () {
        console.log(this.layerIds, this.scaleBy, this.scaleText);
    },
    methods: {
        toggleEasyReadability () {
            console.log("toggle");
            this.scaleStrokeWidth();
        },
        scaleStrokeWidth () {
            this.layerIds.forEach(layerId => {
                const layer = this.layerById(layerId)?.olLayer,
                    model = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

                if (layer) {
                    console.log(layer, model);
                }
            });
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
        id="readability-wrapper"
    >
        <component
            :is="component"
            :class="['readability-button']"
            :title="$t(`common:modules.controls.readability.${open ? 'hide' : 'show'}Overview${localeSuffix}`)"
            icon-name="eye-open"
            :on-click="toggleEasyReadability"
        />
    </div>
    <div
        v-else
        :class="{hideButton: 'readability-button'}"
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

    #readability-wrapper {
        position: relative;
    }
    .hideButton {
        display: none;
    }
</style>
