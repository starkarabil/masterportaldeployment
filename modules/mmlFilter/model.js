define([
], function () {

    var MMLFilter = Backbone.Model.extend({

        defaults: {
            mapHeight: $("#map").height(), // Map-Höhe
            mapWidth: $("#map").width(), // Map-Breite
            filterMaxHeight: $("#map").height() - 238,
            selectedKat: [],
            selectedStatus: [],
            fromDate: "",
            toDate: "",
            features: []
        },

        initialize: function () {
            var layer = Radio.request("ModelList", "getModelByAttributes",{"id": "6059"}).get("layer"),
                source = layer.getSource();

            if (source instanceof ol.source.Cluster) {
                source = source.getSource();
            }
            this.setFeatures(source.getFeatures());
            this.prepareFeatures();
        },
        prepareFeatures: function () {
            var features = this.getFeatures(),
                prepFeatures = [];

            _.each(features, function (feature, index) {

                // if (index === 1) {
                //     console.log(feature.getProperties());
                // }
                var von = feature.get("start").slice(0,4) + "-" + feature.get("start").slice(4,6) + "-" + feature.get("start").slice(6,8),
                    bis = feature.get("ende").slice(0,4) + "-" + feature.get("ende").slice(4,6) + "-" + feature.get("ende").slice(6,8);

                prepFeatures.push({
                    "id": feature.get("mmlid"),
                    "kat": feature.get("skat"),
                    "status": feature.get("statu"),
                    "von": von,
                    "bis": bis
                });
            });
            this.setFeatures(prepFeatures);

            // status = ["abgeschlossen", "In Bearbeitung"]
            // console.log(prepFeatures[0].kat);
        },
        executeFilter: function () {
            this.filterByKat();
            this.filterByStatus();
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
            this.setFeatures(filteredFeatures);
        },
        filterByStatus: function () {
            var selectedStatus = this.getSelectedStatus(),
                features = this.getFeatures(),
                filteredFeatures = [];

            console.log(features);
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
        }
    });

    return MMLFilter;
});
