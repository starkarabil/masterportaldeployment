import VideoStreamingTemplate from "text-loader!./template.html";
import VideoStreamingModel from "./model";

const VideoStreamingView = Backbone.View.extend({
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

export default VideoStreamingView;
