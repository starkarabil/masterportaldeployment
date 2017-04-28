define(function (require) {
    require("bootstrap");

    var Template = require("text!modules/mmlFilter/templateMobile.html"),
        Radio = require("backbone.radio"),
        $ = require("jquery"),
        MobileMMLFilterView;

    MobileMMLFilterView = Backbone.View.extend({
        className: "modal fade unselectable mmlFilter",
        id: "div-mmlFilter-content-mobile",
        template: _.template(Template),
        events: {
            "click #div-mmlFilter-reset-mobile": "resetKategorien",
            "click #div-mmlFilter-execute-mobile": "executeFilter",
            "click .input-mmlFilter-filter-time-mobile": "toggleTimeMode",
            "click .div-mmlFilter-panel-heading-mobile": "singleShowTargetFilter",
            "click .panel-heading": "togglePanel",
            "show.bs.collapse .panel-collapse": "toggleTriangleGlyphicon",
            "hide.bs.collapse .panel-collapse": "toggleTriangleGlyphicon",
            "click .div-mmlFilter-header-close-mobile": "closeMMLFilter",
            "touchmove #mmlKategorien": function (evt) {
                evt.stopPropagation();
            },
            "touchmove #mmlZeitraum": function (evt) {
                evt.stopPropagation();
            },
            "change #fromDate": "fromDateChanged",
            "change #toDate": "toDateChanged"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "change:isVisible": this.toggleMMLFilter
            });

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON(),
                isVisible = this.model.getIsVisible();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
            $("#div-mmlFilter-content-mobile").modal({
                backdrop: "static",
                show: isVisible
            });
        },

        fromDateChanged: function (evt) {
            var fromDate = evt.target.value;

            $("#toDate").attr("min", fromDate);
        },

        toDateChanged: function (evt) {
            var toDate = evt.target.value;

            $("#fromDate").attr("max", toDate);
        },

        /**
         * [@description Schließt das DOM und entfernt die View vollständig.]
         */
        destroyFilter: function () {
            this.hideMMLFilter();
            this.remove();
        },

        /**
         * Triggert das Schließen des MMLFilter
         */
        closeMMLFilter: function () {
            Radio.trigger("MMLFilter", "hideFilter");
        },

        /**
         * Panels werden aus- und eingeklappt.
         * @param {MouseEvent} evt - Click auf .panel-heading
         */
        togglePanel: function (evt) {
            // eventuell anderes geöffnetes Panel wird eingeklappt
            $("#div-mmlFilter-content-mobile").find(".in").collapse("hide");
            // aktuelles Panel wird aus- oder eingeklappt
            $(evt.currentTarget).next().collapse("toggle");
        },
        toggleTriangleGlyphicon: function (evt) {
            var glyphiconDom = $(evt.target).parent().find(".mml-triangle-glyph");

            if (evt.type === "show") {
                glyphiconDom.removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
            }
            else if (evt.type === "hide") {
                glyphiconDom.removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
            }
        },

        /**
         * Schaltet die Sichtbarkeit der View
         * @param {object} evt Event des Models
         */
        toggleMMLFilter: function (evt) {
            var isVisible = evt.changed.isVisible;

            if (isVisible) {
                this.showMMLFilter();
            }
            else {
                this.hideMMLFilter();
            }
        },

        // schaltet Filterwindow sichtbar
        showMMLFilter: function () {
            $("#div-mmlFilter-content-mobile").modal("show");
        },

        // schaltet Filterwindow unsichtbar
        hideMMLFilter: function () {
            $("#div-mmlFilter-content-mobile").modal("hide");
        },

        toggleTimeMode: function (evt) {
            var timeModeId = evt.target.id,
                isUserdefined = timeModeId === "userdefined" ? true : false;

            $(evt.target).parent().find(".row").each(function (index, row) {
                if (isUserdefined) {
                    $(row).show();
                }
                else {
                    $(row).hide();
                }
            });
        },

        resetKategorien: function () {
            var status = $("#div-mmlFilter-reset-mobile").attr("value");

            if (status === "deaktivieren") {
                $(".div-mmlFilter-filter-kategorien").children(":checkbox").each(function (index, kategorie) {
                    $(kategorie).prop("checked", false);
                });
                $("#div-mmlFilter-reset-text-mobile").html("Alle Kategorien aktivieren");
                $("#div-mmlFilter-reset-mobile").attr("value", "aktivieren");
            }
            else {
                $("#div-mmlFilter-reset-mobile").attr("value", "deaktivieren");
                $(".div-mmlFilter-filter-kategorien").children(":checkbox").each(function (index, kategorie) {
                    $(kategorie).prop("checked", true);
                });
                $("#div-mmlFilter-reset-text-mobile").html("Alle Kategorien deaktivieren");
            }
        },

        executeFilter: function () {
            var selectedKat = [],
                selectedStatus = [],
                selectedTimeId = $("input[name='zeitraum']:checked").val(),
                date = new Date(),
                daysDiff,
                timeDiff,
                fromDate,
                toDate;

            $(".div-mmlFilter-filter-kategorien").children(":checked").each(function (index, kategorie) {
                selectedKat.push(kategorie.id);
            });

            $(".div-mmlFilter-filter-status").children(":checked").each(function (index, status) {
                selectedStatus.push(status.id);
            });

            if (selectedTimeId !== "ignore-time") {
                daysDiff = selectedTimeId === "7days" ? 7 : selectedTimeId === "30days" ? 30 : 0;
                timeDiff = daysDiff * 24 * 3600 * 1000;
                fromDate = (selectedTimeId !== "userdefined" && selectedTimeId !== "ignore-time") ? new Date(date - (timeDiff)) : new Date($("#fromDate").val());
                toDate = (selectedTimeId !== "userdefined" && selectedTimeId !== "ignore-time") ? date : new Date($("#toDate").val());

                this.model.setSelectedKat(selectedKat);
                this.model.setSelectedStatus(selectedStatus);
                this.model.setFromDate(fromDate);
                this.model.setToDate(toDate);
                this.model.executeFilter(false);
            }
            else {
                this.model.setSelectedKat(selectedKat);
                this.model.setSelectedStatus(selectedStatus);
                this.model.executeFilter(true);
            }

            Radio.trigger("MMLFilter", "hideFilter");
        }
    });

    return MobileMMLFilterView;
});
