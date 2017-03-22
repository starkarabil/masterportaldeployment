define([
    "text!modules/mmlFilter/templateMobile.html",
    "modules/mmlFilter/model",
    "bootstrap/collapse",
    "bootstrap/modal"

], function () {

    var Template = require("text!modules/mmlFilter/templateMobile.html"),
        Model = require("modules/mmlFilter/model"),
        Radio = require("backbone.radio"),

        MobileMMLFilterView;

    MobileMMLFilterView = Backbone.View.extend({
        model: new Model(),
        className: "unselectable mmlFilter",
        template: _.template(Template),
        events: {
            "click #div-mmlFilter-reset-mobile": "resetKategorien",
            "click #div-mmlFilter-execute-mobile": "executeFilter",
            "click .input-mmlFilter-filter-time": "toggleTimeMode",
            "click .div-mmlFilter-panel-heading-mobile": "singleShowTargetFilter"
        },

        initialize: function () {
            var channel = Radio.channel("MMLFilter");

            channel.on({
                "toggleFilter": this.toggleFilterWindow
            }, this);

            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            $(".ol-overlaycontainer-stopevent").append(this.$el.html(this.template(attr)));
        },

        singleShowTargetFilter: function (evt) {
            var currentTarget = $(evt.currentTarget),
                currentTargetId = currentTarget.parent().children()[1].id,
                parentTarget = $("#div-mmlFilter-modal-dialog");

            parentTarget.find(".in").each(function (index, target) {
                if (target.id !== currentTargetId) {
                    $(target).prev().find(".glyphicon-triangle-top").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
                    $(target).removeClass("in");
                }
            });

            $("#" + currentTargetId).addClass("in");
            $("#" + currentTargetId).prev().find(".glyphicon-triangle-bottom").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
        },

        // schaltet Filterwindow sichtbar/unsichtbar
        toggleFilterWindow: function () {
            $("#div-mmlFilter-content-mobile").modal("toggle");
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
            $(".div-mmlFilter-filter-kategorien").children(":checkbox").each(function (index, kategorie) {
                $(kategorie).prop("checked", false);
            });
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

                if (fromDate.getTime() <= toDate.getTime()) {
                    $("#fromDate").css({border: ""});
                    $("#toDate").css({border: ""});
                    $("#toDate").next().remove();
                    this.model.setSelectedKat(selectedKat);
                    this.model.setSelectedStatus(selectedStatus);
                    this.model.setFromDate(fromDate);
                    this.model.setToDate(toDate);
                    this.model.executeFilter(false);
                }
                else {
                    $("#toDate").next().remove();
                    $("#fromDate").css({border: "1px solid #a94442"});
                    $("#toDate").css({border: "1px solid #a94442"});
                    $("#toDate").after("<p style='color: #a94442;'>Zeitraum kann nicht aufgelöst werden.</p>");
                }
            }
            else {
                this.model.setSelectedKat(selectedKat);
                this.model.setSelectedStatus(selectedStatus);
                this.model.executeFilter(true);
            }
        }
    });

    return MobileMMLFilterView;
});
