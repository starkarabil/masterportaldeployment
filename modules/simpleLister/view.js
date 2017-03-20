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
            "mouseleave .entry": "mouseleaveEntry"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "change:totalFeaturesInPage": this.changedTotalFeaturesInPage
            });

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $("#lgv-container").append(this.$el.html(this.template(attr)));
        },

        appendMoreFeatures: function () {
            this.model.appendFeatures();
        },

        show: function (evt) {
            var glyphiconDom = $(evt.target);

            glyphiconDom.removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-left");
            $("#simple-lister-table").show();
            this.$el.css({width: "41%"});
            $("#searchbarInMap").css({left: "calc(42% + 43px)"});
            this.model.getLayerFeaturesInExtent();
        },

        hide: function (evt) {
            var glyphiconDom = $(evt.target);

            glyphiconDom.removeClass("glyphicon-triangle-left").addClass("glyphicon-triangle-right");
            $("#simple-lister-table").hide();
            this.$el.css({width: "0%"});
            $("#searchbarInMap").css({left: "43px"});
        },

        changedTotalFeaturesInPage: function () {
            var totalFeaturesInPage = this.model.getTotalFeaturesInPage(), // neue Anzahl an Features
                features = this.model.getFeaturesInExtent(),
                totalOld = $(".entry").length; // aktuelle Anzahl

            if (totalOld === 0) {
                // erstmalige Füllung: Alle Features eintragen
                _.each(features, function (feature) {
                    this.addEntry(feature);
                }, this);
            }
            else if (totalFeaturesInPage > totalOld) {
                // Features nachgeladen: nur neue Features hinzufügen
                var lastEntry = $(".entry").last()[0],
                    lastId = lastEntry.id,
                    indexLastId = _.findIndex(features, function (feat) {
                        var featId = feat.id.toString();

                        return featId === lastId;
                    }),
                    restFeatures = indexLastId !== -1 ? _.rest(features, indexLastId + 1) : null;

                _.each(restFeatures, function (feature) {
                    this.addEntry(feature);
                }, this);
            }
            else {
                // verschobener Ausschnitt: Liste leeren und neu füllen
                $(".entries").empty();
                // alle Features hinzufügen
                _.each(features, function (feature) {
                    this.addEntry(feature);
                }, this);
            }

            // toggle ggf. AppendFeatures Button
            this.updateAppendFeaturesButton();

            // update Heading
            this.updateListHeading();
        },

        updateListHeading: function () {
            var totalFeaturesInPage = this.model.getTotalFeaturesInPage(),
                totalFeatures = this.model.getTotalFeatures(),
                headingtext = "1 - " + totalFeaturesInPage + " von " + totalFeatures + " Einträgen",
                errortext = this.model.getErrortxt(),
                heading = totalFeaturesInPage === 0 ? errortext : headingtext;

            $(".heading").text(heading);
        },

        updateAppendFeaturesButton: function () {
            var totalFeaturesInPage = this.model.getTotalFeaturesInPage(),
                totalFeatures = this.model.getTotalFeatures();

            $("#div-simpleLister-extentList").remove();
            if (totalFeaturesInPage < totalFeatures) {
                var ele = "<div id='div-simpleLister-extentList' title='Liste erweitern'><span id='div-simpleLister-extentList-text'>Liste erweitern</span></div>";

                $(".entries").append(ele);
            }
        },

        addEntry: function (feat) {
            var div1 = "<div id='" + feat.id + "' class='entry'>",
                div2 = "<div class='address'>" + feat.properties.str + " " + feat.properties.hsnr + "</div>",
                div3 = "<div class='category'>" + feat.properties.kat_text + "</div>",
                div4 = "<div class='description'>",
                div5 = feat.properties.beschr.length > 50 ? feat.properties.beschr.substring(0, 50) + "..." : feat.properties.beschr,
                div6 = "</div>",
                div7 = "</div>",
                div8 = "<div class='line'></div>",
                ele = div1.concat(div2, div3, div4, div5, div6, div7, div8);

            $(".entries").append(ele);
        },

        toggleSimpleList: function (evt) {
            var glyphiconDom = $(evt.target);

            if (glyphiconDom.hasClass("glyphicon-triangle-right") === true) {
                this.show(evt);
            }
            else {
                this.hide(evt);
            }
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
