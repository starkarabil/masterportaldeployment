define(function (require) {

    var Backbone = require("backbone"),
        VideoStreamingTemplate = require("text!modules/tools/gfi/objects/videostreaming/template.html"),
        VideoStreamingModel = require("modules/tools/gfi/objects/videostreaming/model"),
        VideoStreamingView;

    VideoStreamingView = Backbone.View.extend({
        initialize: function (url) {
            this.model = new VideoStreamingModel(url);
            this.listenTo(this.model, {
                "removeView": this.remove
            });
            this.render();
        },
        template: _.template(VideoStreamingTemplate),
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        }
    });

    return VideoStreamingView;
});
