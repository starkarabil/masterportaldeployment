define([
], function () {

    var MMLFilter = Backbone.Model.extend({

        defaults: {
            mapHeight: $("#map").height(), // Filterwindow-Höhe
            filterMaxHeight: $("#map").height() - 238
        },

        initialize: function () {
        }
    });

    return MMLFilter;
});
