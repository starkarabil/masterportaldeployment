define(function (require) {
    require("modules/core/util");
    require("modules/core/util");
    require("modules/core/util");

    var MMLFilterLoader;

    MMLFilterLoader = function () {
        var ViewMobile = require("modules/mmlFilter/viewMobile"),
            View = require("modules/mmlFilter/view");

        this.getMMLFilterView = function () {
            var isMobile = Radio.request("Util", "isViewMobile"),
                currentFilterView;

            if (isMobile) {
                currentFilterView = new ViewMobile();
            }
            else {
                currentFilterView = new View();
            }

            return currentFilterView;
        };
        this.currentFilterView = this.getMMLFilterView();

        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentFilterView.destroyFilter();

                this.currentFilterView = this.getMMLFilterView();
            }
        }, this);
    };

    return MMLFilterLoader;
});
