define([
    "text!modules/mmlFilter/template.html",
    "modules/mmlFilter/model",
    "jqueryui/widgets/datepicker",
    "bootstrap/collapse"

], function () {

    var Template = require("text!modules/mmlFilter/template.html"),
        Model = require("modules/mmlFilter/model"),
        bootstrap = require("bootstrap/collapse"),

        MMLFilterView;

    MMLFilterView = Backbone.View.extend({
        model: new Model(),
        className: "unselectable",
        template: _.template(Template),
        events: {
            "click #btn-mmlFilter-toggle": "toggleMMLFilter",
            // "click .filterHeader": "toggleMMLFilterSection",
            "click #div-mmlFilter-reset": "resetKategorien",
            "click #div-mmlFilter-execute": "executeFilter",
            "click .div-mmlFilter-filter-time": "toggleTimeMode",
            "click #btn-fromDate": "btnFromDateClicked",
            "click #btn-toDate": "btnToDateClicked",
            "click .div-mmlFilter-filter-header": "changeGlyph"
        },

        initialize: function () {
            $(".lgv-container").append("<div id = \"mmlFilter\"></div>");
            this.render();
        },
        changeGlyph: function (evt) {
            var parent = $(evt.target).parent(),
                isCollapsed = _.isUndefined(parent.find(".glyphicon-triangle-top")[0]);

            $("#mmlFilter").find(".glyphicon-triangle-top").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
            if (isCollapsed) {
               parent.find(".glyphicon-triangle-bottom").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
            }
            else {
                parent.find(".glyphicon-triangle-top").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
            }


        },
        render: function () {
            var attr = this.model.toJSON();

            $("#mmlFilter").append(this.$el.html(this.template(attr)));
        },

        toggleMMLFilter: function () {
            var startWidth = $("#div-mmlFilter-content").css("width"),
                endWidth = startWidth === "0px" ? "334px" : "0px";


            $("#div-mmlFilter-content").css("left", $("#map").css("width"));

            $("#div-mmlFilter-content").animate({
                width: endWidth
            }, {
                duration: "slow",
                progress: function () {
                    var newLeftToggle = String($("#map").width() - 45 - $("#div-mmlFilter-content").width()) + "px",
                        newLeftContent = String($("#map").width() - $("#div-mmlFilter-content").width()) + "px";

                    $("#div-mmlFilter-content").css("left",newLeftContent);
                    $("#btn-mmlFilter-toggle").css("left", newLeftToggle);
                }
            }, this);
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
        btnFromDateClicked: function () {
            var calAlreadyOpen = $("#fromDateDiv .ui-datepicker").is(":visible");

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
                        dateFormat: "dd-mm-yyyy",
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
                        dateFormat: "dd-mm-yyyy",
                        dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                        dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                        monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                        monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sept", "Okt", "Nov", "Dez"]
                    });
                }
            }
        },
        resetKategorien: function () {
            $(".div-mmlFilter-filter-kategorien").children(":checkbox").each(function (index, kategorie) {
                $(kategorie).prop("checked", false);
            });
        },

        executeFilter: function () {
            var selectedKat = [],
                selectedStatus = [],
                selectedTimeId = $(".div-mmlFilter-filter-time").children(":checked")[0].id,
                date = new Date(),
                daysDiff = selectedTimeId === "7days" ? 7 : selectedTimeId === "30days" ? 30 : 0,
                timeDiff = daysDiff * 24 * 3600 * 1000,
                fromDate = selectedTimeId !== "userdefined" ? new Date(date - (timeDiff)).toISOString().split("T")[0] : $("#fromDate").val(),
                toDate = selectedTimeId !== "userdefined" ? date.toISOString().split("T")[0] : $("#toDate").val();

            $(".div-mmlFilter-filter-kategorien").children(":checked").each(function (index, kategorie) {
                selectedKat.push(kategorie.id);
            });

            $(".div-mmlFilter-filter-status").children(":checked").each(function (index, status) {
                selectedStatus.push(status.id);
            });
            this.model.setSelectedKat(selectedKat);
            this.model.setSelectedStatus(selectedStatus);
            this.model.setFromDate(fromDate);
            this.model.setToDate(toDate);
            this.model.executeFilter();
        }
    });

    return MMLFilterView;
});
