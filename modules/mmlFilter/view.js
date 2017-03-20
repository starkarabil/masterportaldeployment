define(function (require) {
    require("bootstrap/transition");
    require("bootstrap/collapse");
    require("jqueryui/widgets/datepicker");

    var Template = require("text!modules/mmlFilter/template.html"),
        Model = require("modules/mmlFilter/model"),
        MMLFilterView;

    MMLFilterView = Backbone.View.extend({
        id: "mmlFilter",
        model: new Model(),
        className: "unselectable",
        template: _.template(Template),
        events: {
            "click #btn-mmlFilter-toggle": "toggleMMLFilter",
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
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
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
            var glyphiconDom = $(evt.target).parent().find(".mml-triangle-glyph");

            if (evt.type === "show") {
                glyphiconDom.removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
            }
            else if (evt.type === "hide") {
                glyphiconDom.removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
            }
        },

        toggleMMLFilter: function () {
            var mapWidth = $("#map").width(),
                startWidth = $("#div-mmlFilter-content").css("width"),
                endWidth = startWidth === "0px" ? (mapWidth / 3) + "px" : "0px";

            $("#div-mmlFilter-content").css("left", $("#map").css("width"));

            $("#div-mmlFilter-content").animate({
                width: endWidth
            }, {
                duration: "slow",
                progress: function () {
                    var newLeftToggle = String(mapWidth - 45 - $("#div-mmlFilter-content").width()) + "px",
                        newLeftContent = String(mapWidth - $("#div-mmlFilter-content").width()) + "px";

                    $("#div-mmlFilter-content").css("left", newLeftContent);
                    $("#btn-mmlFilter-toggle").css("left", newLeftToggle);
                }
            }, this);
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
        resetKategorien: function (evt) {
            var status = $("#div-mmlFilter-reset").attr("value");

            if (status === "deaktivieren") {
                $(".div-mmlFilter-filter-kategorien").children(":checkbox").each(function (index, kategorie) {
                    $(kategorie).prop("checked", false);
                });
                $("#div-mmlFilter-reset-text").html("Alle Kategorien aktivieren");
                $("#div-mmlFilter-reset").attr("value","aktivieren");
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
