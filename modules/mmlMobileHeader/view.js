define(function (require) {

    var Radio = require("backbone.radio"),
        $ = require("jquery"),
        Config = require("config"),
        HeaderView;

     HeaderView = Backbone.View.extend({
        className: "mobileHeader",
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
            if (Config.mmlMobileHeader.url) {
                this.setUrl(Config.mmlMobileHeader.url);
            }
        },
        mobileBackBtnClicked: function () {
            Radio.trigger("MmlMobileHeader", "mobileBackButtonClicked");
            window.open(this.getUrl(), "_self");
        },
        setUrl: function (value) {
            this.url = value;
        },
        getUrl: function () {
            return this.url;
        }
    });

    return HeaderView;
});
