import "../model";

const GazetteerModel = Backbone.Model.extend(/** @lends GazetteerModel.prototype */{
    defaults: {
        namespace: "http://www.adv-online.de/namespaces/adv/dog",
        minChars: 3,
        gazetteerURL: "",
        searchStreets: false,
        searchHouseNumbers: false,
        searchDistricts: false,
        searchParcels: false,
        searchStreetKey: false,
        handleMultipleStreetResults: false,
        onlyOneStreetName: "",
        searchStringRegExp: "",
        houseNumbers: [],
        ajaxRequests: {},
        typeOfRequest: ""
    },
    /**
     * @class GazetteerModel
     * @extends Backbone.Model
     * @memberof Searchbar.Gaz
     * @constructs
     * @param {Object} config config
     * @property {String} namespace="http://www.adv-online.de/namespaces/adv/dog" - Todo
     * @property {Number} minChars=3 - Todo
     * @property {String} gazetteerURL="" - Todo
     * @property {Boolean} searchStreets=false - Todo
     * @property {Boolean} searchHouseNumbers=false - Todo
     * @property {Boolean} searchDistricts=false - Todo
     * @property {Boolean} searchParcels= false - Todo
     * @property {Boolean} searchStreetKey=false - Todo
     * @property {Boolean} handleMultipleStreetResults=false - Handles occurence of multiple streets with the same name in different counties
     * @property {String} onlyOneStreetName="" - Todo
     * @property {String} searchStringRegExp="" - Todo
     * @property {Array} houseNumbers=[] - Todo
     * @property {Object} ajaxRequests={} - Todo
     * @property {String} typeOfRequest="" - Todo
     * @listens Searchbar#RadioTriggerSearchbarSearch
     * @listens Searchbar#RadioTriggerSearchbarSetPastedHouseNumber
     * @listens Searchbar.Gaz#RadioTriggerFindStreets
     * @listens Searchbar.Gaz#RadioTriggerFindHouseNumbers
     * @listens Searchbar.Gaz#RadioTriggerAdressSearch
     * @listens Searchbar.Gaz#RadioTriggerHouseNumberViaButton
     * @listens Searchbar.Gaz#RadioTriggerStreetSearch
     * @fires Gaz#RadioTriggerStreetNames
     * @fires Gaz#RadioTriggerHouseNumbers
     * @fires Gaz#RadioTriggerGetAdress
     * @fires Gaz#RadioTriggerGetStreets
     * @listens ParametricURL#RadioRequestsParametricUrlGetInitString
     */
    initialize: function (config) {
        var gazService = Radio.request("RestReader", "getServiceById", config.serviceId);

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search,
            "setPastedHouseNumber": this.setPastedHouseNumber
        });

        this.listenTo(Radio.channel("Gaz"), {
            "findStreets": this.findStreets,
            "findHouseNumbers": this.findHouseNumbers,
            "adressSearch": this.adressSearch,
            "houseNumberViaButton": this.houseNumberViaButton
        });
        Radio.channel("Gaz").reply({
            "adressSearch": this.adressSearch,
            "streetsSearch": this.streetsSearch
        });

        if (gazService && gazService.get("url")) {
            this.set("gazetteerURL", gazService.get("url"));
        }
        if (config.searchStreets) {
            this.set("searchStreets", config.searchStreets);
        }
        if (config.searchHouseNumbers) {
            this.set("searchHouseNumbers", config.searchHouseNumbers);
        }
        if (config.searchDistricts) {
            this.set("searchDistricts", config.searchDistricts);
        }
        if (config.searchParcels) {
            this.set("searchParcels", config.searchParcels);
        }
        if (config.searchStreetKey) {
            this.set("searchStreetKey", config.searchStreetKey);
        }
        if (config.minChars) {
            this.set("minChars", config.minChars);
        }
        if (config.handleMultipleStreetResults) {
            this.setHandleMultipleStreetResults(config.handleMultipleStreetResults);
        }
        if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
            this.directSearch(Radio.request("ParametricURL", "getInitString"));
        }
    },

    /**
    * für Copy/Paste bei Adressen
    * @param {*} value - Todo
    * @returns {*} Todo
    */
    setPastedHouseNumber: function (value) {
        this.set("pastedHouseNumber", value);
    },

    /**
     * handles the search process
     * @param {String} pattern - Searchstring
     * @returns {void} Todo
     */
    search: function (pattern) {
        var gemarkung, flurstuecksnummer,
            searchString = pattern,
            splittedSearchString = [],
            lastElementIndex,            
            splittedCompleteAdress,
            splittedStreetHouseNo,
            data,
            buttons;

        this.set("searchString", searchString);
        if (searchString.length >= this.get("minChars")) {
            if (this.get("searchStreets") === true && this.get("handleMultipleStreetResults") === true) {
                searchString = searchString.replace(/ {1,}/g," ");
                splittedSearchString = searchString.trim().split(" ");
                lastElementIndex = splittedSearchString.length - 1;
                splittedCompleteAdress = searchString.trim().split(",");
                splittedStreetHouseNo = splittedCompleteAdress[0].trim().split(" ");

                // Searches for Streetname with housenumber
                // Check if searchString includes a streetname and a housenumber
                if (!_.isNaN(Number(splittedSearchString[lastElementIndex]))) {
                    data = this.searchStreetWithHouseNo(splittedSearchString, lastElementIndex);
                    this.setTypeOfRequest("handleMultipleStreetResults");
                    this.sendRequest("StoredQuery_ID=AdresseOhneZusatz&strassenname=" + encodeURIComponent(data[0]) + "&hausnummer=" + data[1], this.getStreets, this.get("typeOfRequest"));
                    setTimeout(function () {
                        buttons = document.getElementsByClassName("HouseNo-btn-Search");
                        _.each(buttons, function (button) {
                            $(button).hide();
                        });
                    }, 1500);
                }
                // Searches for Streetname with housenumber and additional address
                // Checks if searchString includes a streetname, a housenumber and additional address with space between housenumber and additional address
                else if (splittedSearchString[lastElementIndex].length === 1 && _.isString(splittedSearchString[lastElementIndex]) && !_.isNaN(Number(splittedSearchString[splittedSearchString.length - 2]))) {
                    data = this.searchStreetWithHouseNoAndAdditionalAddress(splittedSearchString, lastElementIndex);
                    this.setTypeOfRequest("handleMultipleStreetResults");
                    this.sendRequest("StoredQuery_ID=AdresseMitZusatz&strassenname=" + encodeURIComponent(data[0]) + "&hausnummer=" + data[1] + "&zusatz=" + data[2], this.getStreets, this.get("typeOfRequest"));
                    setTimeout(function () {
                        buttons = document.getElementsByClassName("HouseNo-btn-Search");
                        _.each(buttons, function (button) {
                            $(button).hide();
                        });
                    }, 1500);
                }
                // Searches for Streetname with housenumber and additional address
                // Checks if searchString includes a streetname, a housenumber and additional address without space between housenumber and additional address
                else if (!_.isNull(splittedSearchString[lastElementIndex].match(/^([1-9]{1}\d*)([A-Za-z]{1})$/))) {
                    data = this.searchStreetWithHouseNoAndAdditionalAddressRegExp(splittedSearchString, lastElementIndex)
                    this.setTypeOfRequest("handleMultipleStreetResults");
                    this.sendRequest("StoredQuery_ID=AdresseMitZusatz&strassenname=" + encodeURIComponent(data[0]) + "&hausnummer=" + data[1] + "&zusatz=" + data[2], this.getStreets, this.get("typeOfRequest"));
                    setTimeout(function () {
                        buttons = document.getElementsByClassName("HouseNo-btn-Search");
                        _.each(buttons, function (button) {
                            $(button).hide();
                        });
                    }, 1500);   
                }
                // Searches for Streetname with housenumber in a certain county
                // Checks if searchString includes a housenumber
                else if (!_.isNaN(Number(splittedStreetHouseNo[splittedStreetHouseNo.length - 1]))) {
                    data = this.searchStreetWithHouseNoInCounty(splittedCompleteAdress, splittedStreetHouseNo);
                    this.setTypeOfRequest("handleMultipleStreetResults");
                    this.sendRequest("StoredQuery_ID=AdresseVollstaendigOhneZusatz&strassenname=" + encodeURIComponent(data[0]) + "&hausnummer=" + data[1] + "&postleitzahl=" + data[2] + "&ortsnamepost=" + encodeURIComponent(data[3]), this.getStreets, this.get("typeOfRequest"));
                    setTimeout(function () {
                        buttons = document.getElementsByClassName("HouseNo-btn-Search");
                        _.each(buttons, function (button) {
                            $(button).hide();
                        });
                    }, 2000);
                }
                // Searches for Streetname with housenumber with additional address in a certain county
                // Checks if searchString includes a housenumber and additional address
                else if (splittedStreetHouseNo[splittedStreetHouseNo.length - 1].length === 1 && _.isString(splittedStreetHouseNo[splittedStreetHouseNo.length - 1]) && !_.isNaN(Number(splittedStreetHouseNo[splittedStreetHouseNo.length - 2]))) {
                    data = this.searchStreetWithHouseNoAndAdditionalAddressInCounty(splittedCompleteAdress, splittedStreetHouseNo);
                    this.setTypeOfRequest("handleMultipleStreetResults");
                    this.sendRequest("StoredQuery_ID=AdresseVollstaendigMitZusatz&strassenname=" + encodeURIComponent(data[0]) + "&hausnummer=" + data[1] + "&zusatz=" + data[2] + "&postleitzahl=" + data[3] + "&ortsnamepost=" + encodeURIComponent(data[4]), this.getStreets, this.get("typeOfRequest"));
                    setTimeout(function () {
                        buttons = document.getElementsByClassName("HouseNo-btn-Search");
                        _.each(buttons, function (button) {
                            $(button).hide();
                        });
                    }, 2000);
                }
                // Searches for Streetname with housenumber and additional addres in a certain county
                // Checks if searchString includes a housenumber and additional address without space between housenumber and additional address
                else if (!_.isNull(splittedStreetHouseNo[splittedStreetHouseNo.length - 1].match(/^([1-9]{1}\d*)([A-Za-z]{1})$/))) {
                    data = this.searchStreetWithHouseNoAndAdditionalAddressRegExpInCounty(splittedCompleteAdress, splittedStreetHouseNo)
                    this.setTypeOfRequest("handleMultipleStreetResults");
                    this.sendRequest("StoredQuery_ID=AdresseVollstaendigMitZusatz&strassenname=" + encodeURIComponent(data[0]) + "&hausnummer=" + data[1] + "&zusatz=" + data[2] + "&postleitzahl=" + data[3] + "&ortsnamepost=" + encodeURIComponent(data[4]), this.getStreets, this.get("typeOfRequest"));
                    setTimeout(function () {
                        buttons = document.getElementsByClassName("HouseNo-btn-Search");
                        _.each(buttons, function (button) {
                            $(button).hide();
                        });
                    }, 2000);
                }
                else {
                    searchString = searchString.replace(/[()]/g, "\\$&");
                    this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
                    this.setOnlyOneStreetName("");
                    this.setTypeOfRequest("searchStreets");
                    this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, this.get("typeOfRequest"));
                }
            }
            else if (this.get("searchStreets") === true) {
                searchString = searchString.replace(/[()]/g, "\\$&");
                this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
                this.setOnlyOneStreetName("");
                this.setTypeOfRequest("searchStreets");

                searchString = searchString.replace(/\s*$/, "");

                this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, this.get("typeOfRequest"));
            }
            if (this.get("searchDistricts") === true) {
                if (!_.isNull(searchString.match(/^[a-z-]+$/i))) {
                    this.setTypeOfRequest("searchDistricts");
                    this.sendRequest("StoredQuery_ID=findeStadtteil&stadtteilname=" + searchString, this.getDistricts, this.get("typeOfRequest"));
                }
            }
            if (this.get("searchParcels") === true) {
                if (!_.isNull(searchString.match(/^[0-9]{4}[\s|/][0-9]*$/))) {
                    gemarkung = searchString.split(/[\s|/]/)[0];
                    flurstuecksnummer = searchString.split(/[\s|/]/)[1];
                    this.setTypeOfRequest("searchParcels1");
                    this.sendRequest("StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel, this.get("typeOfRequest"));
                }
                else if (!_.isNull(searchString.match(/^[0-9]{5,}$/))) {
                    gemarkung = searchString.slice(0, 4);
                    flurstuecksnummer = searchString.slice(4);
                    this.setTypeOfRequest("searchParcels2");
                    this.sendRequest("StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel, this.get("typeOfRequest"));
                }
            }
            if (this.get("searchStreetKey") === true) {
                if (!_.isNull(searchString.match(/^[a-z]{1}[0-9]{1,5}$/i))) {
                    this.setTypeOfRequest("searchStreetKey");
                    this.sendRequest("StoredQuery_ID=findeStrassenSchluessel&strassenschluessel=" + searchString, this.getStreetKey, this.get("typeOfRequest"));
                }
            }
        }
    },

    /**
     * filters the streetname and the housenumber from the passed search string
     * @param {String[]} splittedSearchString - Array with all words of the search string
     * @param {Number} lastElementIndex - index of last element in splittedSearchString
     * @return {String[]} - Array with the streetname and the housenumber 
    */
    searchStreetWithHouseNo: function (splittedSearchString, lastElementIndex) {
        var streetname = "",
            housenumber;

        housenumber = Number(splittedSearchString[lastElementIndex]);
        splittedSearchString.forEach(function (string, index) {
            if (index < lastElementIndex) {
                streetname += string + " ";
            }
        });
        streetname = streetname.substring(0, streetname.length - 1);

        return [streetname, housenumber];
    },

    /**
     * filters the streetname, the housenumber and the additional address from the passed search string
     * @param {String[]} splittedSearchString - Array with all words of the search string
     * @param {Number} lastElementIndex - index of last element in splittedSearchString
     * @return {String[]} - Array with the streetname, the housenumber and the additional address
    */
    searchStreetWithHouseNoAndAdditionalAddress: function (splittedSearchString, lastElementIndex) {
        var streetname = "",
            housenumber,
            zusatz;

        housenumber = Number(splittedSearchString[splittedSearchString.length - 2]);
        zusatz = splittedSearchString[lastElementIndex];
        splittedSearchString.forEach(function (string, index) {
            if (index < splittedSearchString.length - 2) {
                streetname += string + " ";
            }
        });
        streetname = streetname.substring(0, streetname.length - 1);

        return [streetname, housenumber, zusatz];
    },

    /**
     * filters the streetname, the housenumber and the additional address from the passed search string
     * even when there is no space between housenumber and additional address
     * @param {String[]} splittedSearchString - Array with all words of the search string
     * @param {Number} lastElementIndex - index of last element in splittedSearchString
     * @return {String[]} Array with the streetname, the housenumber and the additional address
    */
    searchStreetWithHouseNoAndAdditionalAddressRegExp: function (splittedSearchString, lastElementIndex) {
        var regExpSearchString,
            streetname = "",
            housenumber,
            zusatz;

        regExpSearchString = splittedSearchString[lastElementIndex].match(/^([1-9]{1}\d*)([A-Za-z]{1})$/);
        housenumber = regExpSearchString[1];
        zusatz = regExpSearchString[2];
        splittedSearchString.forEach(function (string, index) {
            if (index < lastElementIndex) {
                streetname += string + " ";
            }
        });
        streetname = streetname.substring(0, streetname.length - 1);

        return [streetname, housenumber, zusatz];
    },

    /**
     * filters the streetname, the housenumber, the postcode and the county name from the passed search string
     * @param {String[]} splittedCompleteAdress - Array with complete address including postcode and county name
     * @param {String[]} splittedStreetHouseNo - Array with search string part with streetname, housenumber and additional address 
     * @return {String[]} Array with the streetname, the housenumber, the postcode and the county name 
    */
    searchStreetWithHouseNoInCounty: function (splittedCompleteAdress, splittedStreetHouseNo) {
        var splittedCountyPlz,
            streetname = "",
            housenumber,
            plz,
            countyName = "";

        splittedCountyPlz = splittedCompleteAdress[1].trim().split(" ");

        splittedStreetHouseNo.forEach(function (addressPart, index) {
            if (index < splittedStreetHouseNo.length - 1) {
                streetname += addressPart + " ";
            }
        });
        streetname = streetname.substring(0, streetname.length - 1);

        housenumber = splittedStreetHouseNo[splittedStreetHouseNo.length - 1];
        plz = splittedCountyPlz[splittedCountyPlz.length - 1].replace("(", "").replace(")", "");

        splittedCountyPlz.forEach(function (addressPart, index) {
            if (index < splittedCountyPlz.length - 1) {
                countyName += addressPart + " ";
            }
        });
        countyName = countyName.substring(0, countyName.length - 1);

        return [streetname, housenumber, plz, countyName];
    },

    /**
     * filters the streetname, the housenumber and the additional address, the postcode and the county name from the passed search string
     * @param {String[]} splittedCompleteAdress - Array with complete address including postcode and county name
     * @param {String[]} splittedStreetHouseNo - Array with search string part with streetname, housenumber and additional address
     * @returns {String[]} Array with the streetname, the housenumber, the additional address, the postcode and the county name
    */
    searchStreetWithHouseNoAndAdditionalAddressInCounty: function (splittedCompleteAdress, splittedStreetHouseNo) {
        var splittedCountyPlz,
            streetname = "",
            housenumber,
            zusatz,
            plz,
            countyName = "";

        splittedCountyPlz = splittedCompleteAdress[1].trim().split(" ");

        splittedStreetHouseNo.forEach(function (addressPart, index) {
            if (index < splittedStreetHouseNo.length - 2) {
                streetname += addressPart + " ";
            }
        });
        streetname = streetname.substring(0, streetname.length - 1);

        housenumber = splittedStreetHouseNo[splittedStreetHouseNo.length - 2];
        zusatz = splittedStreetHouseNo[splittedStreetHouseNo.length - 1];
        plz = splittedCountyPlz[splittedCountyPlz.length - 1].replace("(", "").replace(")", "");

        splittedCountyPlz.forEach(function (addressPart, index) {
            if (index < splittedCountyPlz.length - 1) {
                countyName += addressPart + " ";
            }
        });
        countyName = countyName.substring(0, countyName.length - 1);

        return [streetname, housenumber, zusatz, plz, countyName];
    },

    /**
     * filters the streetname, the housenumber, the additional address, the postcode and the county name from the passed search string
     * even when there is no space between housenumber and additional address
     * @param {String[]} splittedCompleteAdress - Array with complete address including postcode and county name
     * @param {String[]} splittedStreetHouseNo - Array with search string part with streetname, housenumber and additional address
     * @returns {String[]} Array with the streetname, the housenumber, the additional address, the postcode and the county name
    */
    searchStreetWithHouseNoAndAdditionalAddressRegExpInCounty: function (splittedCompleteAdress, splittedStreetHouseNo) {
        var splittedCountyPlz,
            regExpSearchString,
            streetname = "",
            housenumber,
            zusatz,
            plz,
            countyName = "";

        splittedCountyPlz = splittedCompleteAdress[1].trim().split(" ");
        regExpSearchString = splittedStreetHouseNo[splittedStreetHouseNo.length - 1].match(/^([1-9]{1}\d*)([A-Za-z]{1})$/);

        housenumber = regExpSearchString[1];
        zusatz = regExpSearchString[2];

        splittedStreetHouseNo.forEach(function (addressPart, index) {
            if (index < splittedStreetHouseNo.length - 1) {
                streetname += addressPart + " ";
            }
        });
        streetname = streetname.substring(0, streetname.length - 1);
        plz = splittedCountyPlz[splittedCountyPlz.length - 1].replace("(", "").replace(")", "");

        splittedCountyPlz.forEach(function (addressPart, index) {
            if (index < splittedCountyPlz.length - 1) {
                countyName += addressPart + " ";
            }
        });
        countyName = countyName.substring(0, countyName.length - 1);

        return [streetname, housenumber, zusatz, plz, countyName];
    },

    /**
     * Todo
     * @param {*} searchString - Todo
     * @returns {*} Todo
     */
    findStreets: function (searchString) {
        this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.parseStreets, true);
    },

    /**
     * Todo
     * @param {*} data - Todo
     * @event Gaz#RadioTriggerStreetNames
     * @return {*} Todo
     */
    parseStreets: function (data) {
        var hits = $("wfs\\:member,member", data),
            streetNames = [];

        _.each(hits, function (hit) {
            streetNames.push($(hit).find("dog\\:strassenname, strassenname")[0].textContent);
        }, this);

        Radio.trigger("Gaz", "streetNames", streetNames.sort());
        return streetNames.sort();
    },

    /**
     * Triggers the search process of housenumbers after the housenumber button was clicked
     * @param {String} street - Name of the Street for which the housenumbers must be searched
     * @returns {void} Todo
     */
    houseNumberViaButton: function (street) {
        this.setOnlyOneStreetName(street);
        this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(street), this.handleHouseNumbers, this.get("typeOfRequest")); 
    },

    /**
     * Todo
     * @param {*} street - Todo
     * @returns {*} Todo
     */
    findHouseNumbers: function (street) {
        this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(street), this.parseHousenumbers, true);
    },

    /**
     * Todo
     * @param {*} data - Todo
     * @event Gaz#RadioTriggerHouseNumbers
     * @returns {void} Todo
     */
    parseHousenumbers: function (data) {
        var hits = $("wfs\\:member,member", data),
            sortedHouseNumbers,
            houseNumbers = [];

        _.each(hits, function (hit) {
            houseNumbers.push({
                position: $(hit).find("gml\\:pos,pos")[0].textContent,
                number: $(hit).find("dog\\:hausnummer,hausnummer")[0].textContent,
                affix: $(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0] ? $(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0].textContent : ""
            });
        });
        sortedHouseNumbers = Radio.request("Util", "sort", houseNumbers, "number", "affix");

        Radio.trigger("Gaz", "houseNumbers", sortedHouseNumbers);
        return sortedHouseNumbers;
    },

    /**
    * @description Adresssuche mit Straße und Hausnummer und Zusatz. Wird nicht über die Searchbar getriggert.
    * @param {Object} adress - Adressobjekt zur Suche
    * @param {string} adress.streetname - Straßenname
    * @param {integer} adress.housenumber - Hausnummer
    * @param {string} [adress.affix] - Zusatz zur Hausnummer
    * @returns {void}
    */
    adressSearch: function (adress) {
        if (adress.affix && adress.affix !== "") {
            this.setTypeOfRequest("adress1");
            this.sendRequest("StoredQuery_ID=AdresseMitZusatz&strassenname=" + encodeURIComponent(adress.streetname) + "&hausnummer=" + encodeURIComponent(adress.housenumber) + "&zusatz=" + encodeURIComponent(adress.affix), this.triggerGetAdress, this.get("typeOfRequest"));
        }
        else {
            this.setTypeOfRequest("adress2");
            this.sendRequest("StoredQuery_ID=AdresseOhneZusatz&strassenname=" + encodeURIComponent(adress.streetname) + "&hausnummer=" + encodeURIComponent(adress.housenumber), this.triggerGetAdress, this.get("typeOfRequest"));
        }
    },

    /**
     * Todo
     * @param {*} adress - Todo
     * @returns {*} Todo
     */
    streetsSearch: function (adress) {
        this.setTypeOfRequest("searchHouseNumbers1");
        this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(adress.name), this.triggerGetStreets, this.get("typeOfRequest"));
    },

    /**
    * @description Veränderte Suchabfolge bei initialer Suche, z.B. über Config.initialQuery
    * @param {string} pattern - Suchstring
    * @returns {void}
    */
    directSearch: function (pattern) {
        var searchString = pattern,
            splitInitString;

        this.set("searchString", searchString);
        // Suche nach Straße, Hausnummer
        if (searchString.search(",") !== -1) {
            splitInitString = searchString.split(",");
            this.setOnlyOneStreetName(splitInitString[0]);
            searchString = searchString.replace(/ /g, "");
            this.set("searchStringRegExp", new RegExp(searchString.replace(/,/g, ""), "i")); // Erst join dann als regulärer Ausdruck
            this.setTypeOfRequest("onlyOneStreetName1");
            this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(this.get("onlyOneStreetName")), this.handleHouseNumbers, this.get("typeOfRequest"));
        }
        else {
            this.set("searchStringRegExp", new RegExp(searchString.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
            this.setOnlyOneStreetName("");
            this.setTypeOfRequest("onlyOneStreetName2");
            this.sendRequest("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(searchString), this.getStreets, this.get("typeOfRequest"));
        }
        // Suche nach Straßenschlüssel
        if (this.get("searchStreetKey") === true) {
            if (!_.isNull(searchString.match(/^[a-z]{1}[0-9]{1,5}$/i))) {
                this.setTypeOfRequest("searchStreetKey2");
                this.sendRequest("StoredQuery_ID=findeStrassenSchluessel&strassenschluessel=" + searchString, this.getStreetKey, this.get("typeOfRequest"));
            }
            else {
                Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetKeys");
            }
        }
        else {
            Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetKeys");
        }

        $("#searchInput").val(this.get("searchString"));
    },
    /**
    * @description Methode zur Weiterleitung der adressSearch
    * @param {xml} data - Response
    * @event Gaz#RadioTriggerGetAdress
    * @returns {void}
    */
    triggerGetAdress: function (data) {
        Radio.trigger("Gaz", "getAdress", data);
    },

    /**
     * Trigger die gefundenen Hausnummern
     * @param  {xml} data Response
     * @event Gaz#RadioTriggerGetAdress
     * @returns {void}
     */
    triggerGetStreets: function (data) {
        this.createHouseNumbers(data);
        Radio.trigger("Gaz", "getStreets", this.get("houseNumbers"));
    },
    /**
      * Handles the answer of search query for streets and adds it to the hitlist
     * @param  {String} data - answer of search query
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    getStreets: function (data) {
        var hits = $("wfs\\:member,member", data),
            coordinates,
            position,
            hitNames = [],
            hitName;

        if (this.get("handleMultipleStreetResults") === true) {
            _.each(hits, function (hit) {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                coordinates = [parseFloat(position[0]), parseFloat(position[1])];
                hitName = $(hit).find("iso19112\\:geographicIdentifier")[0].textContent;
                hitNames.push(hitName);

                // "Hitlist-Objekte"
                Radio.trigger("Searchbar", "pushHits", "hitList", {
                    name: hitName,
                    type: "Straße",
                    coordinate: coordinates,
                    glyphicon: "glyphicon-road",
                    id: hitName.replace(/ /g, "") + "Straße"
                });
            });
        }
        else {
            _.each(hits, function (hit) {
                coordinates = $(hit).find("gml\\:posList,posList")[0].textContent.split(" ");
                hitName = $(hit).find("dog\\:strassenname, strassenname")[0].textContent;
                hitNames.push(hitName);

                // "Hitlist-Objekte"
                Radio.trigger("Searchbar", "pushHits", "hitList", {
                    name: hitName,
                    type: "Straße",
                    coordinate: coordinates,
                    glyphicon: "glyphicon-road",
                    id: hitName.replace(/ /g, "") + "Straße"
                });
            }, this);

            if (this.get("searchHouseNumbers") === true) {
                if (hits.length === 1) {
                    this.setOnlyOneStreetName(hitName);
                    this.setTypeOfRequest("searchHouseNumbers1");
                    this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(hitName), this.handleHouseNumbers, this.get("typeOfRequest"));
                }
                else if (hits.length === 0) {
                    this.searchInHouseNumbers();
                }
                else {
                    _.each(hitNames, function (value) {
                        if (value.toLowerCase() === this.get("searchString").toLowerCase()) {
                            this.setOnlyOneStreetName(value);
                            this.setTypeOfRequest("searchHouseNumbers2");
                            this.sendRequest("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(value), this.handleHouseNumbers, this.get("typeOfRequest"));
                        }
                    }, this);
                }
            }
        }
        Radio.trigger("Searchbar", "createRecommendedList", "gazetteer_streetsOrHouseNumbers");
    },

    /**
     * [getDistricts description]
     * @param  {String} data [description]
     * @returns {void}
     */
    getDistricts: function (data) {
        var hits = $("wfs\\:member,member", data),
            coordinate,
            coordinateArray,
            hitName,
            pos,
            posList;

        _.each(hits, function (hit) {
            posList = $(hit).find("gml\\:posList,posList")[0];
            pos = $(hit).find("gml\\:pos,pos")[0];
            coordinate = posList ? posList.textContent : pos.textContent;
            coordinateArray = coordinate.split(" ");
            hitName = $(hit).find("iso19112\\:geographicIdentifier , geographicIdentifier")[0].textContent;
            Radio.trigger("Searchbar", "pushHits", "hitList", {
                name: hitName,
                type: "Stadtteil",
                coordinate: coordinateArray,
                glyphicon: "glyphicon-map-marker",
                id: hitName.replace(/ /g, "") + "Stadtteil"
            });
        }, this);
        Radio.trigger("Searchbar", "createRecommendedList");
    },

    /**
     * Handles the answer of the search query for housenumbers and adds it to the hitlist
     * @returns {void}
     */
    searchInHouseNumbers: function () {
        var address, number;

        // Adressuche über Copy/Paste
        if (this.get("pastedHouseNumber") !== undefined) {
            _.each(this.get("houseNumbers"), function (houseNumber) {
                address = houseNumber.name.replace(/ /g, "");
                number = houseNumber.adress.housenumber + houseNumber.adress.affix;

                if (number === this.get("pastedHouseNumber")) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", houseNumber, "paste");
                }
            }, this);
            this.unset("pastedHouseNumber");
        }
        else {
            _.each(this.get("houseNumbers"), function (houseNumber) {
                address = houseNumber.name.replace(/ /g, "");

                if (this.get("handleMultipleStreetResults") === true) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", houseNumber, "paste");
                }
                else if (address.search(this.get("searchStringRegExp")) !== -1) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", houseNumber);
                }
            }, this);
        }
    },

    /**
     * handles housenumber results
     * @param {Object} data - results of search query for housenumbers
     * @fires Searchbar#RadioTriggerSearchbarCheckInitialSearch
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    handleHouseNumbers: function (data) {
        this.createHouseNumbers(data);
        this.searchInHouseNumbers();
        Radio.trigger("Searchbar", "checkInitialSearch");
        Radio.trigger("Searchbar", "createRecommendedList", "gazetteer_streetsOrHouseNumbers");
    },

    /**
     * Todo
     * @param {*} data - Todo
     * @returns {*} Todo
     */
    createHouseNumbers: function (data) {
        var streetname = this.get("onlyOneStreetName");

        this.createHouseNumbersArray(data, streetname);
    },

    /**
     * Todo
     * @param {*} data - Todo
     * @returns {*} Todo
     */
    getParcel: function (data) {
        var hits = $("wfs\\:member,member", data),
            coordinate,
            position,
            geom,
            gemarkung,
            flurstueck;

        _.each(hits, function (hit) {
            position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
            gemarkung = $(hit).find("dog\\:gemarkung,gemarkung")[0].textContent;
            flurstueck = $(hit).find("dog\\:flurstuecksnummer,flurstuecksnummer")[0].textContent;
            coordinate = [parseFloat(position[0]), parseFloat(position[1])];
            geom = $(hit).find("gml\\:posList, posList")[0].textContent;
            // "Hitlist-Objekte"
            Radio.trigger("Searchbar", "pushHits", "hitList", {
                name: "Flurstück " + gemarkung + "/" + flurstueck,
                type: "Parcel",
                coordinate: coordinate,
                glyphicon: "glyphicon-map-marker",
                geom: geom,
                id: "Parcel"
            });
        }, this);
        Radio.trigger("Searchbar", "createRecommendedList", "gazetter_parcel");
    },

    /**
     * Todo
     * @param {*} data - Todo
     * @returns {*} Todo
     */
    getStreetKey: function (data) {
        var hits = $("wfs\\:member,member", data),
            coordinates,
            hitName;

        _.each(hits, function (hit) {
            if ($(hit).find("gml\\:posList,posList").length > 0 && $(hit).find("dog\\:strassenname, strassenname").length > 0) {
                coordinates = $(hit).find("gml\\:posList,posList")[0].textContent.split(" ");
                hitName = $(hit).find("dog\\:strassenname, strassenname")[0].textContent;
                // "Hitlist-Objekte"
                Radio.trigger("Searchbar", "pushHits", "hitList", {
                    name: hitName,
                    type: "Straße",
                    coordinate: coordinates,
                    glyphicon: "glyphicon-road",
                    id: hitName.replace(/ /g, "") + "Straße"
                });
            }
        }, this);
        Radio.trigger("Searchbar", "createRecommendedList", "gazetteer_streetKey");
    },

    /**
     * @description Führt einen HTTP-GET-Request aus.
     * @param {String} data - Data to be sent to the server
     * @param {function} successFunction - A function to be called if the request succeeds
     * @param {String} type - Typ des Requests
     * @returns {void}
     */
    sendRequest: function (data, successFunction, type) {
        var ajax = this.get("ajaxRequests");

        if (ajax[type] !== null && !_.isUndefined(ajax[type])) {
            ajax[type].abort();
            this.polishAjax(type);
        }
        this.ajaxSend(data, successFunction, type);
    },

    /**
     * Todo
     * @param {*} data - Todo
     * @param {*} successFunction - Todo
     * @param {*} typeRequest - Todo
     * @returns {*} Todo
     */
    ajaxSend: function (data, successFunction, typeRequest) {
        this.get("ajaxRequests")[typeRequest] = $.ajax({
            url: this.get("gazetteerURL"),
            data: data,
            dataType: "xml",
            context: this,
            type: "GET",
            success: successFunction,
            timeout: 6000,
            typeRequest: typeRequest,
            error: function (err) {
                if (err.status !== 0) { // Bei abort keine Fehlermeldung
                    this.showError(err);
                }

                // Markiere den Algorithmus für das entsprechende Suchziel als erledigt
                if (typeRequest === "onlyOneStreetName2" || typeRequest === "onlyOneStreetName1") {
                    Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetsOrHouseNumbers");
                }
                else if (typeRequest === "searchStreetKey2") {
                    Radio.trigger("Searchbar", "abortSearch", "gazetteer_streetKeys");
                }

            },
            complete: function () {
                this.polishAjax(typeRequest);
            }
        }, this);
    },

    /**
     * Triggert die Darstellung einer Fehlermeldung
     * @param {object} err Fehlerobjekt aus Ajax-Request
     * @returns {void}
     */
    showError: function (err) {
        var detail = err.statusText && err.statusText !== "" ? err.statusText : "";

        Radio.trigger("Alert", "alert", "Gazetteer-URL nicht erreichbar. " + detail);
    },

    /**
     * Löscht die Information des erfolgreichen oder abgebrochenen Ajax-Requests wieder aus dem Objekt der laufenden Ajax-Requests
     * @param {string} type Bezeichnung des Typs
     * @returns {void}
     */
    polishAjax: function (type) {
        var ajax = this.get("ajaxRequests"),
            cleanedAjax = _.omit(ajax, type);

        this.set("ajaxRequests", cleanedAjax);
    },

    /**
    * Setzt den jeweiligen Typ der gesendet wird
    * @param {string} value typeOfRequest
    * @returns {void}
    */
    setTypeOfRequest: function (value) {
        this.set("typeOfRequest", value);
    },

    /**
     * Creates an Array with all search results for housenumbers
     * @param  {xml} data - response of service
     * @param  {string} streetname - streetname of search query
     * @returns {void}
     */
    createHouseNumbersArray: function (data, streetname) {
        var hits = $("wfs\\:member,member", data),
            number,
            affix,
            coordinate,
            position,
            name,
            adress = {},
            obj = {},
            houseNumbers = [],
            street;

        _.each(hits, function (hit) {
            position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
            coordinate = [parseFloat(position[0]), parseFloat(position[1])];
            number = $(hit).find("dog\\:hausnummer,hausnummer")[0].textContent;
            if (this.get("handleMultipleStreetResults") === true) {
                street = streetname.split(",");
                if ($(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0] !== undefined) {
                    affix = $(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0].textContent;
                    name = street[0] + " " + number + affix + ", " + street[1];
                    adress = {
                        streetname: streetname,
                        housenumber: number,
                        affix: affix
                    };
                }
                else {
                    name = street[0] + " " + number + ", " + street[1];
                    adress = {
                        streetname: streetname,
                        housenumber: number
                    };
                }
            }
            else if ($(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0] !== undefined) {
                affix = $(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0].textContent;
                name = streetname + " " + number + affix;
                adress = {
                    streetname: streetname,
                    housenumber: number,
                    affix: affix
                };
            }
            else {
                name = streetname + " " + number;
                adress = {
                    streetname: streetname,
                    housenumber: number,
                    affix: ""
                };
            }
            // "Hitlist-Objekte"
            obj = {
                name: name,
                type: "Adresse",
                coordinate: coordinate,
                glyphicon: "glyphicon-map-marker",
                adress: adress,
                id: _.uniqueId("Adresse")
            };

            houseNumbers.push(obj);
        }, this);
        this.setHouseNumbers(houseNumbers);
    },

    /**
     * Setter for housenumbers
     * @param {String[]} houseNumbers - Array with all housenumbers of one street
     * @returns {void}
     */
    setHouseNumbers: function (houseNumbers) {
        this.set("houseNumbers", houseNumbers);
    },

    /**
     * Setter for Streetname
     * @param {String} name - Name of the street
     * @returns {void}
     */
    setOnlyOneStreetName: function (name) {
        this.set("onlyOneStreetName", name);
    },

    /**
     * Setter for handleMultipleStreetResults
     * @param {*} value - value
     * @returns {void}
     */
    setHandleMultipleStreetResults: function (value) {
        this.set("handleMultipleStreetResults", value);
    }
});

export default GazetteerModel;
