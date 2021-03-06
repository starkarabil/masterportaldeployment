const ClickCounterModel = Backbone.Model.extend(/** @lends ClickCounterModel.prototype */
    {
        defaults: {
            countframeid: _.uniqueId("countframe"),
            usedURL: "", // beutzte iFrame-URL, kann desktop oder mobile sein
            desktopURL: "", // URL die verwendet wird, wenn nicht mobile
            mobileURL: "" // URL die verwendet wird, wenn mobile
        },
        /**
        * @class ClickCounterModel
        * @extends Backbone.Model
        * @memberof ClickCounter
        * @constructs
        * @param {String} desktopURL Url to be used in iframe when app runs in desktop mode
        * @param {String} mobileURL  Url to be used in iframe when app runs in mobile mode
        * @property {String} countframeid=_.uniqueId("countframe") Id of iframe.
        * @property {String} usedURL="" Currently used url.
        * @property {String} desktopURL="" Url to be used in iframe when app runs in desktop mode.
        * @property {String} mobileURL="" Url to be used in iframe when app runs in mobile mode.
        * @listens Util#RadioTriggerUtilIsViewMobileChanged
        * @fires Util#RadioRequestIsViewMobile
        */
        initialize: function (desktopURL, mobileURL) {
            var isMobile = Radio.request("Util", "isViewMobile"),
                usedURL = isMobile === true ? mobileURL : desktopURL;

            this.set("desktopURL", desktopURL);

            this.set("mobileURL", mobileURL);

            this.set("usedURL", usedURL);

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.updateURL
            });
            // Erzeuge iFrame
            $("<iframe style='display:none' src='" + this.get("usedURL") + "' id='" + this.get("countframeid") + "' width='0' height='0' frameborder='0'/>").appendTo("body");
        },
        /**
         * Sets attribute "usedURl"
         * @param  {Boolean} isMobile Flag if app runs in mobile mode
         * @return {void}
         */
        updateURL: function (isMobile) {
            var usedURL;

            if (isMobile) {
                usedURL = this.get("mobileURL");
            }
            else {
                usedURL = this.get("desktopURL");
            }
            this.set("usedURL", usedURL);
        },
        /**
         * refreshed iframe with given id and used url
         * @return {void}
         */
        refreshIframe: function () {
            var id = this.get("countframeid"),
                url = this.get("usedURL");

            $("#" + id).attr("src", url);
        }
    });

export default ClickCounterModel;
