define(function (require) {

    var Template = require("text!modules/controls/mmlAssistentCaller/templateWelcomeScreen.html"),
        Model = require("modules/controls/mmlAssistentCaller/model"),
        MmlAssistentCallerWelcome;

    MmlAssistentCallerWelcome = Backbone.View.extend({
        className: "unselectable",
        model: Model,
        template: _.template(Template),
        events: {
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
            this.$el.modal({
                backdrop: "static",
                show: false
            });
        },
        assistentCall: function () {
            this.model.getParameterValues();
        }
    });

    return MmlAssistentCallerWelcome;
});
