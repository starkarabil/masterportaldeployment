define(function (require) {

    var Radio = require("backbone.radio"),
        Template = require("text!modules/controls/mmlFilterButton/template.html"),
        MmlFilterButton;

     MmlFilterButton = Backbone.View.extend({
        template: _.template(Template),
        events: {
            "click": "togglefilter"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template()));
        },
        togglefilter: function () {
            Radio.trigger("MMLFilter", "toggleFilter");
        }
    });
    return MmlFilterButton;
});
