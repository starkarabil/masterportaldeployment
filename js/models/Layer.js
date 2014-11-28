define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config'
], function (_, Backbone, ol, EventBus, Config) {

    /**
     *
     */
    var Layer = Backbone.Model.extend({
        initialize: function () {
            // Trigger in Searchbar
            EventBus.on('getBackboneLayer', function() {
                EventBus.trigger('LayerVisibilityChangedForSearchbar', this);
            }, this);
            this.listenTo(this, 'change:visibility', this.setVisibility);
            this.listenTo(this, 'change:transparence', this.updateOpacity);

            this.setAttributionLayerSource();
            this.setAttributionLayer();
            // Default Visibility ist false. In LayerList wird visibility nach config.js gesetzt.
            this.get('layer').setVisible(false);
            this.set('visibility', false);
            this.set('settings', false);
            this.set('transparence', 0);

            // NOTE hier werden die datasets[0] Attribute aus der json in das Model geschrieben
            this.setAttributions();
            this.unset('datasets');
        },
        setAttributions: function () {
            var datasets = this.get('datasets');
            if (datasets) {
                if(datasets[0] !== undefined) {
                    var dataset = this.get('datasets')[0];
                    this.set('metaID', dataset.md_id);
                    this.set('metaName', dataset.md_name);
                    this.set('kategorieOpendata', dataset.kategorie_opendata);
                }
            }
        },
        /**
        * diese Funktion liest den übergebenen String gfiAttributes ein und erzeugt daraus
        * ein Object. Das Object wird an die WMSLayer, WFSLayer zurückgegeben.
        */
        convertGFIAttributes: function () {
            if (this.get('gfiAttributes')) {
                if (this.get('gfiAttributes').toUpperCase() === "SHOWALL" || this.get('gfiAttributes').toUpperCase() === "IGNORE" ) {
                    return this.get('gfiAttributes');
                }
                else {
                    var gfiAttributList = this.get('gfiAttributes').split(',');
                    var gfiAttributes = {};
                    _.each(gfiAttributList, function (gfiAttributeConfig) {
                        var gfiAttribute = gfiAttributeConfig.split(':');
                        var key = new Array();
                        key.push(gfiAttribute[0].trim());
                        var value = new Array();
                        value.push(gfiAttribute[1].trim());
                        newKey = _.object(key, value);
                        _.extend(gfiAttributes, newKey);
                    });
                    return gfiAttributes;
                }
            }
        },
        /**
         *
         */
        toggleVisibility: function () {
            if (this.get('visibility') === true) {
                this.set({'visibility': false});
            }
            else {
                this.set({'visibility': true});
            }
            //EventBus.trigger('checkVisibilityByFolder');
        },
        /**
         *
         */
        setUpTransparence: function (value) {
            if (this.get('transparence') < 90) {
                this.set('transparence', this.get('transparence') + value);
            }
        },
        /**
         *
         */
        setDownTransparence: function (value) {
            if (this.get('transparence') > 0) {
                this.set('transparence', this.get('transparence') - value);
            }
        },
        /**
         *
         */
        updateOpacity: function () {
            var opacity = (100 - this.get('transparence')) / 100;
            this.get('layer').setOpacity(opacity);
            this.set({'opacity': opacity});
        },
        /**
         *
         */
        setVisibility: function () {
            var visibility = this.get('visibility');
            this.get('layer').setVisible(visibility);
            EventBus.trigger('LayerVisibilityChangedForSearchbar', this);
        },
        /**
         *
         */
        toggleSettings: function () {
            if (this.get('settings') === true) {
                this.set({'settings': false});
            }
            else {
                this.set({'settings': true});
            }
        }
    });
    return Layer;
});
