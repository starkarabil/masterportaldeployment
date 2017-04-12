define(function (require) {
    require("bootstrap");

    var Backbone = require("backbone"),
        $ = require("jquery"),
        CoordPopup = require("modules/coordpopup/model"),
        CoordPopupTemplate = require("text!modules/coordpopup/template.html"),
        CoordPopupView;

    CoordPopupView = Backbone.View.extend({
        model: new CoordPopup(),
        id: "coord-popup",
        template: _.template(CoordPopupTemplate),
        events: {
            "click .glyphicon-remove": "destroy"
        },
        initialize: function () {

            this.listenTo(this.model, "change:coordinateGeo", this.render);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.model.getElement().popover({
                placement: function () {
                    if (this.getPosition().top > $("#lgv-container").width() / 2) {
                        return "top";
                    }
                    else {
                        return "bottom";
                    }
                },
                html: true,
                content: this.$el
            });
            this.model.showPopup();
        },
        destroy: function () {
            this.model.destroyPopup();
        }
    });

    return CoordPopupView;
});
