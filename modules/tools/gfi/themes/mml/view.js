define(function (require) {

    var Template = require("text!modules/tools/gfi/themes/mml/template.html"),
        Model = require("modules/tools/gfi/themes/model"),
        ThemeView = require("modules/tools/gfi/themes/view"),
        MmlTheme;

     MmlTheme = ThemeView.extend({
        model: new Model(),
        template: _.template(Template),
        // getter for model
        getModel: function () {
            return model;
        },
        // setter for model
        setModel: function (value) {
            this.model = value;
        }
    });
    return MmlTheme;
});
