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
            var newStyle = Radio.request("Parser", "getPortalConfig").controls.style;

            this.$el.html(this.template);
            if (_.isUndefined(Radio.request("Parser", "getPortalConfig").controls.style) === false) {
                $(".glyphicon.glyphicon-plus").addClass(newStyle);
                $(".glyphicon.glyphicon-minus").addClass(newStyle);
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
