const ParametricURL = Backbone.Model.extend({
    defaults: {
        layerParams: [],
        isInitOpen: [],
        zoomToGeometry: "",
        zoomToFeatureIds: [],
        brwId: undefined,
        brwLayerName: undefined
    },

    initialize: function () {
        var channel = Radio.channel("ParametricURL");

        channel.reply({
            "getResult": function () {
                return this.get("result");
            },
            "getLayerParams": function () {
                return this.get("layerParams");
            },
            "getIsInitOpen": function () {
                return this.get("isInitOpen")[0];
            },
            "getInitString": function () {
                return this.get("initString");
            },
            "getProjectionFromUrl": function () {
                return this.get("projectionFromUrl");
            },
            "getCenter": function () {
                return this.get("center");
            },
            "getZoomLevel": function () {
                return this.get("zoomLevel");
            },
            "getZoomToGeometry": function () {
                return this.get("zoomToGeometry");
            },
            "getZoomToExtent": function () {
                return this.get("zoomToExtent");
            },
            "getStyle": this.getStyle,
            "getFilter": function () {
                return this.get("filter");
            },
            "getHighlightFeature": function () {
                return this.get("highlightfeature");
            },
            "getZoomToFeatureIds": function () {
                return this.get("zoomToFeatureIds");
            },
            "getBrwId": function () {
                return this.get("brwId");
            },
            "getBrwLayerName": function () {
                return this.get("brwLayerName");
            },
            "getMarkerFromUrl": function () {
                return this.get("markerFromUrl");
            }
        }, this);

        channel.on({
            "updateQueryStringParam": this.updateQueryStringParam,
            "pushToIsInitOpen": this.pushToIsInitOpen
        }, this);

        this.parseURL();
        channel.trigger("ready");
    },

    /**
     * Turn strings that can be commonly considered as booleas to real booleans. Such as "true", "false", "1" and "0". This function is case insensitive.
     * Aus underscore.string
     * @param  {number|string} value    der zu pr??fende Wert
     * @return {boolean}                R??ckgabe eines Boolean
     */
    toBoolean: function (value) {
        var val = typeof value === "string" ? value.toLowerCase() : value;

        switch (val) {
            case true:
            case "true":
            case 1:
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
    },

    /**
     * Parse string to number. Returns NaN if string can't be parsed to number.
     * Aus underscore.string
     * @param  {string} num             Text
     * @param  {number[]} precision   Dezimalstellen
     * @return {number}                 Zahl
     */
    toNumber: function (num, precision) {
        var factor;

        if (num === null) {
            return 0;
        }
        factor = Math.pow(10, isFinite(precision) ? precision : 0);
        return Math.round(num * factor) / factor;
    },

    setResult: function (value) {
        this.set("result", value);
    },

    setLayerParams: function (value) {
        this.set("layerParams", value);
    },

    setIsInitOpenArray: function (value) {
        this.set("isInitOpen", value);
    },
    pushToIsInitOpen: function (value) {
        var isInitOpenArray = this.get("isInitOpen"),
            msg = "";

        isInitOpenArray.push(value);
        isInitOpenArray = _.uniq(isInitOpenArray);

        if (isInitOpenArray.length > 1) {
            msg += "Fehlerhafte Kombination von Portalkonfiguration und parametrisiertem Aufruf.<br>";
            _.each(isInitOpenArray, function (tool, index) {
                msg += tool;
                if (index < isInitOpenArray.length - 1) {
                    msg += " und ";
                }
            });
            msg += " k??nnen nicht gleichzeitig ge??ffnet sein";
            Radio.trigger("Alert", "alert", msg);
        }
        this.setIsInitOpenArray(isInitOpenArray);
    },

    createLayerParams: function () {
        var layerIdString = _.values(_.pick(this.get("result"), "LAYERIDS"))[0],
            visibilityListString = _.has(this.get("result"), "VISIBILITY") ? _.values(_.pick(this.get("result"), "VISIBILITY"))[0] : "",
            transparencyListString = _.has(this.get("result"), "TRANSPARENCY") ? _.values(_.pick(this.get("result"), "TRANSPARENCY"))[0] : "",
            layerIdList = layerIdString.indexOf(",") !== -1 ? layerIdString.split(",") : new Array(layerIdString),
            visibilityList,
            transparencyList,
            layerParams = [];

        // Sichtbarkeit auslesen. Wenn fehlend true
        if (visibilityListString === "") {
            visibilityList = _.map(layerIdList, function () {
                return true;
            });
        }
        else if (visibilityListString.indexOf(",") > -1) {
            visibilityList = _.map(visibilityListString.split(","), function (val) {
                return this.toBoolean(val);
            }, this);
        }
        else {
            visibilityList = new Array(this.toBoolean(visibilityListString));
        }

        // Tranzparenzwert auslesen. Wenn fehlend Null.
        if (transparencyListString === "") {
            transparencyList = _.map(layerIdList, function () {
                return 0;
            });
        }
        else if (transparencyListString.indexOf(",") > -1) {
            transparencyList = _.map(transparencyListString.split(","), function (val) {
                return this.toNumber(val);
            }, this);
        }
        else {
            transparencyList = [parseInt(transparencyListString, 0)];
        }

        if (layerIdList.length !== visibilityList.length || visibilityList.length !== transparencyList.length) {
            Radio.trigger("Alert", "alert", {text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Die Angaben zu LAYERIDS passen nicht zu VISIBILITY bzw. TRANSPARENCY. Sie m??ssen jeweils in der gleichen Anzahl angegeben werden.", kategorie: "alert-warning"});
            return;
        }

        _.each(layerIdList, function (val, index) {
            var layerConfigured = Radio.request("Parser", "getItemByAttributes", {id: val}),
                layerExisting = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: val}),
                treeType = Radio.request("Parser", "getTreeType"),
                layerToPush;

            layerParams.push({id: val, visibility: visibilityList[index], transparency: transparencyList[index]});

            if (_.isUndefined(layerConfigured) && !_.isNull(layerExisting) && treeType === "light") {
                layerToPush = _.extend({type: "layer", parentId: "tree", isVisibleInTree: "true"}, layerExisting);
                Radio.trigger("Parser", "addItemAtTop", layerToPush);
            }
            else if (_.isUndefined(layerConfigured)) {
                Radio.trigger("Alert", "alert", {text: "<strong>Parametrisierter Aufruf fehlerhaft!</strong> Es sind LAYERIDS in der URL enthalten, die nicht existieren. Die Ids werden ignoriert.(" + val + ")", kategorie: "alert-warning"});
            }
        }, this);

        this.setLayerParams(layerParams);
    },
    createLayerParamsUsingMetaId: function (metaIds) {
        var layers = [],
            layerParams = [],
            hintergrundKarte = Radio.request("Parser", "getItemByAttributes", {id: "453"});

        layers.push(hintergrundKarte);

        _.each(metaIds, function (metaId) {
            var metaIDlayers = Radio.request("Parser", "getItemsByMetaID", metaId);

            _.each(metaIDlayers, function (layer) {
                layers.push(layer);
            });
        });
        _.each(layers, function (layer) {
            layerParams.push({id: layer.id, visibility: true, transparency: 0});
        });
        this.setLayerParams(layerParams);
    },
    parseMDID: function (result) {
        var values = _.values(_.pick(result, "MDID"))[0].split(",");

        Config.tree.metaIdsToSelected = values;
        Config.view.zoomLevel = 0;
        this.createLayerParamsUsingMetaId(values);
    },
    parseProjection: function (result) {
        var projection = _.values(_.pick(result, "PROJECTION")).pop();

        if (!_.isUndefined(projection)) {
            this.setProjectionFromUrl(projection);
        }
    },
    parseCoordinates: function (result, property) {
        var values = _.values(_.pick(result, property))[0].split("@")[1] ? _.values(_.pick(result, property))[0].split("@")[0].split(",") : _.values(_.pick(result, property))[0].split(",");

        // parse Strings to numbers
        values = _.map(values, Number);
        return values;
    },

    parseZOOMTOEXTENT: function (result) {
        var values = _.values(_.pick(result, "ZOOMTOEXTENT"))[0].split(",");

        this.set("zoomToExtent", [parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3])]);
    },
    parseBezirk: function (result) {
        var bezirk = _.values(_.pick(result, "BEZIRK"))[0],
            bezirke = [
                {name: "ALTONA", number: "2"},
                {name: "HARBURG", number: "7"},
                {name: "HAMBURG-NORD", number: "4"},
                {name: "BERGEDORF", number: "6"},
                {name: "EIMSB??TTEL", number: "3"},
                {name: "HAMBURG-MITTE", number: "1"},
                {name: "WANDSBEK", number: "5"},
                {name: "ALL", number: "0"}
            ];

        if (bezirk.length === 1) {
            bezirk = _.findWhere(bezirke, {number: bezirk});
        }
        else {
            bezirk = _.findWhere(bezirke, {name: bezirk.trim().toUpperCase()});
        }
        if (_.isUndefined(bezirk)) {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Der Parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong> <br> <small>Details: Konnte den Parameter Bezirk = " + _.values(_.pick(result, "BEZIRK"))[0] + " nicht aufl??sen.</small>",
                kategorie: "alert-warning"
            });
            return;
        }
        this.setZoomToGeometry(bezirk.name);
    },
    parseBrwId: function (result) {
        var brwId = _.values(_.pick(result, "BRWID"))[0];

        this.setBrwId(brwId);
    },
    parseBrwLayerName: function (result) {
        var brwLayerName = _.values(_.pick(result, "BRWLAYERNAME"))[0];

        this.setBrwLayerName(brwLayerName);
    },
    parseFeatureId: function (result) {
        var ids = _.values(_.pick(result, "FEATUREID"))[0];

        this.setZoomToFeatureIds(ids.split(","));
    },
    parseZoomLevel: function (result) {
        var value = _.values(_.pick(result, "ZOOMLEVEL"))[0];

        this.set("zoomLevel", value);
    },
    parseIsInitOpen: function (result) {
        this.get("isInitOpen").push(_.values(_.pick(result, "ISINITOPEN"))[0].toUpperCase());
    },
    parseStartupModul: function (result) {
        this.get("isInitOpen").push(_.values(_.pick(result, "STARTUPMODUL"))[0].toUpperCase());
    },
    parseQuery: function (result) {
        var value = _.values(_.pick(result, "QUERY"))[0].toLowerCase(),
            initString = "",
            split;

        // Bei " " oder "-" im Suchstring
        if (value.indexOf(" ") >= 0 || value.indexOf("-") >= 0) {

            // nach " " splitten
            split = value.split(" ");

            _.each(split, function (splitpart) {
                initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + " ";
            });
            initString = initString.substring(0, initString.length - 1);

            // nach "-" splitten
            split = "";
            split = initString.split("-");
            initString = "";
            _.each(split, function (splitpart) {
                initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + "-";
            });
            initString = initString.substring(0, initString.length - 1);
        }
        else {
            initString = value.substring(0, 1).toUpperCase() + value.substring(1);
        }
        this.set("initString", initString);
    },
    parseStyle: function (result) {
        var value = _.values(_.pick(result, "STYLE"))[0].toUpperCase();

        if (value && (value === "TABLE" || value === "SIMPLE")) {
            Radio.trigger("Util", "setUiStyle", value);
        }
    },
    parseURL: function () {
        // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4
        var query = location.search.substr(1), // URL --> alles nach ? wenn vorhanden
            result = {},
            value;

        if (query.length > 0) {
            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0].toUpperCase()] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });
            this.setResult(result);
        }
        else {
            this.setResult(undefined);
        }

        /**
         * ??ber diesen Parameter wird GeoOnline aus dem Transparenzporal aufgerufen
         * Der entsprechende Datensatz soll angezeigt werden
         * Hinter dem Parameter Id steckt die MetadatenId des Metadatensatzes
         * Die Metadatensatz-Id wird in die config geschrieben
         */
        if (_.has(result, "MDID")) {
            this.parseMDID(result);
        }

        if (_.has(result, "PROJECTION")) {
            this.parseProjection(result);
        }

        /**
         * Gibt die initiale Zentrumskoordinate zur??ck.
         * Ist der Parameter "center" vorhanden wird dessen Wert zur??ckgegeben, ansonsten der Standardwert.
         * Angabe des EPSG-Codes der Koordinate ??ber "@"
         */
        if (_.has(result, "CENTER")) {
            this.setCenter(this.parseCoordinates(result, "CENTER"));
        }

        /**
         * Setzt einen Marker, sofern in der URL vorhanden.
         */
        if (_.has(result, "MARKER")) {
            this.setMarkerFromUrl(this.parseCoordinates(result, "MARKER"));
        }

        if (_.has(result, "ZOOMTOEXTENT")) {
            this.parseZOOMTOEXTENT(result);
        }

        if (_.has(result, "BEZIRK")) {
            this.parseBezirk(result);
        }

        if (_.has(result, "BRWID")) {
            this.parseBrwId(result);
        }
        if (_.has(result, "BRWLAYERNAME")) {
            this.parseBrwLayerName(result);
        }

        /**
         * Gibt die LayerIDs f??r die Layer zur??ck, die initial sichtbar sein sollen.
         * Ist der Parameter "layerIDs" vorhanden werden dessen IDs zur??ckgegeben, ansonsten die konfigurierten IDs.
         */
        if (_.has(result, "LAYERIDS") && result.LAYERIDS.length > 0) {
            this.createLayerParams();
        }

        if (_.has(result, "FEATUREID")) {
            this.parseFeatureId(result);
        }

        /**
         * Gibt die initiale Resolution (Zoomlevel) zur??ck.
         * Ist der Parameter "zoomLevel" vorhanden wird der Wert in die Config geschrieben und in der mapView ausgewertet.
         */
        if (_.has(result, "ZOOMLEVEL")) {
            this.parseZoomLevel(result);
        }

        /**
        * Initial zu startendes Modul
        *
        */
        if (_.has(result, "ISINITOPEN")) {
            this.parseIsInitOpen(result);
        }

        /**
        * R??ckw??rtskompatibel: entspricht isinitopen
        */
        if (_.has(result, "STARTUPMODUL")) {
            this.parseStartupModul(result);
        }

        /**
        *
        */
        if (_.has(result, "QUERY")) {
            this.parseQuery(result);
        }

        /**
        * blendet alle Bedienelemente aus - f??r MRH
        *
        */
        if (_.has(result, "STYLE")) {
            this.parseStyle(result);
        }

        if (_.has(result, "FILTER")) {
            value = _.values(_.pick(result, "FILTER"))[0];

            this.set("filter", JSON.parse(value));
        }

        /**
         * passt den Config startingMap3D Parameter an.
         */
        if (_.has(result, "MAP")) {
            value = _.values(_.pick(result, "MAP"))[0].toUpperCase();

            if (value === "2D") {
                Config.startingMap3D = false;
            }
            else if (value === "3D") {
                Config.startingMap3D = true;
            }
        }

        if (!Config.cameraParameter) {
            Config.cameraParameter = {};
        }
        /**
         * wertet die Camera Parameter( heading, tilt, altitude) aus
         */
        if (_.has(result, "HEADING")) {
            value = _.values(_.pick(result, "HEADING"))[0];

            Config.cameraParameter.heading = value;
        }
        if (_.has(result, "TILT")) {
            value = _.values(_.pick(result, "TILT"))[0];

            Config.cameraParameter.tilt = value;
        }
        if (_.has(result, "ALTITUDE")) {
            value = _.values(_.pick(result, "ALTITUDE"))[0];

            Config.cameraParameter.altitude = value;
        }
        if (_.has(result, "HIGHLIGHTFEATURE")) {
            value = _.values(_.pick(result, "HIGHLIGHTFEATURE"))[0];

            this.set("highlightfeature", value);
        }
    },

    /**
     * https://gist.github.com/excalq/2961415
     * @param  {string} key   Key
     * @param  {string} value Value
     * @returns {void}
     */
    updateQueryStringParam: function (key, value) {
        var baseUrl = [location.protocol, "//", location.host, location.pathname].join(""),
            urlQueryString = document.location.search,
            newParam = key + "=" + value,
            params = "?" + newParam,
            keyRegex;

        // If the "search" string exists, then build params from it
        if (urlQueryString) {
            keyRegex = new RegExp("([?,&])" + key + "[^&]*");

            // If param exists already, update it
            if (urlQueryString.match(keyRegex) !== null) {
                params = urlQueryString.replace(keyRegex, "$1" + newParam);
            }
            // Otherwise, add it to end of query string
            else {
                params = urlQueryString + "&" + newParam;
            }
        }
        // iframe
        if (window !== window.top) {
            Radio.trigger("RemoteInterface", "postMessage", {"urlParams": params});
        }
        else {
            window.history.replaceState({}, "", baseUrl + params);
        }

        this.parseURL();
    },

    // setter for zoomToGeometry
    setZoomToGeometry: function (value) {
        this.set("zoomToGeometry", value);
    },

    // setter for zoomLevel
    setZoomLevel: function (value) {
        this.set("zoomLevel", value);
    },
    setZoomToFeatureIds: function (value) {
        this.set("zoomToFeatureIds", value);
    },
    /**
     * Setter for brw id
     * @param {String} value Brw id
     * @returns {void}
     */
    setBrwId: function (value) {
        this.set("brwId", value);
    },
    /**
     * Setter for brw layer name
     * @param {String} value Brw layer name
     * @returns {void}
     */
    setBrwLayerName: function (value) {
        this.set("brwLayerName", value);
    },

    setProjectionFromUrl: function (value) {
        this.set("projectionFromUrl", value);
    },
    setCenter: function (value) {
        this.set("center", value);
    },
    setMarkerFromUrl: function (value) {
        this.set("markerFromUrl", value);
    }
});

export default ParametricURL;
