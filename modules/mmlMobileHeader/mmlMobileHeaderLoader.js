define(function (require) {
    require("modules/core/util");

    var MmlMobileHeaderLoader;

    MmlMobileHeaderLoader = function () {
        var View = require("modules/mmlMobileHeader/view");

        this.getCurrentMobileHeader = function () {
            var isMobile = Radio.request("Util", "isViewMobile"),
                currentMobileHeader = null;

            if (isMobile) {
                currentMobileHeader = new View();
            }

            return currentMobileHeader;
        };
        this.currentMobileHeader = this.getCurrentMobileHeader();

        Radio.on("Util", {
            "isViewMobileChanged": function () {
                var currentHeader = this.currentMobileHeader;

                if (currentHeader) {
                    currentHeader.remove();
                }

                this.currentMobileHeader = this.getCurrentMobileHeader();
            }
        }, this);
    };

    return MmlMobileHeaderLoader;
});
