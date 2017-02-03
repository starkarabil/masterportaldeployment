define([
    "text!modules/simpleLister/template.html",
    "modules/simpleLister/model"

], function () {

    var Template = require("text!modules/simpleLister/template.html"),
        SimpleLister = require("modules/simpleLister/model"),

        SimpleListerView;

    SimpleListerView = Backbone.View.extend({
        model: new SimpleLister(),
        className: "simple-lister-view",
        template: _.template(Template),
        events: {
            "click .simple-lister-button": "showSimpleList"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:featuresInExtent": this.render
            });
            this.render();
        },
        showSimpleList: function () {
            this.model.getLayerFeaturesInExtent("Anliegen");
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#lgv-container").append(this.$el.html(this.template(attr)));
        }
    });

    return SimpleListerView;
});
