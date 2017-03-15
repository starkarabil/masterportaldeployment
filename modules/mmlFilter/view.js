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
            // http://holdirbootstrap.de/javascript/#collapse-events
            "show.bs.collapse .panel-collapse": function (evt) {
                $(evt.target).parent().find(".glyphicon").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
            },
            // Dieses Ereignis wird sofort ausgelöst, wenn die Methode hide aufgerufen wird.
            // http://holdirbootstrap.de/javascript/#collapse-events
            "hide.bs.collapse .panel-collapse": function (evt) {
                $(evt.target).parent().find(".glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
            }
        },

        initialize: function () {
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
        },

        togglePanel: function (evt) {
            // eventuell anderes geöffnetes Panel wird geschlossen
            this.$el.find(".in").collapse("hide");
            // aktuelles Panel wird geschlossen oder geöffnet
            $(evt.currentTarget).next().collapse("toggle");
        },

        toggleMMLFilter: function () {
            var startWidth = $("#div-mmlFilter-content").css("width"),
                endWidth = startWidth === "0px" ? ($("#map").width() / 3) + "px" : "0px";

            $("#div-mmlFilter-content").css("left", $("#map").css("width"));

            $("#div-mmlFilter-content").animate({
                width: endWidth
            }, {
                duration: "slow",
                progress: function () {
                    var newLeftToggle = String($("#map").width() - 45 - $("#div-mmlFilter-content").width()) + "px",
                        newLeftContent = String($("#map").width() - $("#div-mmlFilter-content").width()) + "px";

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
                        dateFormat: "dd-mm-yy",
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
                        dateFormat: "dd-mm-yy",
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
        }
    });

    return MMLFilterView;
});
