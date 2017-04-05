define(function (require) {
    require("bootstrap/transition");
    require("bootstrap/collapse");
    require("jqueryui/widgets/datepicker");

    var Template = require("text!modules/mmlFilter/template.html"),
        Model = require("modules/mmlFilter/model"),
        MMLFilterView;

    MMLFilterView = Backbone.View.extend({
        id: "mmlFilter",
        className: "unselectable closed",
        template: _.template(Template),
        events: {
            "click #div-mmlFilter-reset": "resetKategorien",
            "click #div-mmlFilter-execute": "executeFilter",
            "click .div-mmlFilter-filter-time": "toggleTimeMode",
            "click #btn-fromDate": "btnFromDateClicked",
            "click #btn-toDate": "btnToDateClicked",
            "click .panel-heading": "togglePanel",
            // Dieses Ereignis wird sofort ausgelöst, wenn die Methode show aufgerufen wird.
            // Löst aus wenn ein Panel ausgeklappt wird.
            // http://holdirbootstrap.de/javascript/#collapse-events
            "show.bs.collapse .panel-collapse": "toggleTriangleGlyphicon",
            // Dieses Ereignis wird sofort ausgelöst, wenn die Methode hide aufgerufen wird.
            // Löst aus wenn ein Panel eingeklappt wird.
            // http://holdirbootstrap.de/javascript/#collapse-events
            "hide.bs.collapse .panel-collapse": "toggleTriangleGlyphicon"
        },

        initialize: function () {
            this.model = new Model();
            var channel = Radio.channel("MMLFilter");

            channel.on({
                "toggleFilter": this.toggleMMLFilter,
                "hideFilter": this.hideMMLFilter
            }, this);

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $("#map").append(this.$el.html(this.template(attr)));
        },

        /**
         * [@description Schließt das DOM und entfernt die View und das Model vollständig.]
         */
        destroyFilter: function () {
            var channel = Radio.channel("MMLFilter"),
                filter = this.$el;

            channel.reset();
            this.hideMMLFilter(filter);
            // remove entfernt alle Listener und das Dom-Element
            this.model.destroy();
            this.remove();
        },

        /**
         * Panels werden aus- und eingeklappt.
         * @param {MouseEvent} evt - Click auf .panel-heading
         */
        togglePanel: function (evt) {
            // eventuell anderes geöffnetes Panel wird eingeklappt
            this.$el.find(".in").collapse("hide");
            // aktuelles Panel wird aus- oder eingeklappt
            $(evt.currentTarget).next().collapse("toggle");
        },

        toggleTriangleGlyphicon: function (evt) {
            var parent = $(evt.target).parent(),
                glyphiconDom = parent.find(".mml-triangle-glyph");

            if (evt.type === "show") {
                glyphiconDom.removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
                parent.addClass("open");
            }
            else if (evt.type === "hide") {
                glyphiconDom.removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
                parent.removeClass("open");
            }
        },

        toggleMMLFilter: function () {
            var isOpen = this.$el.hasClass("closed");

            if (isOpen) {
                this.showMMLFilter();
            }
            else {
                this.hideMMLFilter();
            }
        },
        showMMLFilter: function (filter) {
            var filter = this.$el;

            this.shrinkViewport();
            filter.removeClass("closed");
            filter.addClass("open");
        },
        hideMMLFilter: function (filter) {
            var filter = this.$el;

            filter.addClass("closed");
            filter.removeClass("open");
            this.enlargeViewport();
        },
        shrinkViewport: function () {
             this.setViewportSize("61%", "left");
        },
        enlargeViewport: function () {
             this.setViewportSize("100%", "");
        },
        setViewportSize: function (size, float) {
            $(".ol-viewport").css({
                "width": size,
                "float": float
            });
            Radio.trigger("Map", "updateSize");
        },
        toggleTimeMode: function (evt) {
            var timeModeId = evt.target.id,
                isUserdefined = timeModeId === "userdefined" ? true : false;

            $(evt.target).parent().find(".rowDate").each(function (index, row) {
                if (isUserdefined) {
                    $(row).show();
                }
                else {
                    $(row).hide();
                }
            });
        },
        btnFromDateClicked: function () {
            var calAlreadyOpen = $("#fromDateDiv .ui-datepicker").is(":visible");

            $("#toDateDiv .ui-datepicker").hide();
            // wenn Kalender schon offen ist, verstecke ihn
            if (calAlreadyOpen === true) {
                $("#fromDateDiv .ui-datepicker").hide();
            }
            else {
                // wenn es schon einen Kalender gibt, zeige ihn an
                if ($("#fromDateDiv").find(".ui-datepicker").length !== 0) {
                    $("#fromDateDiv .ui-datepicker").show();
                }
                // wenn es noch keinen Kalender gibt, erstelle einen
                else {
                    $("#fromDateDiv").datepicker({
                        onSelect: function (dateTxt) {
                            $("#fromDateDiv .ui-datepicker").hide();
                            $("#fromDate").val(dateTxt);
                        },
                        dateFormat: "yy-mm-dd",
                        dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                        dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                        monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                        monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sept", "Okt", "Nov", "Dez"]
                    });
                }
            }
        },
        btnToDateClicked: function () {
            var calAlreadyOpen = $("#toDateDiv .ui-datepicker").is(":visible");

            $("#fromDateDiv .ui-datepicker").hide();
            // wenn Kalender schon offen ist, verstecke ihn
            if (calAlreadyOpen === true) {
                $("#toDateDiv .ui-datepicker").hide();
            }
            else {
                // wenn es schon einen Kalender gibt, zeige ihn an
                if ($("#toDateDiv").find(".ui-datepicker").length !== 0) {
                    $("#toDateDiv .ui-datepicker").show();
                }
                // wenn es noch keinen Kalender gibt, erstelle einen
                else {
                    $("#toDateDiv").datepicker({
                        onSelect: function (dateTxt) {
                            $("#toDateDiv .ui-datepicker").hide();
                            $("#toDate").val(dateTxt);
                        },
                        dateFormat: "yy-mm-dd",
                        dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                        dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                        monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                        monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sept", "Okt", "Nov", "Dez"]
                    });
                }
            }
        },
        resetKategorien: function () {
            var status = $("#div-mmlFilter-reset").attr("value");

            if (status === "deaktivieren") {
                $(".div-mmlFilter-filter-kategorien").children(":checkbox").each(function (index, kategorie) {
                    $(kategorie).prop("checked", false);
                });
                $("#div-mmlFilter-reset-text").html("Alle Kategorien aktivieren");
                $("#div-mmlFilter-reset").attr("value", "aktivieren");
            }
            else {
                $("#div-mmlFilter-reset").attr("value", "deaktivieren");
                $(".div-mmlFilter-filter-kategorien").children(":checkbox").each(function (index, kategorie) {
                    $(kategorie).prop("checked", true);
                });
                $("#div-mmlFilter-reset-text").html("Alle Kategorien deaktivieren");
            }
        },

        executeFilter: function () {
            var selectedKat = [],
                selectedStatus = [],
                selectedTimeId = $(".div-mmlFilter-filter-time").children(":checked")[0].id,
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

                if (fromDate.getTime() <= toDate.getTime()) {
                    $("#fromDateDiv").removeClass("has-error");
                    $("#toDateDiv").removeClass("has-error");
                    $("#toDateDiv").next().remove();
                    this.model.setSelectedKat(selectedKat);
                    this.model.setSelectedStatus(selectedStatus);
                    this.model.setFromDate(fromDate);
                    this.model.setToDate(toDate);
                    this.model.executeFilter(false);
                }
                else {
                    $("#toDateDiv").next().remove();
                    $("#fromDateDiv").addClass("has-error");
                    $("#toDateDiv").addClass("has-error");
                    $("#toDateDiv").after("<p style='color: #a94442;'>Zeitraum kann nicht aufgelöst werden.</p>");
                }
            }
            else {
                this.model.setSelectedKat(selectedKat);
                this.model.setSelectedStatus(selectedStatus);
                this.model.executeFilter(true);
            }
        }
    });

    return MMLFilterView;
});
