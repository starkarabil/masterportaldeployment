define([
    "openlayers"

], function () {

    var ol = require("openlayers"),
        SimpleListerModel;

    SimpleListerModel = Backbone.Model.extend({
        defaults: {
            featuresInExtent: [],
            featuresPerPage: 20, // Anzahl initialer Features in Liste
            totalFeaturesInPage: 0, // Aktuelle Anzahl an Features in Liste
            totalFeatures: 0, // Anzahl aller Features im Extent
            glyphicon: "glyphicon-triangle-right",
            display: "none"
        },

        initialize: function () {
            Radio.trigger("Map", "registerListener", "moveend", this.getLayerFeaturesInExtent, this);
            this.getParams();
        },
        getParams: function () {
            var configJSON = Radio.request("Parser", "getPortalConfig"),
                simpleLister;

            if (configJSON && configJSON.simpleLister) {
                simpleLister = configJSON.simpleLister;
                this.setLayerId(simpleLister.layerId);
                this.setErrortxt(simpleLister.errortxt || "Keine Features im Kartenausschnitt");
                this.setFeaturesPerPage(simpleLister.featuresPerPage);
            }
        },

        // holt sich JSON-Objekte aus Extent und gewünschte Anzahl in Liste und initiiert setter
        getLayerFeaturesInExtent: function () {
            var featuresPerPage = this.get("featuresPerPage"),
                jsonfeatures = Radio.request("ModelList", "getLayerFeaturesInExtent", this.getLayerId()),
                totalFeatures = jsonfeatures.length;

            this.set("totalFeatures", totalFeatures);
            this.setFeaturesInExtent(jsonfeatures, featuresPerPage);
        },

        // holt sich JSON-Objekte aus Extent und verdoppelt gewünschte Anzahl in Liste und initiiert setter
        appendFeatures: function () {
            var featuresPerPage = this.get("featuresPerPage") + this.get("totalFeaturesInPage"),
                jsonfeatures = Radio.request("ModelList", "getLayerFeaturesInExtent", this.getLayerId());

            this.setFeaturesInExtent(jsonfeatures, featuresPerPage);
        },

        // getter for featuresInExtent
        getFeaturesInExtent: function () {
            return this.get("featuresInExtent");
        },

        // setter for featuresInExtent
        setFeaturesInExtent: function (jsonFeaturesInExtent, number) {
            var totalFeatures = jsonFeaturesInExtent.length,
                number = totalFeatures < number ? totalFeatures : number,
                jsonFeatures = _.last(jsonFeaturesInExtent, number),
                features = [];

            _.each(jsonFeatures, function (jsonFeature) {
                features.push(JSON.parse(jsonFeature));
            });

            this.set("featuresInExtent", features);
            this.set("totalFeaturesInPage", number);
            this.trigger("render");
        },
        triggerGFI: function (id) {
            var feature = _.find(this.getFeaturesInExtent(),{id: id});

            Radio.trigger("GFI", "createGFI", feature);
        },
        // getter for glyphicon
        getGlyphicon: function () {
            return this.get("glyphicon");
        },
        // setter for glyphicon
        setGlyphicon: function (value) {
            this.set("glyphicon", value);
        },

        // getter for display
        getDisplay: function () {
            return this.get("display");
        },
        // setter for display
        setDisplay: function (value) {
            this.set("display", value);
        },

        // getter for layerId
        getLayerId: function () {
            return this.get("layerId");
        },
        // setter for layerId
        setLayerId: function (value) {
            this.set("layerId", value);
        },
        // getter for errortxt
        getErrortxt: function () {
            return this.get("errortxt");
        },
        // setter for errortxt
        setErrortxt: function (value) {
            this.set("errortxt", value);
        },

        // setter für featuresPerPage
        setFeaturesPerPage: function (value) {
            this.set("featuresPerPage", value);
        },
        // getter für featuresPerPage
        getFeaturesPerPage: function () {
            return this.get("featuresPerPage");
        },

        /**
         * Holt sich die Coordinate zur Id des in der Liste gehoverten Features und triggert im Mousehover, um den Style des Features in der Karte anzupassen.
         */
        triggerMouseHoverById: function (id) {
            var coord = this.getFeatureCoordById(id);

            if (coord) {
                Radio.trigger("MouseHover", "hoverByCoordinates", coord);
            }
        },

        /**
         * Holt sich die Coordinate zur Id des in der Liste zuletzt gehoverten Features und triggert im Mousehover, um den Style des Features in der Karte zurück zu setzen.
         */
        triggerMouseHoverLeave: function (id) {
            var coord = this.getFeatureCoordById(id);

            if (coord) {
                Radio.trigger("MouseHover", "resetStyle", coord);
            }
        },

        /**
         * Gibt die Koordinate zu der Feature Id zurück.
         */
        getFeatureCoordById: function (id) {
            var features = this.getFeaturesInExtent(),
                coord,
                feature;

                feature = _.find(features, function (feat) {
                    return feat.id.toString() === id;
                }),
                coord = feature ? feature.geometry.coordinates : null;

                return coord;
        }
    });

    return SimpleListerModel;
});
