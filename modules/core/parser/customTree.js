define([
    "modules/core/parser/portalConfig",
    "backbone.radio"
], function () {

    var Parser = require("modules/core/parser/portalConfig"),
        Radio = require("backbone.radio"),
        CustomTreeParser;

    CustomTreeParser = Parser.extend({

        initialize: function () {
            var treeType = Radio.request("Parser", "getPortalConfig").Baumtyp;

            if (treeType === "light") {
                this.parseTree(this.getOverlayer(), "Themen", 0);
                this.parseTree(this.getBaselayer(), "Themen", 0);
            }
            else {
                this.parseTree(this.getBaselayer(), "Baselayer", 0);
                this.parseTree(this.getOverlayer(), "Overlayer", 0);
            }
            this.createModelList();
        },

        /**
         * Parsed response.Themenconfig
         * Die Objekte aus der config.json und services.json werden über die Id zusammengeführt
         * @param  {Object} object - Baselayer | Overlayer | Folder
         * @param  {string} parentId
         * @param  {Number} level - Rekursionsebene = Ebene im Themenbaum
         */
        parseTree: function (object, parentId, level) {
            if (_.has(object, "Layer")) {
                _.each(object.Layer, function (layer) {
                    // Für Singel-Layer (ol.layer.Layer)
                    // z.B.: {id: "5181", visible: false}
                    if (_.isString(layer.id)) {
                        var objFromRawList = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: layer.id});

                        layer = _.extend(objFromRawList, layer);
                    }
                    // Für Single-Layer (ol.layer.Layer) mit mehreren Layern(FNP, LAPRO, Geobasisdaten (farbig), etc.)
                    // z.B.: {id: ["550,551,552,...,559"], visible: false}
                    else if (_.isArray(layer.id) && _.isString(layer.id[0])) {
                        var objsFromRawList = Radio.request("RawLayerList", "getLayerAttributesList"),
                            mergedObjsFromRawList = this.mergeObjectsByIds(layer.id, objsFromRawList);

                        layer = _.extend(mergedObjsFromRawList, _.omit(layer, "id"));
                    }
                    // Für Gruppen-Layer (ol.layer.Group)
                    // z.B.: {id: [{ id: "1364" }, { id: "1365" }], visible: false }
                    else if (_.isArray(layer.id) && _.isObject(layer.id[0])) {
                        var layerdefinitions = [];

                        _.each(layer.id, function (childLayer) {
                            var objFromRawList = Radio.request("RawLayerList", "getLayerAttributesWhere", {id: childLayer.id});

                            layerdefinitions.push(objFromRawList);
                        });
                        layer = _.extend(layer, {typ: "GROUP", id: _.uniqueId("grouplayer"), layerdefinitions: layerdefinitions});
                    }

                    // HVV :(
                    if (_.has(layer, "styles") && layer.styles.length > 1) {
                        _.each(layer.styles, function (style) {
                            this.addItem(_.extend({type: "layer", parentId: parentId, id: layer.id + style.toLowerCase(), level: level}, _.omit(layer, "id")));
                        }, this);
                    }
                    else {
                        this.addItem(_.extend({type: "layer", parentId: parentId, level: level, format: "image/png"}, layer));
                    }
                }, this);
            }
            if (_.has(object, "Ordner")) {
                _.each(object.Ordner, function (folder) {
                    var isLeafFolder = (!_.has(folder, "Ordner")) ? true : false;

                    folder.id = this.createUniqId(folder.Titel);
                    this.addItem({type: "folder", parentId: parentId, name: folder.Titel, id: folder.id, isLeafFolder: isLeafFolder, level: level, isInThemen: true});
                    // rekursiver Aufruf
                    this.parseTree(folder, folder.id, level + 1);
                }, this);
            }
        }
    });

    return CustomTreeParser;
});
