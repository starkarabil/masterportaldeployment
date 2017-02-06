var scriptTags = document.getElementsByTagName("script"),
    scriptTagsArray = Array.prototype.slice.call(scriptTags),
    configPath = window.location.href,
    modulesLoading = 0,
    lastModuleRequired = false,
    Radio;

scriptTagsArray.forEach(function (scriptTag) {
    if (scriptTag.getAttribute("data-lgv-config") !== null) {
        configPath = scriptTag.getAttribute("data-lgv-config");
    }
}, this);

/*
modulesLoading: Zählt wie viele Module required wurden, deren callback noch nicht ausgeführt wurde. D.h. wie viele Module noch dabei sind geladen zu werden.
                Wird hochgezählt, wenn require ein script-tag für ein Module erzeugt. wird herunter gezählt, wenn eine require-callback returned ist.
lastModuleRequired: Wird ganz am Ende der app.js auf true gesetzt, wenn alle Requireaufrufe für unsere Module abgeschickt wurden.
            Erst wenn wirklich alle require Aufrufe abgeschickt wurden und ModuleCount gleich 0 ist können wir sicher sein, das alle Module geladen wurden.
*/

requirejs.config({
    waitSeconds: 60,
    paths: {
        openlayers: "../components/openlayers/ol-debug",
        jquery: "../components/jquery/dist/jquery.min",
        jqueryui: "../components/jquery-ui/ui",
        eqcss: "../components/eqcss/EQCSS.min",
        underscore: "../components/underscore/underscore-min",
       "underscore.string": "../components/underscore.string/dist/underscore.string.min",
        backbone: "../components/backbone/backbone",
        "backbone.radio": "../components/backbone.radio/build/backbone.radio.min",
        text: "../components/requirejs-text/text",
        bootstrap: "../components/bootstrap/js",
        colorpicker: "../components/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min",
        proj4: "../components/proj4/dist/proj4",
        videojs: "../components/video.js/dist/video-js/video",
        moment: "../components/moment/min/moment.min",
        eventbus: "EventBus",
        geoapi: "GeoAPI",
        config: configPath + "config",
        app: "app",
        templates: "../templates",
        modules: "../modules"
    },
    shim: {
        bootstrap: {
            deps: ["jquery"]
        },
        "bootstrap/popover": {
            deps: ["bootstrap/tooltip"]
        },
        openlayers: {
            exports: "ol"
        }
    },
    urlArgs: "bust=" + (new Date()).getTime(),
    config: {
        // benötigt, um in der Entwicklungsumgebung, Templates cross-domain laden zu können, s. https://github.com/requirejs/text#xhr-restrictions
        text: {
            useXhr: function (url, protocol, hostname, port) {
                return true;
            }
        }
    }
});

// Überschreibt das Errorhandling von Require so,
// dass der ursprüngliche Fehler sammt Stacjtrace ausgegeben wird.
// funktioniert obwohl der Linter meckert
requirejs.onError = function (err) {
    if (err.requireType === "timeout") {
        alert("error: " + err);
    }
    else {
        throw err;
    }
};

// zuerst libs laden, die alle Module brauchen. die sind dann im globalen Namespace verfügbar, empfehlung s. https://gist.github.com/jjt/3306911
require(["jquery", "backbone", "backbone.radio"], function () {
    // dann unsere app laden, die von diesen globalen libs abhängen
    Radio = Backbone.Radio;
    require(["app"]);
});
