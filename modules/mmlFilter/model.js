define(function (require) {
    var ol = require("openlayers"),
        Radio = require("backbone.radio"),
        MMLFilterModel;

    MMLFilterModel = Backbone.Model.extend({
        defaults: {
            // Gibt an ob der Filter sichtbar ist
            isVisible: false,
            selectedKat: [],
            selectedStatus: [],
            fromDate: "",
            toDate: "",
            features: [],
            selFeatures: [],
            layerID: "",
            maxDate: new Date(),
            minDate: ""
        },
        initialize: function () {
            var mmlFilterConfig = Radio.request("Parser", "getPortalConfig").mmlFilter,
                layerId = mmlFilterConfig && mmlFilterConfig.layerId ? mmlFilterConfig.layerId : "",
                channel = Radio.channel("MMLFilter");

            this.setLayerId(layerId);
            this.setMinDate();
            channel.on({
                "featuresLoaded": this.prepareFeatures,
                "toggleFilter": this.toggleMMLFilter,
                "hideFilter": this.hideMMLFilter
            }, this);

            Radio.trigger("Layer", "checkIfFeaturesLoaded");
        },
        toggleMMLFilter: function () {
            this.setIsVisible(!this.getIsVisible());
        },
        hideMMLFilter: function () {
            this.setIsVisible(false);
        },
        prepareFeatures: function () {
            var prepFeatures = [],
                layerId = this.getLayerId(),
                layerModel = Radio.request("ModelList", "getModelByAttributes", {"id": layerId}),
                layer = layerModel.get("layer"),
                source = layer.getSource(),
                features;

            if (source instanceof ol.source.Cluster) {
                source = source.getSource();
            }
            features = source.getFeatures();
            _.each(features, function (feature) {
                var datum = feature.get("start").slice(0, 4) + "-" + feature.get("start").slice(4, 6) + "-" + feature.get("start").slice(6, 8);

                prepFeatures.push({
                    "id": feature.get("mmlid"),
                    "kat": feature.get("skat"),
                    "status": feature.get("statu"),
                    "datum": datum
                });
            });
            this.setFeatures(prepFeatures);
        },
        executeFilter: function (ignoreTime) {
            this.filterByKat();
            this.filterByStatus();
            if (ignoreTime === false) {
                this.filterByDate();
            }
            this.showFilteredFeatures();
        },
        filterByKat: function () {
            var selectedKat = this.getSelectedKat(),
                features = this.getFeatures(),
                filteredFeatures = [];

            _.each(selectedKat, function (kat) {
                _.each(features, function (feature) {
                    if (feature.kat === kat) {
                        filteredFeatures.push(feature);
                    }
                });
            });
            this.setSelFeatures(filteredFeatures);
        },
        filterByStatus: function () {
            var selectedStatus = this.getSelectedStatus(),
                features = this.getSelFeatures(),
                filteredFeatures = [];

             _.each(selectedStatus, function (status) {
                _.each(features, function (feature) {
                    if (feature.status === status) {
                        filteredFeatures.push(feature);
                    }
                });
            });
            this.setSelFeatures(filteredFeatures);
        },
        filterByDate: function () {
            var fromDate = this.getFromDate().getTime(),
                toDate = this.getToDate().getTime(),
                features = this.getSelFeatures(),
                filteredFeatures = [];

                _.each(features, function (feature) {
                    var datum = new Date(feature.datum).getTime();

                    if ((datum >= fromDate && datum <= toDate)) {
                        filteredFeatures.push(feature);
                    }
                });
            this.setSelFeatures(filteredFeatures);
        },
        showFilteredFeatures: function () {
            var selFeatures = this.getSelFeatures(),
                layerId = this.getLayerId(),
                layer = Radio.request("ModelList", "getModelByAttributes", {"id": layerId}),
                idList = [];

            _.each(selFeatures, function (feature) {
                idList.push(feature.id);
            });
            layer.hideAllFeatures();
            layer.showFeaturesByAttr(idList, "mmlid");
        },

        // getter setter
        setSelectedKat: function (value) {
            this.set("selectedKat", value);
        },
        getSelectedKat: function () {
            return this.get("selectedKat");
        },
        setSelectedStatus: function (value) {
            this.set("selectedStatus", value);
        },
        getSelectedStatus: function () {
            return this.get("selectedStatus");
        },
        setFromDate: function (value) {
            this.set("fromDate", value);
        },
        getFromDate: function () {
            return this.get("fromDate");
        },
        setToDate: function (value) {
            this.set("toDate", value);
        },
        getToDate: function () {
            return this.get("toDate");
        },
        setFeatures: function (value) {
            this.set("features", value);
        },
        getFeatures: function () {
            return this.get("features");
        },
        setSelFeatures: function (value) {
            this.set("selFeatures", value);
        },
        getSelFeatures: function () {
            return this.get("selFeatures");
        },
        setMapWidth: function (value) {
            this.set("mapWidth", value);
        },
        getMapWidth: function () {
            return this.get("mapWidth");
        },

        setLayerId: function (value) {
            this.set("layerId", value);
        },

        getLayerId: function () {
            return this.get("layerId");
        },

        setIsVisible: function (value) {
            this.set("isVisible", value);
        },

        getIsVisible: function () {
            return this.get("isVisible");
        },

        getMaxDate: function () {
            return this.get("maxDate");
        },

        setMinDate: function () {
            var d = new Date();

            d.setDate(d.getDate() - 90);
            this.set("minDate", d);
        },

        getMinDate: function () {
            return this.get("minDate");
        }
    });

    return new MMLFilterModel();
});
