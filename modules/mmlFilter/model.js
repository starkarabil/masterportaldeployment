define([
], function () {

    var MMLFilter = Backbone.Model.extend({

        defaults: {
            mapHeight: $("#map").height(), // Map-Höhe
            mapWidth: $("#map").width(), // Map-Breite
            filterMaxHeight: $("#map").height() - 238,
            filterMaxHeightMobile: $("#map").height() - 345 // margin (20 * 2) + filter (3 * 50) + header (60) + button (60)
        },

        initialize: function () {
        }
    });

    return MMLFilter;
});
