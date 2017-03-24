define([

    "text!modules/controls/zoom/template.html",
    "eventbus"
], function (ZoomControlTemplate, EventBus) {

    var ZoomControlView = Backbone.View.extend({
        className: "row",
        template: _.template(ZoomControlTemplate),
        events: {
            "click .glyphicon-plus": "setZoomLevelUp",
            "click .glyphicon-minus": "setZoomLevelDown"
        },
        initialize: function () {
            this.render();
            EventBus.trigger("registerZoomButtonsInClickCounter", this.$el);
        },
        render: function () {
            var config = Radio.request("Parser", "getPortalConfig");

            this.$el.html(this.template);
            if (_.isUndefined(config.controls) === false && _.isUndefined(config.controls.style) === false) {
                $("#zoom").addClass(config.controls.style + "Zoom");
                $(".glyphicon.glyphicon-plus").addClass(config.controls.style);
                $(".glyphicon.glyphicon-minus").addClass(config.controls.style);
            }
        },
        setZoomLevelUp: function () {
            Radio.trigger("MapView", "setZoomLevelUp");
            Radio.trigger("ClickCounter", "zoomChanged");
        },
        setZoomLevelDown: function () {
            Radio.trigger("MapView", "setZoomLevelDown");
            Radio.trigger("ClickCounter", "zoomChanged");
        }
    });

    return ZoomControlView;
});
