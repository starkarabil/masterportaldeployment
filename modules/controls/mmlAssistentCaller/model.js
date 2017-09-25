define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        ol = require("openlayers"),
        MmlAssistantCallerModel;

    MmlAssistantCallerModel = Backbone.Model.extend({
        defaults: {
            visible: false, // shows / hides control
            assistantURL: "", // URL to open
            welcomeScreen: false,
            landesgrenzeURL: "", // URL mit Landesgrenze
            sourceHH: null,
            isOutsideMessage: "Es können nur Anliegen in Hamburg gemeldet werden. Bitte verschieben Sie den Kartenausschnitt."
        },
        initialize: function () {
            this.getConfiguration();
            this.getBoundaryHH();
        },

        /**
         * Sets configuration for tool definition.
         */
        getConfiguration: function () {
            var portalConfig = Radio.request("Parser", "getPortalConfig"),
                controls = portalConfig.controls ? portalConfig.controls : null,
                mmlNewIssueControl = controls ? controls.mmlNewIssueButton : null,
                visible = mmlNewIssueControl && mmlNewIssueControl.visible ? mmlNewIssueControl.visible : false,
                url = mmlNewIssueControl && mmlNewIssueControl.assistantURL ? mmlNewIssueControl.assistantURL : "",
                welcomeScreen = mmlNewIssueControl && mmlNewIssueControl.welcomeScreen ? mmlNewIssueControl.welcomeScreen : false,
                isOutsideMessage = mmlNewIssueControl && mmlNewIssueControl.isOutsideMessage ? mmlNewIssueControl.isOutsideMessage : this.getIsOutsideMessage(),
                mapMarkerModul = Radio.request("Parser", "getPortalConfig").mapMarkerModul,
                landesgrenzeId = mapMarkerModul.dragMarkerLandesgrenzeId ? mapMarkerModul.dragMarkerLandesgrenzeId.toString() : null,
                landesgrenzeLayer = landesgrenzeId ? Radio.request("RawLayerList", "getLayerWhere", {id: landesgrenzeId}) : "",
                landesgrenzeURL = landesgrenzeLayer ? landesgrenzeLayer.get("url") : "";

            this.setLandesgrenzeURL(landesgrenzeURL);
            this.setAssistantURL(url);
            this.setWelcomeScreen(welcomeScreen);
            this.setVisible(visible);
            this.setIsOutsideMessage(isOutsideMessage);
        },

        // liest die landesgrenze_hh.json ein und ruft dann parse auf
        getBoundaryHH: function () {
            this.fetch({
                url: Radio.request("Util", "getPath", this.getLandesgrenzeURL()),
                cache: false,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Landesgrenze kann nicht geladen werden!", kategorie: "alert-danger"});
                }
            });
        },

        parse: function (data) {
            this.getFeatureFromResponse(data);
        },

        // sets polygon of hamburg
        getFeatureFromResponse: function (data) {
            var vectorSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON()
                });

            vectorSource.addFeatures(vectorSource.getFormat().readFeatures(data));
            this.set("sourceHH", vectorSource);
        },

        // returns boolean isInside Hamburg
        isInsideHH: function (coord) {
            var featureAtCoord = this.get("sourceHH").getFeaturesAtCoordinate(coord),
                isInside = featureAtCoord.length > 0 ? true : false;

            return isInside;
        },

        /**
         * Collects parameters for URL and calls openMMLAssistant
         */
        getParameterValues: function () {
            var url = this.getAssitentURL(),
                center = Radio.request("MapView", "getCenter"),
                isInside = this.isInsideHH(center),
                centerString = center.join(),
                zoomlevel = Radio.request("MapView", "getZoomLevel").toString(),
                activeBaseLayer = Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true, isVisibleInMap: true}),
                activeBaseLayerString = "";

            // Abbruch, wenn Punkt nicht in Hamburg
            if (!isInside) {
                Radio.trigger("Alert", "alert", {text: this.getIsOutsideMessage(), kategorie: "alert-info"});
                return;
            }

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
            var link = url + "?mapCenter=" + center + "&mapZoomLevel=" + zoom + "&mapBaseLayer=" + layer + "&vendor_maps_position=" + center;

            window.open(link, "_blank");
        },

        // getter for sourceHH
        getSourceHH: function () {
            return this.get("sourceHH");
        },
        // setter for sourceHH
        setSourceHH: function (value) {
            this.set("sourceHH", value);
        },

        // getter for landesgrenzeURL
        getLandesgrenzeURL: function () {
            return this.get("landesgrenzeURL");
        },
        // setter for landesgrenzeURL
        setLandesgrenzeURL: function (value) {
            this.set("landesgrenzeURL", value);
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
        },

        /**
         * Setter für welcomeScreen
         * @param {boolean} val new welcomeScreen state
         */
        setWelcomeScreen: function (val) {
            this.set("welcomeScreen", val);
        },
        /**
         * Getter für welcomeScreen
         * @return {boolean} welcomeScreen state
         */
        getWelcomeScreen: function () {
            return this.get("welcomeScreen");
        },

        // getter for isOutsideMessage
        getIsOutsideMessage: function () {
            return this.get("isOutsideMessage");
        },
        // setter for isOutsideMessage
        setIsOutsideMessage: function (value) {
            this.set("isOutsideMessage", value);
        }
    });

    return new MmlAssistantCallerModel();
});
