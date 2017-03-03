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
            "mouseover .entry": "mouseoverEntry",
            "mouseleave .entry": "mouseleaveEntry"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "highlightItem": this.highlightItemInList,
                "lowlightItem": this.lowlightItemInList,
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
        mouseoverEntry: function (evt) {
            var id = evt.target.id ? evt.target.id : $(evt.target).parent()[0].id;

            this.model.triggerMouseHoverById(id);
        },

        mouseleaveEntry: function () {
            this.model.triggerMouseHoverLeave();
        }
    });

    return SimpleListerView;
});
