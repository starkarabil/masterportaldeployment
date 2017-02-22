define(function (require) {

    var DesktopView = require("modules/tools/gfi/view"),
        Radio = require("backbone.radio"),
        Template = require("text!modules/tools/gfi/desktop/template.html"),
        GFIDetachedView;

    GFIDetachedView = DesktopView.extend({
        className: "gfi gfi-detached",
        template: _.template(Template),

        /**
         * Zeichnet das Template und macht es "draggable"
         */
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".gfi-header",
                stop: function (evt, ui) {
                    $(".gfi").css("left", (ui.position.left / $("#lgv-container").width() * 100 + "%"));
                }
            });
        },

        /**
         * Blendet das Popover ein oder aus
         */
        toggle: function () {
            if (this.model.getIsVisible() === true) {
                this.$el.show();
                this.setGfiLeftPosition();
                Radio.trigger("MapMarker", "showMarker", this.model.getCoordinate());
                if (Radio.request("Parser", "getPortalConfig").mapMarkerModul.marker === "mapMarker") {
                    Radio.trigger("MapView", "setCenter", this.model.getCoordinate());
                }
            }
            else {
                this.$el.hide();
                Radio.trigger("MapMarker", "hideMarker");
            }
        },

        setMarker: function () {
            if (this.model.getIsVisible() === true) {
                Radio.trigger("MapMarker", "showMarker", this.model.getCoordinate());
                Radio.trigger("MapView", "setCenter", this.model.getCoordinate());
            }
        },

        removeView: function () {
            Radio.trigger("MapMarker", "hideMarker");
            this.remove();
        },
        /**
         * Setzt die Position des GFI Fenster vom linken Rand
         */
        setGfiLeftPosition: function () {
            $(".gfi").css("left", ((($("#lgv-container").width() - $(".gfi-content").width()) - 50) / $("#lgv-container").width()) * 100 + "%");
        }
    });

    return GFIDetachedView;
});
