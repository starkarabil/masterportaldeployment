define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        MmlAssistentCallerModel;

    MmlAssistentCallerModel = Backbone.Model.extend({
        defaults: {
        },
        initialize: function () {
        }
    });

    return new MmlAssistentCallerModel();
});
