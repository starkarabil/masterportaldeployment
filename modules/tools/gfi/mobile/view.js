define(function (require) {
    require("bootstrap/modal");

    var GFIView = require("modules/tools/gfi/view"),
        Template = require("text!modules/tools/gfi/mobile/template.html"),
        GFIMobileView;

    GFIMobileView = GFIView.extend({
        className: "modal fade gfi-mobile",
        template: _.template(Template),
        id: "gfi-mobile",
        /**
         * Zeichnet das Template und erstellt das Bootstrap Modal
         */
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
            $("#gfi-mobile").modal({
                backdrop: "static",
                show: false
            });
        },

        /**
         * Blendet das Modal ein oder aus
         */
        toggle: function () {
            if (this.model.getIsVisible() === true) {
                $("#gfi-mobile").modal("show");
            }
            else {
                $("#gfi-mobile").modal("hide");
            }
        },

        /**
         * Löscht das Modal Backdrop und sich selbst
         */
        removeView: function () {
            $(".modal-backdrop").remove();
            this.remove();
        }
    });

    return GFIMobileView;
});
