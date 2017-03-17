define(function (require) {

    var Template = require("text!modules/controls/mmlAssistentCaller/template.html"),
        Model = require("modules/controls/mmlAssistentCaller/model"),
        MmlAssistentCallerView;

    MmlAssistentCallerView = Backbone.View.extend({
        className: "mmlAssistentCaller unselectable",
        model: Model,
        template: _.template(Template),
        events: {
            "click": "assistentCall"
        },
        initialize: function () {
            this.listenTo(this.model, "change:visible", this.render);
            this.render();
        },
        render: function () {
            var visible = this.model.getVisible(),
                attr = this.model.toJSON();

            if (visible === true) {
                $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
            }
            else {
                this.$el.remove();
            }
        },
        assistentCall: function () {
            this.model.getParameterValues();
        }
    });

    return MmlAssistentCallerView;
});
