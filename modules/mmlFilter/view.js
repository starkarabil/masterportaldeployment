define([
    "text!modules/mmlFilter/template.html",
    "modules/mmlFilter/model",
    "jqueryui/widgets/datepicker"

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
            "click #div-mmlFilter-execute": "executeFilter",
            "click .div-mmlFilter-filter-time": "toggleTimeMode",
            "click #btn-fromDate": "btnFromDateClicked",
            "click #btn-toDate": "btnToDateClicked"
        },

        initialize: function () {
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
                        }
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
                        }
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
            console.log(selectedKat);
            console.log(selectedStatus);
            console.log(fromDate);
            console.log(toDate);
        }
    });

    return MMLFilterView;
});
