define(function (require) {

    var Config = require("config"),
        Template = require("text!modules/controls/baselayerToggle/template.html"),
        Model = require("modules/controls/baselayerToggle/model"),
        BaselayerToggleView;

    var BaselayerToggleView = Backbone.View.extend({
        className: "baselayerToggle unselectable",
        model: Model,
        template: _.template(Template),
        events: {
            "click": "baselayerToggleEvent"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:nextBaseLayer": this.nextBaselayerChanged
            });
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
        },
        baselayerToggleEvent: function () {
            this.model.baselayerToggle();
        },
        nextBaselayerChanged: function (evt) {
            var nextBaselayer = evt.get("nextBaseLayer"),
                nextBaselayerName = nextBaselayer.get("name");

            $(".baselayerToggleText").text(nextBaselayerName);
        }
    });

    return BaselayerToggleView;
});
