define(function (require) {

    var Radio = require("backbone.radio"),
        $ = require("jquery"),
        Config = require("config"),
        Model = require("modules/mmlMobileHeader/model"),
        HeaderView;

     HeaderView = Backbone.View.extend({
        className: "mobileHeader",
        model: new Model(),
        events: {
            "click div.filter": function () {
                Radio.trigger("MMLFilter", "toggleFilter");
            },
            "click .arrow": "mobileBackBtnClicked"
        },
        template: _.template("<div><img class=\"arrow\" src=\"<%= arrowImage %>\"></div>" +
                            "<div class=\"title\"><%= title %></div>" +
                            "<div class=\"filter\"><img class=\"filter\" src=\"<%= filterImage %>\"></div>"),
        initialize: function () {
            this.setParams();
            if (Radio.request("Util", "isViewMobile")) {
                this.render();
                $(".lgv-container #map").css("height", $(window).height() - this.$el.height() - 20 + "px");
                Radio.trigger("Map", "updateSize");
            }
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".lgv-container").prepend(this.el);
        },
        setParams: function () {
            if (Config && Config.mmlMobileHeader && Config.mmlMobileHeader.url) {
                this.model.setArrowTargetUrl(Config.mmlMobileHeader.url);
            }
        },
        mobileBackBtnClicked: function () {
            Radio.trigger("MmlMobileHeader", "mobileBackButtonClicked");
            window.open(this.model.getArrowTargetUrl(), "_self");
        }
    });

    return HeaderView;
});
