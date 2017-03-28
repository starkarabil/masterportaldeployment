define(function (require) {

    var Template = require("text!modules/controls/mmlAssistentCaller/templateWelcomeScreen.html"),
        Model = require("modules/controls/mmlAssistentCaller/model"),
        MmlAssistentCallerWelcome;

    MmlAssistentCallerWelcome = Backbone.View.extend({
        className: "modal unselectable mmlWelcomeScreen",
        id: "div-mmlWelcomeScreen",
        model: Model,
        template: _.template(Template),
        events: {
            "click .mmlWelcomeScreen-close": "destroy",
            "click .mmlWelcomeScreen-map": "destroy",
            "click .mmlWelcomeScreen-plus": "assistentCall"
        },
        initialize: function () {
            var welcomeScreen = this.model.getWelcomeScreen();

            if (welcomeScreen === true) {
                this.render();
            }
            else {
                this.remove();
            }
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
            this.$el.modal({
                backdrop: "static",
                show: true
            });
        },
        assistentCall: function () {
            this.model.getParameterValues();
            this.destroy();
        },
        destroy: function () {
            this.$el.modal("hide");
            this.remove();
        }
    });

    return MmlAssistentCallerWelcome;
});
