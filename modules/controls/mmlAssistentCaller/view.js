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
            console.log("tt");
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
        },
        assistentCall: function () {
            this.model.baselayerToggle();
        }
    });

    return MmlAssistentCallerView;
});
