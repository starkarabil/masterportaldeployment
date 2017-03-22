define(function (require) {

    var FullScreenView,
        Config = require("config"),
        Radio = require("backbone.radio");

    FullScreenView = Backbone.View.extend({
        className: "row",
        template: _.template("<div class='full-screen-button col-md-1 hidden-xs' title='Vollbild aktivieren'><span class='glyphicon glyphicon-fullscreen'></span></div>"),
        events: {
            "click .full-screen-button": "toggleFullScreen"
        },
        prevDimensions: {
            height: "",
            width: ""
        },
        initialize: function () {
            $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", this.toggleStyle);
            this.render();
        },
        render: function () {
            this.$el.html(this.template);
        },
        makeContainerModal: function (container) {
            this.prevDimensions.height = container.prop("style").height;
            this.prevDimensions.width = container.prop("style").width;
            container.addClass("is-modal");
            container.css("height", "99vh");
            container.css("width", "100%");
            Radio.trigger("Map", "updateSize");
        },
        reEmbedContainer: function (container) {
            container.removeClass("is-modal");
            container.css("height", this.prevDimensions.height);
            container.css("width", this.prevDimensions.width);
            Radio.trigger("Map", "updateSize");
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
            if (!_.isUndefined(Config.isMml) && Config.isMml) {
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
        },
        toggleStyle: function () {
            $(".full-screen-button > span").toggleClass("glyphicon-fullscreen glyphicon-remove");
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
