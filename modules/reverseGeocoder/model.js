define([
    "backbone",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ReverseGeocoder;

    "use strict";

    ReverseGeocoder = Backbone.Model.extend({
        defaults: {
            url: "",
            ajax: null
        },
        initialize: function () {
            // Setter URL
            this.setWpsUrl();

            // Radio channel
            var channel = Radio.channel("ReverseGeocoder");

            channel.on({
                "request": this.sendRequest
            }, this);
        },
        setWpsUrl: function () {
            var portalConfig = Radio.request("Parser", "getPortalConfig"),
                config = portalConfig.reverseGeocoder ? portalConfig.reverseGeocoder : null,
                wpsId = config.wpsId ? config.wpsId : null,
                servicedefinition = wpsId ? Radio.request("RestReader", "getServiceById", wpsId)[0] : null,
                proxiedUrl = servicedefinition ? Radio.request("Util", "getProxyURL", servicedefinition.get("url")) : "";

            this.set("url", proxiedUrl);
            if (!proxiedUrl) {
                Radio.trigger("Alert", "alert", {text: "Fehler beim Initialisieren des ReverseGeocoders", kategorie: "alert-danger"});
            }
        },
        sendRequest: function (coordinate) {
            var ajax = this.get("ajax");

            if (ajax) {
                ajax.abort();
                this.set("ajax", null);
            }
            this.ajaxSend(coordinate);
        },
        ajaxSend: function (coordinate) {
            var dataInput = "<wps:DataInputs><wps:Input><ows:Identifier>X</ows:Identifier><wps:Data><wps:LiteralData dataType='float'>" + coordinate[0] + "</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>Y</ows:Identifier><wps:Data><wps:LiteralData dataType='float'>" + coordinate[1] + "</wps:LiteralData></wps:Data></wps:Input></wps:DataInputs>",
                request_str = "<wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:ows='http://www.opengis.net/ows/1.1' service='WPS' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd'><ows:Identifier>ReverseGeocoder.fmw</ows:Identifier>" + dataInput + "</wps:Execute>";

            this.set("ajax", $.ajax({
                url: this.get("url") + "?Request=Execute&Service=WPS&Version=1.0.0",
                data: request_str,
                method: "POST",
                contentType: "text/xml; charset=UTF-8",
                context: this,
                complete: function (jqXHR) {
                    this.ajaxComplete(jqXHR);
                },
                success: function (response) {
                    this.ajaxSuccess(response);
                }
            }));
        },
        ajaxComplete: function (jqXHR) {
            if (jqXHR.status !== (200) && jqXHR.status !== (0) || jqXHR.responseText && jqXHR.responseText.indexOf("ExceptionReport") !== -1) {
                Radio.trigger("Alert", "alert", {text: "Nächstgelegene Adresse nicht ermittelt. Bitte versuchen Sie es später wieder.", kategorie: "alert-info"});
                Radio.trigger("ReverseGeocoder", "addressComputed", null);
            }
        },
        ajaxSuccess: function (response) {
            var exeResp = $("wps\\:ExecuteResponse,ExecuteResponse", response),
                data = exeResp && $(exeResp).find("wps\\:ComplexData,ComplexData")[0] ? $(exeResp).find("wps\\:ComplexData,ComplexData")[0] : null,
                ergebnis = data && $(data).find("wps\\:Ergebnis,Ergebnis")[0] ? $(data).find("wps\\:Ergebnis,Ergebnis")[0] : null,
                strasse = ergebnis && $(ergebnis).find("wps\\:Strasse,Strasse")[0] ? $(ergebnis).find("wps\\:Strasse,Strasse")[0].textContent : "",
                hsnr = ergebnis && $(ergebnis).find("wps\\:Hausnr,Hausnr")[0] ? $(ergebnis).find("wps\\:Hausnr,Hausnr")[0].textContent : "",
                zusatz = ergebnis && $(ergebnis).find("wps\\:Zusatz,Zusatz")[0] ? $(ergebnis).find("wps\\:Zusatz,Zusatz")[0].textContent : "",
                plz = ergebnis && $(ergebnis).find("wps\\:Plz,Plz")[0] ? $(ergebnis).find("wps\\:Plz,Plz")[0].textContent + " Hamburg" : "",
                distance = ergebnis && $(ergebnis).find("wps\\:Distanz,Distanz")[0] ? $(ergebnis).find("wps\\:Distanz,Distanz")[0].textContent : "",
                x = ergebnis && $(ergebnis).find("wps\\:XKoordinate,XKoordinate")[0] ? $(ergebnis).find("wps\\:XKoordinate,XKoordinate")[0].textContent : "",
                y = ergebnis && $(ergebnis).find("wps\\:YKoordinate,YKoordinate")[0] ? $(ergebnis).find("wps\\:YKoordinate,YKoordinate")[0].textContent : "";

            Radio.trigger("ReverseGeocoder", "addressComputed", {
                distance: Number(parseFloat(distance).toFixed(3)),
                coordinate: [parseFloat(x), parseFloat(y)],
                streetname: strasse,
                housenumber: hsnr,
                housenumberaffix: zusatz,
                postcode: plz
            });
        }
    });

    return new ReverseGeocoder();
});
