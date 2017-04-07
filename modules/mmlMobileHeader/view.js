define(function (require) {

    var $ = require("jquery"),
        Model = require("modules/mmlMobileHeader/model"),
        Radio = require("backbone.radio"),
        HeaderView;

     HeaderView = Backbone.View.extend({
        model: new Model(),
        className: "mobileHeader",
        events: {
            "click div.filter": function () {
                Radio.trigger("MMLFilter", "toggleFilter");
            },
            "click .arrow": function () {
                Radio.trigger("MmlMobileHeader", "mobileBackButtonClicked");
            }
        },
        template: _.template("<div><img class=\"arrow\" src=\"<%= arrowImage %>\"></div>" +
                            "<div class=\"title\"><%= title %></div>" +
                            "<div class=\"filter\"><img class=\"filter\" src=\"<%= filterImage %>\"></div>"),
        initialize: function () {
            if (Radio.request("Util", "isViewMobile")) {
                this.render();
                $(".lgv-container #map").css("height", $(window).height() - this.$el.height() - 20 + "px");
                Radio.trigger("Map", "updateSize");
            }
            Radio.on("Util", {
                "isViewMobileChanged": function (isViewMobile) {
                    if (isViewMobile) {
                        this.render();
                    }
                    else {
                        this.$el.remove();
                    }
                }
            }, this);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".lgv-container").prepend(this.el);
        }
    });
    return HeaderView;
});
