define(function (require) {

var HeaderMobile,
    Radio = require("backbone.radio");

HeaderMobile = Backbone.Model.extend({
    defaults: {
        filterImage: "",
        arrowImage: "",
        title: "Melde Michel",
        arrowTargetUrl: ""
    },
    initialize: function () {
        this.setFilterImage(Radio.request("Util", "getImgPath") + "filter_white.svg");
        this.setArrowImage(Radio.request("Util", "getImgPath") + "arrow_back_white.svg");
    },
    // getter for filterImage
    getfilterImage: function () {
        return filterImage;
    },
    // setter for filterImage
    setFilterImage: function (value) {
        this.set("filterImage", value);
    },

    // getter for arrowImage
    getArrowImage: function () {
        return arrowImage;
    },
    // setter for arrowImage
    setArrowImage: function (value) {
        this.set("arrowImage", value);
    },

    // getter for title
    getTitle: function () {
        return title;
    },
    // setter for title
    setTitle: function (value) {
        this.set("title", value);
    }
 });
 return HeaderMobile;
});
