import Theme from "../model";
import ImgView from "../../objects/image/view";
import VideoStreamingView from "../../objects/videostreaming/view";
import RoutableView from "../../objects/routingButton/view";

const DefaultTheme = Theme.extend({
    initialize: function () {
        var channel = Radio.channel("defaultTheme");

        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceValuesWithChildObjects();
                this.checkRoutable();
            }
        });

        // render gfi new when changing properties of the associated features
        this.listenTo(channel, {
            "changeGfi": function () {
                Radio.trigger("gfiView", "render");
            }
        });
    },

    /**
     * Prüft, ob der Button zum Routen angezeigt werden soll
     * @returns {void}
     */
    checkRoutable: function () {
        if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "routing"})) === false) {
            if (this.get("routable") === true) {
                this.set("routable", new RoutableView());
            }
        }
    },
    /**
     * Hier werden bei bestimmten Keywords Objekte anstatt von Texten für das template erzeugt. Damit können Bilder oder Videos als eigenständige Objekte erzeugt und komplex
     * gesteuert werden. Im Template werden diese Keywords mit # ersetzt und rausgefiltert. Im view.render() werden diese Objekte attached.
     * Eine leidige Ausnahme bildet z.Z. das Routing, da hier zwei features des Reisezeitenlayers benötigt werden. (1. Ziel(key) mit Dauer (val) und 2. Route mit ol.geom (val).
     * Das Auswählen der richtigen Werte für die Übergabe erfolgt hier.
     * @returns {void}
     */
    replaceValuesWithChildObjects: function () {
        var element = this.get("gfiContent"),
            children = [];

        if (_.isString(element) && element.match(/content="text\/html/g)) {
            children.push(element);
        }
        else {
            element[0] = this.filterVideoTag(element[0]);
            _.each(element, function (ele, index) {
                _.each(ele, function (val, key) {
                    var copyright,
                        imgView,
                        videoStreamingView,
                        valString = String(val);

                    if (valString.substr(0, 4) === "http"
                        && (valString.search(/\.jpg/i) !== -1 || valString.search(/\.png/i) !== -1 || valString.search(/\.jpeg/i) !== -1 || valString.search(/\.gif/i) !== -1)) {
                        // Prüfen, ob es auch ein Copyright für das Bild gibt, dann dieses ebenfalls an ImgView übergeben, damit es im Bild dargestellt wird
                        copyright = "";

                        if (element[index].Copyright !== null) {
                            copyright = element[index].Copyright;
                            element[index].Copyright = "#";
                        }
                        else if (element[index].copyright !== null) {
                            copyright = element[index].copyright;
                            element[index].copyright = "#";
                        }

                        imgView = new ImgView(valString, copyright);

                        element[index][key] = "#";

                        children.push({
                            key: imgView.model.get("id"),
                            val: imgView,
                            type: "image"
                        });
                    }
                    else if (key === "video" || key === "mobil_video") {
                        videoStreamingView = new VideoStreamingView(valString);

                        element[index][key] = "#";

                        children.push({
                            key: videoStreamingView.model.get("id"),
                            val: videoStreamingView,
                            type: "video"
                        });
                    }
                    // lösche leere Dummy-Einträge wieder raus.
                    element[index] = _.omit(element[index], function (value) {
                        return value === "#";
                    });
                }, this);
            });
        }
        if (children.length > 0) {
            this.set("children", children);
        }
        this.set("gfiContent", element);
    },

    /**
     * Prüft auf videotags und filtert entsprechend dem Devicetyp nach mobil oder desktop.
     * @param   {object}    gfiContent  GFI-Infos
     * @returns {object}    GFI-Infos
     */
    filterVideoTag: function (gfiContent) {
        if (_.has(gfiContent, "video") || _.has(gfiContent, "mobil_video")) {
            if (Radio.request("Util", "isAny")) {
                return _.omit(gfiContent, "video");
            }
            return _.omit(gfiContent, "mobil_video");
        }

        return gfiContent;
    }
});

export default DefaultTheme;
