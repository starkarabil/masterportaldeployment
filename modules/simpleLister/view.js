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
            "click #div-simpleLister-extentList": "appendMoreFeatures"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "render": this.render
            });

            this.render();
        },

        appendMoreFeatures: function () {
            this.model.appendFeatures();
        },

        toggleSimpleList: function () {
            var glyphicon = this.model.getGlyphicon();

            if (glyphicon === "glyphicon-triangle-right") {
                this.getLayerFeaturesInExtent();
                this.model.setGlyphicon("glyphicon-triangle-left");
                this.model.setDisplay("block");
                this.$el.css({width: "41%"});
                $("#searchbarInMap").css({left: "calc(42% + 43px)"});
            }
            else {
                this.model.setGlyphicon("glyphicon-triangle-right");
                this.model.setDisplay("none");
                this.$el.css({width: "0%"});
                $("#searchbarInMap").css({left: "43px"});
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
