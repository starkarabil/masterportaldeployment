define(function (require) {
    require("bootstrap");

    var Backbone = require("backbone"),
        $ = require("jquery"),
        LegendTemplate = require("text!modules/legend/templateMobile.html"),
        Legend = require("modules/legend/model"),
        MobileLegendView;

    MobileLegendView = Backbone.View.extend({
        model: new Legend(),
        id: "base-modal-legend",
        className: "modal bs-example-modal-sm legend fade in",
        template: _.template(LegendTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:legendParams": this.render
            });

            this.listenTo(Radio.channel("Legend"), {
                "toggleLegendWin": this.toggle
            });

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },

        toggle: function () {
            $("#base-modal-legend").modal({
                backdrop: true,
                show: true
            });
        }
    });

    return MobileLegendView;
});
