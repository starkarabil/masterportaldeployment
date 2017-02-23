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
            "click .simple-lister-button": "toggleSimpleList",
            "click .simple-lister-append-button": "appendMoreFeatures"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:featuresInExtent": this.render
            });

            this.render();
        },

        appendMoreFeatures: function () {
            this.model.appendFeatures();
        },

        toggleSimpleList: function () {
            var glyphicon = this.model.getGlyphicon();

            if (glyphicon === "glyphicon-chevron-right") {
                this.getLayerFeaturesInExtent();
                this.model.setGlyphicon("glyphicon-chevron-left");
                this.model.setDisplay("block");
            }
            else {
                this.model.setGlyphicon("glyphicon-chevron-right");
                this.model.setDisplay("none");
            }
            this.render();
        },
        getLayerFeaturesInExtent: function () {
            this.model.getLayerFeaturesInExtent();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#lgv-container").append(this.$el.html(this.template(attr)));
        }
    });

    return SimpleListerView;
});
