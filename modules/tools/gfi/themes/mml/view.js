define(function (require) {

    var Template = require("text!modules/tools/gfi/themes/mml/template.html"),
        Model = require("modules/tools/gfi/themes/model"),
        ThemeView = require("modules/tools/gfi/themes/view"),
        $ = require("jquery"),
        MmlTheme;

     MmlTheme = ThemeView.extend({
        model: new Model(),
        template: _.template(Template),
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.appendTheme
            });

            this.render();
            if (Radio.request("Util", "isViewMobile") === false) {
                this.$el.find(".top-picture")[0].addEventListener("load", function () {
                    $(this).width(this.naturalWidth);
                });
            }
        },
        // getter for model
        getModel: function () {
            return this.model;
        },
        // setter for model
        setModel: function (value) {
            this.model = value;
        }
    });
    return MmlTheme;
});
