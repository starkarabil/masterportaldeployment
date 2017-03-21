define([
    "backbone.radio",
    "eventbus",
    "config"
], function (Radio, EventBus, Config) {
    "use strict";
    var SearchbarModel = Backbone.Model.extend({
        defaults: {
            placeholder: "Suche",
            recommandedListLength: 5,
            quickHelp: false,
            searchString: "", // der aktuelle String in der Suchmaske
            hitList: [],
            minChars: "",
            singleStreetName: "",
            pasted: false
            // isHitListReady: true
        },
        /**
        *
        */
        initialize: function () {
            var channel = Radio.channel("Searchbar");

            channel.on({
                "pushHits": this.pushHits,
                "setHitList": this.setHitList,
                "createRecommendedList": this.createRecommendedList,
                "setSingelStreeName": this.setSingleStreetName
            }, this);

            if (Config.quickHelp) {
                this.set("quickHelp", Config.quickHelp);
            }
            EventBus.on("createRecommendedList", this.createRecommendedList, this);
            EventBus.on("searchbar:pushHits", this.pushHits, this);

            if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
                this.setInitSearchString(Radio.request("ParametricURL", "getInitString"));
            }
        },

        setInitSearchString: function (value) {
            this.set("initSearchString", value);
        },

        getInitSearchString: function () {
            return this.get("initSearchString");
        },

        /**
        * aus View gaufgerufen
        */
        setSearchString: function (value, eventType) {
            var splitAdress = value.split(" ");

            // für Copy/Paste bei Adressen
            if (splitAdress.length > 1 && splitAdress[splitAdress.length - 1].match(/\d/) && eventType === "paste") {
                var houseNumber = splitAdress[splitAdress.length - 1],
                    streetName = value.substr(0, value.length - houseNumber.length - 1);

                this.set("searchString", streetName);
                EventBus.trigger("setPastedHouseNumber", houseNumber);
            }
            else {
                this.set("searchString", value);
            }
            this.set("hitList", []);
            EventBus.trigger("searchbar:search", this.get("searchString"));
            $(".dropdown-menu-search").show();
        },
        /**
         * Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * {String} attribute - Das Attribut das gesetzt werden soll
         * {whatever} value - Der Wert des Attributs
         */
        pushHits: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        },
        /**
        *
        */
        createRecommendedList: function () {
            var max = this.get("recommandedListLength"),
                recommendedList = [],
                foundTypes = [],
                hitListNew = [],
                sortedHitList,
                singleTypes,
                splitNameArray;

            _.each(this.getHitList(), function (hit) {
                splitNameArray = hit.name.split(/(\d+)/).filter(Boolean);

                if (splitNameArray[2] === undefined) {
                    splitNameArray.push("");
                    if (splitNameArray[3] === undefined) {
                        splitNameArray.push(0);
                    }
                }
                hit.firstString = splitNameArray[0];
                hit.firstInt = parseInt(splitNameArray[1]);
                hit.secondString = splitNameArray[2];
                hit.secondInt = parseInt(splitNameArray[3]);
                hitListNew.push(hit);
            });
            sortedHitList = _.chain(hitListNew).sortBy("secondString").sortBy("secondInt").sortBy("firstInt").sortBy("firstString").value();
            if (this.getSingleStreetName() !== "") {
                sortedHitList.unshift(this.getSingleStreetName());
            }
            this.set("hitList", sortedHitList);
            if (sortedHitList.length > max) {
                singleTypes = _.reject(sortedHitList, function (hit) {
                    if (_.contains(foundTypes, hit.type) === true || foundTypes.length === max) {
                        return true;
                    }
                    else {
                        foundTypes.push(hit.type);
                    }
                });
                for (var i = 0; i < max; i++) {
                        singleTypes.push(sortedHitList[i]);
                        singleTypes = _.uniq(singleTypes);
                }
                recommendedList = singleTypes;
            }
            else {
                recommendedList = sortedHitList;
            }
            this.set("recommendedList", recommendedList);
        },

        /**
        * Setzt die HitList
        */
        setHitList: function (value) {
            this.set("hitList", value);
        },

        /**
        * Holt die Hitlist
        */
        getHitList: function () {
            return this.get("hitList");
        },

        /**
        * Setzt die HitList
        */
        setSingleStreetName: function (value) {
            this.set("singleStreetName", value);
        },

        /**
        * Holt die Hitlist
        */
        getSingleStreetName: function () {
            return this.get("singleStreetName");
        }

    });

    return new SearchbarModel();
});
