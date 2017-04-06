define(function (require) {
    require("modules/core/util");

    var MMLFilterLoader;

    MMLFilterLoader = function () {
        var View = require("modules/mmlMobileHeader/view"),
            Model = require("modules/mmlMobileHeader/model");

        this.getCurrentMobileHeader = function () {
            var isMobile = Radio.request("Util", "isViewMobile"),
                currentMobileHeader = null;

            if (isMobile) {
                currentMobileHeader = new View(Model);
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

    return MMLFilterLoader;
});
