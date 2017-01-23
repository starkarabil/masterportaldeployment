
/*
modulesLoading: Zählt wie viele Module required wurden, deren callback noch nicht ausgeführt wurde. D.h. wie viele Module noch dabei sind geladen zu werden.
                Wird hochgezählt, wenn require ein script-tag für ein Module erzeugt. wird herunter gezählt, wenn eine require-callback returned ist.
lastModuleRequired: Wird ganz am Ende der app.js auf true gesetzt, wenn alle Requireaufrufe für unsere Module abgeschickt wurden.
            Erst wenn wirklich alle require Aufrufe abgeschickt wurden und ModuleCount gleich 0 ist können wir sicher sein, das alle Module geladen wurden.
*/

var modulesLoading = 0,
    lastModuleRequired = false,
    Radio;

require.config({
    waitSeconds: 60,
    paths: {
        openlayers: "../components/openlayers/ol-debug",
        jquery: "../components/jquery/dist/jquery.min",
        jqueryui: "../components/jquery-ui/ui",
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
        config: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config",
        app: "app",
        templates: "../templates",
        modules: "../modules"
    },
    shim: {
        app: {
            deps: ["jquery", "backbone", "backbone.radio"]
        },
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
    urlArgs: "bust=" + new Date().getTime(),
    /*
    Zählt immer wenn von require ein script tag erzeugt wird modulesLoading hoch.
    */
    onNodeCreated: function (node, config, moduleName, url) {
       if (moduleName.startsWith("modules")) {
            modulesLoading++;
        }
    }
});

/*
Überschreibt die Methode von Require, die die von uns definierten Callbacks aufruft,
so dass wenn die Callback returned der moduleCount decreased wird.
Wenn all Module required wurden, wird ein Event getriggert.
*/
require.s.contexts._.execCb = function (name, callback, args, exports) {

    var result = callback.apply(exports, args);

    if (name.startsWith("modules") || result === "lastModuleRequired") {
       modulesLoading--;

        if (lastModuleRequired && modulesLoading === 0) {
            window.postMessage("Portal ready", "*");
        }
    }
    return result;

};

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

define(["app"], function () {
});
