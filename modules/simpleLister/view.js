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
            "click #div-simpleLister-extentList": "appendMoreFeatures",
            "mouseenter .entry": "mouseenterEntry",
            "mouseleave .entry": "mouseleaveEntry",
            "click .entry": "triggerGFI"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "render": this.render
            });

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $("#lgv-container").append(this.$el.html(this.template(attr)));
        },
        triggerGFI: function (evt) {
            this.model.triggerGFI(parseInt(evt.currentTarget.id));
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

        /**
         * Hebt Zeilen mit dieser id hervor
         */
        highlightItemInList: function (id) {
            $("#simple-lister-table").find("#" + id.toString()).each(function (index, item) {
                $(item).addClass("simple-lister-highlight");
            });
        },

        /**
         * Aufhebung der Hervorhebung von Zeilen mit dieser id
         */
        lowlightItemInList: function (id) {
            $("#simple-lister-table").find("#" + id.toString()).each(function (index, item) {
                $(item).removeClass("simple-lister-highlight");
            });
        },

        /**
         * Starten des Triggers für MouseHover
         */
        mouseenterEntry: function (evt) {
            var id = evt.target.id ? evt.target.id : $(evt.target).parent()[0].id;

            this.highlightItemInList(id);
            this.model.triggerMouseHoverById(id);
        },

        /**
         * Starten des Triggers für Mouseleave
         */
        mouseleaveEntry: function (evt) {
            var id = evt.target.id ? evt.target.id : $(evt.target).parent()[0].id;

            this.lowlightItemInList(id);
            this.model.triggerMouseHoverLeave(id);
        }
    });

    return SimpleListerView;
});
