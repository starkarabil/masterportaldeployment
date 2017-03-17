define([
], function () {

    var MMLFilter = Backbone.Model.extend({

        defaults: {
            mapHeight: $("#map").height(), // Map-Höhe
            mapWidth: $("#map").width(), // Map-Breite
            filterMaxHeight: $("#map").height() - 238
        },

        initialize: function () {
        }
    });

    return MMLFilter;
});
