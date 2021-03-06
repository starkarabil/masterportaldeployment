import ClickCounterModel from "./model";
const ClickCounterView = Backbone.View.extend(
    /** @lends ClickCounterView.prototype */
    {
        /**
        * @class ClickCounterView
        * @extends Backbone.View
        * @memberof ClickCounter
        * @constructs
        * @param {String} desktopURL [description]
        * @param {String} mobileURL  [description]
        * @listens ClickCounter#RadioTriggerClickCounterToolChanged
        * @listens ClickCounter#RadioTriggerClickCounterCalcRoute
        * @listens ClickCounter#RadioTriggerClickCounterZoomChanged
        * @listens ClickCounter#RadioTriggerClickCounterLayerVisibleChanged
        * @listens ClickCounter#RadioTriggerClickCounterGfi
        */
        initialize: function (desktopURL, mobileURL) {
            var channel = Radio.channel("ClickCounter");

            this.model = new ClickCounterModel(desktopURL, mobileURL);

            channel.on({
                "toolChanged": this.registerClick,
                "calcRoute": this.registerClick,
                "zoomChanged": this.registerClick,
                "layerVisibleChanged": this.registerClick,
                "gfi": this.registerClick
            }, this);

            this.registerClick();
        },
        registerLayerEvent: function (layertree) {
            // fired beim LayerChange, Info-Button, Einstellungen auf dem Layertree
            if (layertree.length > 0) {
                layertree.click(function () {
                    this.registerClick();
                }.bind(this));
            }
        },

        /**
         * Refreshes iframe url
         * @return {void}
         */
        registerClick: function () {
            this.model.refreshIframe();
        }
    });

export default ClickCounterView;
