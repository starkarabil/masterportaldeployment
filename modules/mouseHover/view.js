define(function (require) {
    var Model = require("modules/mouseHover/model"),
        MouseHoverView;

    MouseHoverView = Backbone.View.extend({
        model: Model,
        id: "mousehoverpopup",
        initialize: function () {
            this.listenTo(this.model, "change:mhpresult", this.render);
        },
        render: function () {
            $(this.model.get("element")).tooltip({
                html: true,
                title: this.model.get("mhpresult"),
                placement: "auto",
                template: "<div class='tooltip' role='tooltip'><div class='tooltip-inner mouseHover'></div></div>",
                animation: false
            });
            this.model.showPopup();
        }
    });

    return MouseHoverView;
});
