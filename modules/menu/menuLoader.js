define(function (require) {

    var MenuLoader = function () {
        var channel = Radio.channel("MenuLoader"),
            ListViewLight = require("modules/menu/desktop/listViewLight"),
            ListView = require("modules/menu/desktop/listView"),
            ListViewMobile = require("modules/menu/mobile/listView");

        this.treeType = Radio.request("Parser", "getTreeType");
        this.getMenuView = function () {
            var isMobile = Radio.request("Util", "isViewMobile"),
                currentMenu;

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
