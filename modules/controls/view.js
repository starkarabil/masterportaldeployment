define(function (require) {

    var $ = require("jquery"),
        ControlsView;

    ControlsView = Backbone.View.extend({
        className: "container-fluid controls-view",
        id: "controls",
        initialize: function () {
            this.render();

            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            var result = Radio.request("ParametricURL", "getResult"),
                config = Radio.request("Parser", "getPortalConfig");

            if (!_.has(result, "STYLE") || _.values(_.pick(result, "STYLE"))[0].toUpperCase() !== "SIMPLE") {
                $(".ol-overlaycontainer-stopevent").append(this.$el);
                // $(mapViewPort).append(this.$el);
            }
            if (_.isUndefined(config.controls) === false && _.isUndefined(config.controls.style) === false) {
                $("#controls").addClass(config.controls.style + "Controls");
            }

        },
        addRow: function (id) {
            this.$el.append("<div class='row' id='" + id + "'></div>");
            return this.$el.children().last();
        }
    });

    return ControlsView;
});
