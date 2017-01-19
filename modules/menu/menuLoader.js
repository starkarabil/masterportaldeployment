define(function (require) {
    var Radio = require("backbone.radio"),
        MenuTemplate = require("text!modules/menu/template.html"),
        MenuLoader;

    MenuLoader = function () {
        var channel = Radio.channel("MenuLoader");

        // Bootstrap Navigation wird an den Wrapper gehängt
        // $("#lgv-container").prepend(_.template(MenuTemplate));
        this.treeType = Radio.request("Parser", "getTreeType");
        this.loadMenu = function (caller) {
            var isMobile = Radio.request("Util", "isViewMobile");

            // Bootstrap Navigation wird an den Wrapper gehängt
            $("#lgv-container").prepend(_.template(MenuTemplate));
            if (isMobile) {
                require(["modules/menu/mobile/listView"], function (Menu) {
                    caller.currentMenu = new Menu();
                    channel.trigger("ready");
                });
            }
            else {
                if (this.treeType === "light") {
                    require(["modules/menu/desktop/listViewLight"], function (Menu) {
                        caller.currentMenu = new Menu();
                        channel.trigger("ready");
                    });
                }
                else {
                    require(["modules/menu/desktop/listView"], function (Menu) {
                        caller.currentMenu = new Menu();
                        channel.trigger("ready");
                    });
                }
            }
        };
        this.currentMenu = this.loadMenu(this);
        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentMenu.removeView();

                this.currentMenu = this.loadMenu(this);
            }
        }, this);
    };

    return MenuLoader;
});
