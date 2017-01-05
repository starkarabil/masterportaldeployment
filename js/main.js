var scriptTags = document.getElementsByTagName("script"),
    scriptTagsArray = Array.prototype.slice.call(scriptTags),
    configPath;

scriptTagsArray.forEach(function (scriptTag) {
    if (scriptTag.getAttribute("data-lgv-config") !== null) {
        configPath = scriptTag.getAttribute("data-lgv-config");
    }
}, this);

requirejs.config({
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

define(["app"], function () {
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
