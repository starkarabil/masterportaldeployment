define([
    "jquery",
    "backbone",
    "backbone.radio",
    "eventbus",
    "modules/alerting/model",
    "bootstrap/alert"
], function ($, Backbone, Radio, EventBus, Model) {
    /*
     * Dieses Modul reagiert auf Events vom EventBus, nimmt als Parameter des Events ein hmtl-String oder ein Konfigurationsobjekt entgegen und stellt dies dar.
     * Das Konfigurationsobjekt kann folgende Einstellungen überschrieben:
     * text: das html
     * kategorie: {alert-success|alert-info|alert-warning|alert-danger}
     * dismissable: {true|false}
     */
    var AlertingView = Backbone.View.extend({
        model: Model,
        initialize: function () {
            $("#lgv-container").append("<div id='messages' class='messages'></div>");
            this.setMaxHeight();
            EventBus.on("alert", this.checkVal, this);
            EventBus.on("alert:remove", this.remove, this);
            var channel = Radio.channel("Alert");

            channel.on({
                "alert": this.checkVal,
                "alert:remove": this.remove
            }, this);
        },
        /**
        * @memberof config
        * @type {String|Object}
        * @desc entweder ein String und die Defaultwerte werden verwendet oder ein Konfigurationsobjekt
        */
        checkVal: function (val) {
            var html = "",
                kategorie = "",
                dismissable = "";

            if (_.isString(val)) {
                html = val,
                kategorie = this.model.get("kategorie"),
                dismissable = this.model.get("dismissable");
            }
            else if (_.isObject(val)) {
                html = val.text,
                kategorie = (val.kategorie) ? val.kategorie : this.model.get("kategorie"),
                dismissable = (val.dismissable) ? val.dismissable : this.model.get("dismissable");
            }
            this.render(html, kategorie, dismissable);
        },
        render: function (message, kategorie, dismissable) {
            var dismissablestring = (dismissable === true) ? " alert-dismissable" : "",
                html = "<div id='alertmessage' class='alert " + kategorie + dismissablestring + "' role='alert'>";
                // messagediv = "<div id='messages' class='messages'></div>";

            if (dismissable === true) {
                html += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times</span></button>";
            }
            html += message;
            html += "</div>";

            $("#messages").prepend(html);

        },

        setMaxHeight: function () {
            var height = $("#lgv-container").height() - 130;

            $("#messages").css("max-height", height);
        },

        remove: function () {
            $("#alertmessage").remove();
        }
    });

    return new AlertingView();
});
