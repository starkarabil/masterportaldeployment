define(function (require) {

    var DesktopView = require("modules/tools/gfi/view"),
        Radio = require("backbone.radio"),
        Template = require("text!modules/tools/gfi/desktop/simpleLister/template.html"),
        GFISimpleListerView;

    GFISimpleListerView = DesktopView.extend({
        id: "simple-lister",
        template: _.template(Template),
        events: {
            "click p:first-child": function () {
                this.model.setIsVisible(false);
                Radio.trigger("MouseHover", "styleDeselGFI", this.model.getTheme().getFeature());
            }
        },

        /**
         * Zeichnet das Template
         */
        render: function () {
            var theme = this.model.getTheme(),
                street = theme.getFeature().get("str"),
                housenumber = theme.getFeature().get("hsnr");

            this.$el.html(this.template({street: street, housenumber: housenumber}));
            this.delegateEvents();
        },

        /**
         * Fügt das GFI an den SimpleLister oder eben nicht
         */
        toggle: function () {
            if (this.model.getIsVisible() === true) {
                Radio.trigger("SimpleLister", "setIsVisible", true);
                $("#simple-lister-table").html(this.$el);
                Radio.trigger("MapView", "setCenter", this.model.getCoordinate());
            }
            else {
                Radio.trigger("SimpleLister", "renderContent");
                Radio.trigger("SimpleLister", "show");
            }
            Radio.trigger("MMLFilter", "hideFilter");
        },

        removeView: function () {
            this.remove();
        }
    });

    return GFISimpleListerView;
});
