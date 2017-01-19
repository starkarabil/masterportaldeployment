define([
        "text!modules/menu/desktop/folder/templateMenu.html"
], function () {

    var         Template = require("text!modules/menu/desktop/folder/templateMenu.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "dropdown dropdown-folder",
        template: _.template(Template),
        // events: {
        //     "click .folder-item": ""
        // },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));

        }
        // toggleIsChecked: function () {
        //     this.model.toggleIsChecked();
        // }
    });

    return FolderView;
});
