define(function (require) {
    require("bootstrap/dropdown");
    require("bootstrap/transition");
    require("bootstrap/collapse");

    var MenuTemplate = require("text!modules/menu/template.html"),
        MenuLoader;

    MenuLoader = function () {
        var channel = Radio.channel("MenuLoader"),
            ListViewLight = require("modules/menu/desktop/listViewLight"),
            ListView = require("modules/menu/desktop/listView"),
            ListViewMobile = require("modules/menu/mobile/listView");

        // Bootstrap Navigation wird an den Viewport der Map gehängt
        this.treeType = Radio.request("Parser", "getTreeType");
        this.mapViewPort = Radio.request("Map", "getViewPort");
        this.getMenuView = function () {
            var isMobile = Radio.request("Util", "isViewMobile"),
                currentMenu;

            // Bootstrap Navigation wird an den Wrapper gehängt
            $(".ol-overlaycontainer-stopevent").append(_.template(MenuTemplate));
            if (isMobile) {
                currentMenu = new ListViewMobile();
            }
            else {
                if (this.treeType === "light") {
                    currentMenu = new ListViewLight();
                }
                else {
                    currentMenu = new ListView();
                }
            }
            channel.trigger("ready");
            return currentMenu;
        };
        this.currentMenu = this.getMenuView();
        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentMenu.removeView();

                this.currentMenu = this.getMenuView();
            }
        }, this);

    };

    return MenuLoader;
});
