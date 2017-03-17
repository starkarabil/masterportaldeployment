define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        MmlAssistantCallerModel;

    MmlAssistantCallerModel = Backbone.Model.extend({
        defaults: {
            visible: false, // shows / hides control
            assistantURL: "" // URL to open
        },
        initialize: function () {
            this.getConfiguration();
        },
        /**
         * Sets configuration for tool definition.
         */
        getConfiguration: function () {
            var portalConfig = Radio.request("Parser", "getPortalConfig"),
                controls = portalConfig.controls ? portalConfig.controls : null,
                mmlNewIssueControl = controls ? controls.mmlNewIssueButton : null,
                visible = mmlNewIssueControl && mmlNewIssueControl.visible ? mmlNewIssueControl.visible : false,
                url = mmlNewIssueControl && mmlNewIssueControl.assistantURL ? mmlNewIssueControl.assistantURL : "";

            this.setVisible(visible);
            this.setAssistantURL(url);
        },
        /**
         * Collects parameters for URL and calls openMMLAssistant
         */
        getParameterValues: function () {
            var url = this.getAssitentURL(),
                center = Radio.request("MapView", "getCenter"),
                centerString = center.join(),
                zoomlevel = Radio.request("MapView", "getZoomLevel").toString(),
                activeBaseLayer = Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true, isVisibleInMap: true}),
                activeBaseLayerString = "";

            // erstellt kommaseparierten String der aktiven Baselayer
            _.each(activeBaseLayer, function (layer) {
                var name = layer.get("name");

                activeBaseLayerString = activeBaseLayerString === "" ? name : "," + name;
            });

            this.openMMLAssistant(url, centerString, zoomlevel, activeBaseLayerString);
        },
        /**
         * Opens Link wirth parameters
         * @param {string} url    URL
         * @param {string} center coordinates x,y
         * @param {string} zoom   zoomLevel
         * @param {string} layer  Layernames
         */
        openMMLAssistant: function (url, center, zoom, layer) {
            var link = url + "?mapCenter=" + center + "&mapZoomLevel=" + zoom + "&mapBaseLayer=" + layer;

            window.open(link,'_blank');
        },
        /**
         * Setter für assistantURL
         * @param {string} val URL to open on click
         */
        setAssistantURL: function (val) {
            this.set("assistantURL", val);
        },
        /**
         * Getter für assistantURL
         * @return {string} URL to open on click
         */
        getAssitentURL: function () {
            return this.get("assistantURL");
        },
        /**
         * Setter für visible
         * @param {boolean} val new visible state
         */
        setVisible: function (val) {
            this.set("visible", val);
        },
        /**
         * Getter für visible
         * @return {boolean} visible state
         */
        getVisible: function () {
            return this.get("visible");
        }
    });

    return new MmlAssistantCallerModel();
});
