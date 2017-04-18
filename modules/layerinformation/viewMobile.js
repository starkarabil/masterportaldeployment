define(function (require) {
    require("bootstrap");

    var Layerinformation = require("modules/layerinformation/model"),
        $ = require("jquery");
        LayerInformationMobileTemplate = require("text!modules/layerinformation/templateMobile.html"),
        LayerInformationView;

    LayerInformationView = Backbone.View.extend({
        model: new Layerinformation(),
        id: "layerinformation",
        className: "modal fade",
        template: _.template(LayerInformationMobileTemplate),
        events: {
            "click .glyphicon-remove": "hide"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "sync": this.render
            });
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(("#layerinformation")).modal({
                show: true
            });
        },

        hide: function () {
            $(("#layerinformation")).modal("hide");
        }
    });

    return LayerInformationView;
});
