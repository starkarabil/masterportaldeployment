define(function (require) {
    var MouseHoverTemplate = require("text!modules/mouseHover/template.html"),
        Model = require("modules/mouseHover/model"),
        MouseHoverView;

    MouseHoverView = Backbone.View.extend({
        model: Model,
        template: MouseHoverTemplate,
        id: "mousehoverpopup",
        initialize: function () {
            this.listenTo(this.model, "change:mhpresult", this.render);
            Radio.trigger("Map", "addOverlay", this.model.get("mhpOverlay"));
        },
        render: function () {
            $(this.model.get("element")).tooltip({
                html: true,
                title: this.model.get("mhpresult"),
                placement: "auto",
                template: "<div class='tooltip' role='tooltip'><div class='tooltip-inner mouseHover'></div></div>",
                animation: true
            });
            this.model.showPopup();
        }
    });

    return MouseHoverView;
});
