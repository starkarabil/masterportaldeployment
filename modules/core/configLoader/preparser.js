define([
        "modules/core/configLoader/parserDefaultTree",
    "modules/core/configLoader/parserCustomTree"
], function () {
    var DefaultTreeParser = require("modules/core/configLoader/parserDefaultTree"),
        CustomTreeParser = require("modules/core/configLoader/parserCustomTree"),
        Preparser;

    Preparser = Backbone.Model.extend({
        url: function () {
            return Radio.request("Util", "getPath", configPath) + "config.json";
        },
        initialize: function () {
            this.fetch({async: false, error: function () {
                Radio.trigger("Alert", "alert", "Die Config.json konnte entweder nicht geladen oder nicht verarbeitet werden");
            }});
        },
        parse: function (response) {
            var attributes = {
                portalConfig: response.Portalconfig,
                baselayer: response.Themenconfig.Hintergrundkarten,
                overlayer: response.Themenconfig.Fachdaten,
                treeType: response.Portalconfig.Baumtyp
            };

           if (attributes.treeType === "default") {
                new DefaultTreeParser(attributes);
            }
            else {
                new CustomTreeParser(attributes);
            }
        }
    });

    return Preparser;
});
