define(function (require) {

    var Model = require("modules/mmlMobileHeader/model"),
        Radio = require("backbone.radio"),
        HeaderView;

     HeaderView = Backbone.View.extend({
        model: new Model(),
        className: "mobileHeader",
        events: {
            "click .filter": function () {
                Radio.trigger("MMLFilter", "showFilter");
            },
            "click .arrow": "TODO"
        },
        template: _.template("<div><img class=\"arrow\" src=\"<%= arrowImage %>\"></div>" +
                            "<div class=\"title\"><%= title %></div>" +
                            "<div class=\"filter\"><img class=\"filter\" src=\"<%= filterImage %>\"></div>"),
        initialize: function () {
            if (Radio.request("Util", "isViewMobile")) {
                this.render();
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
