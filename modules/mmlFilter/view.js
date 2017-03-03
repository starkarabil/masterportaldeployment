define([
    "text!modules/mmlFilter/template.html",
    "modules/mmlFilter/model"

], function () {

    var Template = require("text!modules/mmlFilter/template.html"),
        Model = require("modules/mmlFilter/model"),

        MMLFilterView;

    MMLFilterView = Backbone.View.extend({
        model: new Model(),
        className: "unselectable",
        template: _.template(Template),
        events: {
            "click #btn-mmlFilter-toggle": "toggleMMLFilter",
            "click .filterHeader": "toggleMMLFilterSection",
            "click #div-mmlFilter-reset": "resetKategorien",
            "click #div-mmlFilter-execute": "executeFilter"
        },

        initialize: function () {
            this.listenTo(this.model, {
//                "change:featuresInExtent": this.render
            });

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
        },

        toggleMMLFilter: function () {
            var startWidth = $("#div-mmlFilter-content").css("width"),
                endWidth = startWidth === "0px" ? "334px" : "0px";

            $("#div-mmlFilter-content").animate({
                width: endWidth
            }, {
                duration: "slow",
                progress: function () {
                    var divWidth = $("#div-mmlFilter-content").css("width");

                    $("#btn-mmlFilter-toggle").css("right", divWidth);
                }
            });
        },

        toggleMMLFilterSection: function (evt) {
            var isClosed = $(evt.target).hasClass("glyphicon-chevron-down");

            // alle Filter einklappen
            $(evt.target).parent().parent().find(".div-mmlFilter-filter").each(function (index, filter) {
                $(filter).prev().children().addClass("glyphicon-chevron-down");
                $(filter).prev().children().removeClass("glyphicon-chevron-up");
                $(filter).hide();
            });
            // Wenn speziellen Filter wieder ausklappen
            if (isClosed) {
                $(evt.target).parent().next().show();
                $(evt.target).addClass("glyphicon-chevron-up");
                $(evt.target).removeClass("glyphicon-chevron-down");
            }
            else {
                $(evt.target).parent().next().hide();
                $(evt.target).addClass("glyphicon-chevron-down");
                $(evt.target).removeClass("glyphicon-chevron-up");
            }
        },

        resetKategorien: function () {
            console.log("reset");
        },

        executeFilter: function () {
            console.log("Execute");
        }
    });

    return MMLFilterView;
});
