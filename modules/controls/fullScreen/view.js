define(function (require) {

    var $ = require("jquery"),
        Config = require("config"),
        Radio = require("backbone.radio"),
        FullScreenView;

    FullScreenView = Backbone.View.extend({
        className: "row",
        template: _.template("<div class='full-screen-button col-md-1 hidden-xs' title='Vollbild aktivieren'><span class='glyphicon glyphicon-resize-full'></span></div>"),
        events: {
            "click .full-screen-button": function () {
                this.toggleFullScreen();
                Radio.trigger("SimpleLister", "fullScreen");
            }
        },
        prevDimensions: {
            height: "",
            width: ""
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var config = Radio.request("Parser", "getPortalConfig");

            this.$el.html(this.template);
            if (_.isUndefined(config.controls) === false && _.isUndefined(config.controls.style) === false) {
                $("#fullScreen").addClass(config.controls.style + "FullScreen");
                $(".glyphicon.glyphicon-resize-full").addClass(config.controls.style);
            }
        },
        makeContainerModal: function (container) {
            var glyphicon = this.$el.find(".glyphicon");

            glyphicon.removeClass("glyphicon-resize-full");
            glyphicon.addClass("glyphicon-resize-small");

            this.prevDimensions.height = container.prop("style").height;
            this.prevDimensions.width = container.prop("style").width;

            container.addClass("is-modal");
            container.css("height", "99vh");
            container.css("width", "100%");
            $("body").css("overflow-y", "hidden");
            Radio.trigger("Map", "updateSize");
            $("#topbar-sticky-wrapper").hide();
        },
        reEmbedContainer: function (container) {
            var glyphicon = this.$el.find(".glyphicon");

            glyphicon.addClass("glyphicon-resize-full");
            glyphicon.removeClass("glyphicon-resize-small");

            container.removeClass("is-modal");
            container.css("height", this.prevDimensions.height);
            container.css("width", this.prevDimensions.width);
            $("body").css("overflow-y", "");
            Radio.trigger("Map", "updateSize");
            $("#topbar-sticky-wrapper").show();
        },
        toggleMmlContainerIsModal: function () {
            var container = $(".lgv-container");

            if (container.size() === 1) {
                if (container.hasClass("is-modal")) {
                    this.reEmbedContainer(container);
                }
                else {
                    this.makeContainerModal(container);
                }
            }
        },
        toggleFullScreen: function () {
            if (!_.isUndefined(Config.mmlFullscreen) && Config.mmlFullscreen) {
                this.toggleMmlContainerIsModal();
            }
            else {
                // true wenn "window" keine iframe ist --> FullScree-Modus (F11)
                if (window.self === window.top) {
                    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                        if (document.documentElement.requestFullscreen) {
                          document.documentElement.requestFullscreen();
                        }
                        else if (document.documentElement.msRequestFullscreen) {
                          document.documentElement.msRequestFullscreen();
                        }
                        else if (document.documentElement.mozRequestFullScreen) {
                          document.documentElement.mozRequestFullScreen();
                        }
                        else if (document.documentElement.webkitRequestFullscreen) {
                          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                        }
                    }
                    else {
                        if (document.exitFullscreen) {
                          document.exitFullscreen();
                        }
                        else if (document.msExitFullscreen) {
                          document.msExitFullscreen();
                        }
                        else if (document.mozCancelFullScreen) {
                          document.mozCancelFullScreen();
                        }
                        else if (document.webkitExitFullscreen) {
                          document.webkitExitFullscreen();
                        }
                    }
                }
                // wenn "window" ein iframe ist --> Weiterleitung auf geoportale-hamburg.de
                else {
                    window.open(window.location.href, "_blank");
                }
            }
            this.toggleStyle();
        },
        toggleStyle: function () {
            if ($(".full-screen-button").attr("title") === "Vollbild aktivieren") {
                $(".full-screen-button").attr("title", "Vollbild deaktivieren");
            }
            else {
                $(".full-screen-button").attr("title", "Vollbild aktivieren");
            }
        }
    });

    return FullScreenView;
});
