define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        Moment = require("moment"),
        mmlThemeModel;

    mmlThemeModel = Theme.extend({
        defaults: _.extend({}, Theme.prototype.defaults, {
            startTime: ""
        }),

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.setDefaults
            });
        },

        setDefaults: function () {
            var startTime = Moment(this.getGfiContent()[0].Start, "YYYYMMDDHHmmSS").format("DD.MM.YYYY");

            this.setStartTime(startTime);
        },

        // getter for starttime
        getStartTime: function () {
            return this.get("startTime");
        },
        // setter for starttime
        setStartTime: function (value) {
            this.set("startTime", value);
        }
    });
    return mmlThemeModel;
});
