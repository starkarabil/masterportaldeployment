>**[Return to the Masterportal documentation](doc.md)**

[TOC]

# config.js

The `config.js` contains Masterportal configuration not directly related to UI or layers. For example, paths to other configuration files belong here. This file is usually placed next to the `index.html` and `config.json` files.

In the following, all configuration options are described. For all configuration options of type `object`, further nested options are linked and described in detail after the main table. You may also refer to **[this config.js example file](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/portal/basic/config.js)**.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|layerConf|yes|String||Path to the **[services.json](services.json.md)** file containing all available WMS layers and WFS feature types. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/services-internet.json"`|
|namedProjections|yes|String[]||Definition of the usable coordinate systems. See **[syntax definition](http://proj4js.org/#named-projections)** for details..|`[["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]]`|
|restConf|yes|String||Path to the **[rest-services.json](rest-services.json.md)** file describing further services, e.g. print service, WPS, CSW. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/rest-services-internet.json"`|
|styleConf|yes|String||Path to the **[style.json](style.json.md)** file describing vector layer (WFS) styles. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/style.json"`|
|addons|no|String[]|`[]`|List of names for custom modules. The modules are to be placed in the folder `/addons/`, with their entry points being defined in the `addonsConf.json`.|`["myAddon1", "myAddon2"]`|
|alerting|no|**[alerting](#markdown-header-alerting)**|`{"category": "alert-info", "isDismissable": true, "isConfirmable": false, "position": "top-center", "fadeOut": null}`|Overrides the alert module's default values.|{fadeOut: 6000}|
|cameraParameter|no|**[cameraParameter](#markdown-header-cameraparameter)**||Initial camera parameter||
|cesiumParameter|no|**[cesiumParameter](#markdown-header-cesiumparameter)**||Cesium flags||
|cswId|no|String|`"3"`|Reference to a CSW interface used to retrieve layer information. The ID will be resolved to a service defined in the **[rest-services.json](rest-services.json.md)** file.|`"my CSW-ID"`|
|defaultToolId|no|String|`"gfi"`|The tool with the given ID will be active when no other tool is active.|"filter"|
|layerSelector|no|**[layerSelector](#markdown-header-layerselector)**||Optional configuration for the layerSelector module||
|featureViaURL|no|**[featureViaURL](#markdown-header-featureviaurl)**||Optional configuration for the URL parameter `featureViaURL`. See **[urlParameter](urlParameter.md)** for details. Implemented for treeTypes *light* and *custom*.||
|footer|no|**[footer](#markdown-header-footer)**||If set, a footer is shown and configured with this object.||
|gfiWindow|no|String|`"detached"`|_Deprecated in the next major release. Please use the attribute "Portalconfig.menu.tool.gfi.desktopType" of the **[config.json](#config.json.md)** instead._ Display type and attribute information for all layer types. **attached**: the attribute information window is opened at click position **detached**: the attribute information window is opened at the top right of the map; a marker is set to the click position.|`"attached"`|
|ignoredKeys|no|String[]|`["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]`|List of attribute names to be ignored for attribute information lists of all layer types. Only used with "gfiAttributes": "showAll".|`["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]`|
|infoJson|no|String|`"info.json"`|Path to the `info.json` file containing additional information on snippets. The path is relative to the *index.html*.|`"info.json"`|
|inputMap|no|Object|`{}`|If this object is set, and its field `setMarker` is set to true, the Masterportal is configured as input element for data. In that case, each click sets a Map Marker and communicates the coordinates via **[remoteInterface](remoteInterface.md)** in the chosen coordinate reference system.|`{setMarker: true, targetProjection: "EPSG:4326", setCenter: false}`|
|inputMap.setCenter|no|Boolean|`false`|Center on a marker after producing it?|`setCenter: true`|
|inputMap.setMarker|no|Boolean|`false`|Flag to activate the 'setMarker' functionality.|`setMarker: true`|
|inputMap.targetProjection|no|String|`"EPSG:25832"`|The target coordinate reference system. Coordinates will be translated to it before being communicated via **[remoteInterface](remoteInterface.md)**.|`targetprojection: "EPSG:4326"`|
|mapMarker|no|**[mapMarker](#markdown-header-mapmarker)**||Overrides the map marker module's default values. Useful for 3D markers since OpenLayers's overlays can not be displayed in 3D mode. For this, the map marker has to be defined as vector layer.||
|metaDataCatalogueId|no|String|`"2"`|URL to the metadata catalog linked to in the layer information window. The ID is resolved to a service of the **[rest-services.json](rest-services.json.md)** file.|`"MetaDataCatalogueUrl"`|
|metadata|no|**[metadata](#markdown-header-metadata)**||Allows configuration of which metadata URLs are to be resolved via proxy.||
|mouseHover|no|**[mouseHover](#markdown-header-mousehover)**||Activates the MouseHover feature for vector layers, both WFS and GeoJSON. For per-layer configuration, see the **[config.json](config.json.md)**'s section *Themenconfig.Fachdaten.Layer*.|`true`|
|obliqueMap|no|Boolean|`false`|If set to `true`, an oblique map layer is created. An additional oblique layer must be defined.||
|portalConf|no|String|`"config.json"`|Path to the portal's `config.json` file. You may also enter a node; in that case the taken path is controlled by the urlParameter `config`.|Direct path: "../masterTree/config.json"; Node: "../../portal/master/". In the node scenario, a query parameter like `config=config.json` must exist in the URL.|
|postMessageUrl|no|String|`"http://localhost:8080"`|URL the portal is supposed to post messages to and receive messages from with the `postMessage` feature.|"http://localhost:8080"|
|proxyHost|no|String||Host name of a remote proxy with CORS configured to support the portal's domain, among others.|`"https://proxy.example.com"`|
|quickHelp|no|Object|`{}`|Activates the QuickHelp module. This displays a window containing help text for supported functions of the modules. Available for the layer tree (CustomTree), the search bar (Searchbar) and the routing tool (RoutingTool).||
|remoteInterface|no|**[remoteInterface](#markdown-header-remoteinterface)**||Optional remote interface configuration.||
|scaleLine|no|Boolean|`false`|Controls whether a scale line is displayed at the bottom right of the map.|`true`|
|simpleMap|no|Boolean|`false`|_Deprecated in the next major release. Please use the parameter `simpleMap` as part of the configuration of the `saveSelection` tool in the **[config.json](config.json.md)**._ Adds a SimpleMap URL to the `Save selection` dialogue. When calling this URL, the menu bar, layer tree, and map controls are deactivated. Not implemented for tree type *„light“*.|`false`|
|startingMap3D|bi|Boolean|`false`|Controls whether the map should start in 3D mode.||
|tree|no|**[tree](#tree)**||||
|uiStyle|no|String|`"default"`|Sets the control element layout. |`table`|
|wfsImgPath|no|String||Path to the folder holding images for the WFS styles. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/img/"`|
|wpsID|no|String|`""`|Reference to a WPS interface used in various modules. The ID is resolved to a service defined in the **[rest-services.json](rest-services.json.md)** file.|`""`|
|zoomToFeature|no|**[zoomToFeature](#markdown-header-zoomtofeature)**||Optional configuration of the URL query parameter `featureid`. For details, see **[urlParameter](urlParameter.md)**.||
|layerInformation|no|**[layerInformation](#markdown-header-layerinformation)**||Configuration for the layerInformation window.||

***

## alerting

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|fetchBroadcastUrl|no|String|`false`|The alerting module will initially use a linked configuration file from this URL, if set.|
|localStorageDisplayedAlertsKey|no|String|`"displayedAlerts"`|Arbitrary key used to store information regarding the alerting module in the browser's local storage.|

***

## cameraParameter

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|heading|no|Number||Camera's initial heading in radians|
|tilt|no|Number||Camera's initial tile in radians|
|altitude|no|Number||Camera's initial height in meters|

***

## cesiumParameter
|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|fog|no|Object||Fog options. See [fog documentation](https://cesiumjs.org/Cesium/Build/Documentation/Fog.html) for details.|
|enableLighting|no|Boolean|`false`|Activates light effects on the map based on the sun's position.|
|maximumScreenSpaceError|no|Number|`2.0`|Detail level in which terrain/raster tiles are fetched. 4/3 is the highest quality level.|
|fxaa|no|Boolean|`true`|activates *fast approximate anti-aliasing*|
|tileCacheSize|no|Number|`100`|terrain/raster tile cache size|

***

## footer

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|urls|no|**[urls](#markdown-header-footerurls)**[]||Array of URL configuration objects.|
|showVersion|no|Boolean|`false`|If `true`, the Masterportal version number is included in the footer.|

***

### footer.urls
|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|alias|no|String|`"Landesbetrieb Geoinformation und Vermessung"`|Link text for desktop applications|
|alias_mobil|no|String|`"LGV"`|Link text for mobile applications|
|bezeichnung|no|String|`"Kartographie und Gestaltung: "`|Link prefix|
|url|no|String||the URL the `alias` (or `alias_mobile`) text links to, e.g. `"https://example.com/"`. You may also link to mail creation with e.g. `"mailto:my_mail@example.com"`|
|toolModelId|no|String|`"SdpDownload"`|The id of a module to be opened on clicking the link. Do not include a URL for such cases.|

**Example:**

```json
{
    "footer": {
        "urls": [
            {
                "bezeichnung": "Cartography and design: ",
                "url": "https://geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoniformation und Vermessung",
                "alias_mobil": "LGV"
            },
            {
                "bezeichnung": "",
                "url": "http://www.hamburg.de/bsu/timonline",
                "alias": "Map inconsistencies"
            },
            {
                "bezeichnung": "",
                "url": "",
                "alias": "SDP Download",
                "toolModelId": "sdpdownload"
            }
        ],
        "showVersion": true
    }
}
```

***

## mapMarker

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|pointStyleId|no|String|`"defaultMapMarkerPoint"`|StyleId to refer to a `style.json` point style. If not set, the `img/mapMarker.svg` is used.|
|polygonStyleId|no|String|`"defaultMapMarkerPolygon"`|StyleId to refer to a `style.json` polygon style.|

**Example:**

```json
{
    "mapMarker": {
        "pointStyleId": "customMapMarkerPoint",
        "polygonStyleId": "customMapMarkerPolygon"
    }
}
```

***

## mouseHover

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|minShift|no|Integer|`5`|Minimum mouse position movement required to render a new tooltip; in pixels.|
|numFeaturesToShow|no|Integer|`2`|Maximum amount of element information per tooltip; when exceeded, an information text informs the user of cut content.|
|infoText|no|String|`"(Further objects. Please zoom.)"`|Information text shown when `numFeaturesToShow` is exceeded.|

***

## portalLanguage

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|enabled|yes|Boolean|`true`|Controls whether a button to switch the portal's language is provided.|
|debug|no|Boolean|`false`|Controls whether debug information regarding translations is logged to the console.|
|languages|yes|Object|`{ de: "deutsch", en: "englisch" }`|Language abbreviations. Please mind that matching locale files must exist.|
|fallbackLanguage|no|String|`"de"`|Fallback language used if contents are not available in the currently selected language.|
|changeLanguageOnStartWhen|no|String[]|`["querystring", "localStorage", "navigator", "htmlTag"]`|Order of user language detection. See [i18next browser language detection documentation](https://github.com/i18next/i18next-browser-languageDetector) for details.|
|loadPath|no|String|`"/locales/{{lng}}/{{ns}}.json"`|Path to load language files from, or a function returning such a path: `function(lngs, namespaces) { return path; }`. `lng` and `ns` are read from the path, if given, as if from a static path. You may also provide a URL like `"https://localhost:9001/locales/{{lng}}/{{ns}}.json"`. See [i18next http backend documentation](https://github.com/i18next/i18next-http-backend) for details.|

**Example:**

```json
{
"portalLanguage": {
        "enabled": true,
        "debug": false,
        "languages": {
            "de": "deutsch",
            "en": "englisch"
        },
        "fallbackLanguage": "de",
        "changeLanguageOnStartWhen": ["querystring", "localStorage", "navigator", "htmlTag"],
        "loadPath": "/locales/{{lng}}/{{ns}}.json"
    }
}
```

***

## quickHelp

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|imgPath|no|String|`"/"`|An absolute or relative path to the folder containing the quick help images.|
|searchbarAllgemeines1|no|String|`"allgemein.png"`|First quick help image regarding the Searchbar, belonging to the chapter "General information". The image must exist in the `imgPath` folder.|
|searchbarAllgemeines2|no|String|`"allgemein_2.png"`|Second quick help image regarding the Searchbar, belonging to the chapter "General information". The image must exist in the `imgPath` folder.|
|searchbarAllgemeines3|no|String|`"allgemein_3.png"`|Third quick help image regarding the Searchbar, belonging to the chapter "General information". The image must exist in the `imgPath` folder.|
|searchbarFlurstueckssuche|no|String|`"allgemein_4.png"`|Quick help image regarding the Searchbar, belonging to the chapter "Parcel search". The image must exist in the `imgPath` folder.|
|aufbau1|no|String|`"themen.png"`|First quick help image regarding the layer tree (CustomTree), belonging to the structure chapter. The image must exist in the `imgPath` folder.|
|aufbau2|no|String|`"themen_2.png"`|Second quick help image regarding the layer tree (CustomTree), belonging to the structure chapter. The image must exist in the `imgPath` folder.|
|routingTool1|no|String|`"routing_1.png"`|First quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool2|no|String|`"routing_2.png"`|Second quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool3|no|String|`"routing_3.png"`|Third quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool4|no|String|`"routing_4.png"`|Fourth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool5|no|String|`"routing_5.png"`|Fifth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool6|no|String|`"routing_6.png"`|Sixth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool7|no|String|`"routing_7.png"`|Seventh quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool8|no|String|`"routing_8.png"`|Eighth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool9|no|String|`"routing_9.png"`|Nineth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool10|no|String|`"routing_10.png"`|Tenth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool11|no|String|`"routing_11.png"`|Eleventh quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool12|no|String|`"routing_12.png"`|Twelfth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool13|no|String|`"routing_13.png"`|Thirteenth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool14|no|String|`"routing_14.png"`|Fourteenth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool15|no|String|`"routing_15.png"`|Fifteenth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|
|routingTool16|no|String|`"routing_16.png"`|Sixteenth quick help image regarding the routing tool (RoutingTool). The image must exist in the `imgPath` folder.|

***

## remoteInterface
|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|postMessageUrl|no|String|`"http://localhost:8080"`|URL the portal will post to and receive messages from with the `postMessage` feature.|

**Example:**

```json
{
    "remoteInterface": {
        "postMessageUrl": "http://localhost:8080"
    }
}
```
***

## tree

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|orderBy|no|String|`"OpenData"`|Category the layer tree is sorted by initially.|
|layerIDsToIgnore|no|Array||Array of `services.json` layer ids not to be shown in the layer tree.|
|layerIDsToStyle|no|**[layerIDsToStyle](#markdown-header-treelayeridstostyle)**[]||Special implementation for a HVV (Hamburg public transportation) service. Contains objects to request various styles of a layer id.|
|metaIDsToMerge|no|String[]||All layers found in the `services.json` regarding these meta IDs are merged to a single layer of the layer tree.|
|metaIDsToIgnore|no|String[]||All `services.json` layers listed will not be shown in the layer tree.|
|isFolderSelectable|no|Boolean|`true`|Globally sets whether a selection box is provided on folders that de-/activates all layers in it. An override per element exists, see **[config.json](config.json.md#Ordnerkonfiguration-Fachdaten)**.|

***

### tree.layerIDsToStyle

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|id|no|Sring||a `services.json` layer's id|
|styles|no|String/String[]||Style to be used as string; if multiple styles are to be used, they are listed in an array.|
|name|no|String/String[]||Name to be used as string; if multiple names are to be used, they are listed in an array.|
|legendUrl|no|String/String[]||Legend image URL to be used as string; if multiple legend images are to be used, their URLs are listed in an array.|

**Example:**

```json
{
    "tree": {
        "orderBy": "opendata",
        "layerIDsToIgnore": ["1912", "1913"],
        "layerIDsToStyle": [
            {
                "id": "1935",
                "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
            }
        ],
        "metaIDsToMerge": [
            "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1"
        ],
        "metaIDsToIgnore": [
            "09DE39AB-A965-45F4-B8F9-0C339A45B154"
        ],
        "isFolderSelectable": false
    }
}
```

***

## metadata

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|useProxy|no|String[]||_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Describes which metadata URLs are to be requested via proxy. The request will contain the requested URL as path, with dots replaced by underscores.|

**Example:**

```json
{
    "metadata": {
        "useProxy": [
            "https://metaver.de/csw"
        ]
    }
}
```

***

## zoomToFeature

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|imgLink|yes|String||Marker link. _Deprecated in the next major release._|
|wfsId|yes|String||ID to a WFS layer of which features to a position are requested from.|
|attribute|yes|String||Attribute by which the WFS is filtered.|
|styleId|no|String||A styleId from the `styles.json` may be supplied to override the map marker's design|
|useProxy|no|Boolean|`false`|_Deprecated in the next major release. *[GDI-DE](https://www.gdi-de.org/en)* recommends setting CORS headers on the required services instead._ Whether the service URL is to be requested via proxy. The request will contain the requested URL as path, with dots replaced by underdashes.|

**Example:**

```json
{
    "zoomtofeature": {
        "attribute": "flaechenid",
        "wfsId": "4560",
        "styleId": "location_eventlotse"
    }
}
```

***

## zoomToGeometry

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|imgLink|yes|String||Marker link. _Deprecated in the next major release._|
|layerId|yes|String|`"123456789"`|Id of the WFS layer the geometry is requested from.|
|attribute|yes|String|`"district_name"`|Attribute by which the WFS is filtered.|
|geometries|yes|String|`["DISTRICT1", "DISTRICT2"]`|Contains the geometries to be filtered from the WFS.|

**Example:**

```json
{
    "zoomToGeometry": {
        "layerId": "123456789",
        "attribute": "district_name",
        "geometries": ["DISTRICT1", "DISTRICT2"]
    }
}
```

***

## layerSelector

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|events|yes|Object[]||Events to be executed from other modules to select or add layers in layertree.|
|default|no|Object||Object to overwrite the missing parts in the events objects.|

**Example:**

```json
{
    "events": [
        {
            "source": "modulname",
            "filter": (value) => value === "graustufen",
            "deselectPreviousLayers": "allways",
            "layerIds": ["1001"]
        },
        {
            "source": "modulname",
            "filter": (value) => value === "farbe",
            "deselectPreviousLayers": "allways",
            "layerIds": ["1000"]
        }
    ],
    "default": {
        "openFolderForLayerIds": [],
        "showMenuInDesktopMode": false
    }
}
```

***

### layerSelector.events

Array of Objects to configure which are executed from other modules to interact with the layer tree.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|event|yes|String||The name of the event. For possible values and their meanings look further down.|
|showLayerId|no|String[]||Layer IDs of Layer to be selected in the layer tree.|
|layerIds|no|String[]||Layer IDs to add to the layer tree.|
|openFolderForLayerIds|no|String[]||List of Layer IDs to open their folders in the layer tree.|
|filter|no|Function||Function to check if this event should be triggered.|
|extent|no|Integer[]||Bounding Box to zoom to when this event is triggered.|
|deselectPreviousLayers|no|String|allways|Deselects the previous layers if it has the value allways.|
|showMenuInDesktopMode|no|Boolean||If this Event should run in the desktop mode.|

**Example:**

```json
{
    "events": [{
        "event": "",
        "showLayerId": null,
        "layerIds": [],
        "openFolderForLayerIds": [],
        "filter": null,
        "extent": [550697, 5927004,579383, 5941340],
        "deselectPreviousLayers": "allways",
        "showMenuInDesktopMode": false
    }]
}
```

***

**Values for event**

|event|Description|
|-----|-----------|
|comparefeatures_select|when a layer is selected for comparison in CompareFeatures module|
|fileimport_imported|when files were successfully imported in FileImport module|
|measure_geometry|when the selected geometry value changed in Measure module|

***

## featureViaURL

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|epsg|no|Integer|`4326`|EPSG code for coordinate reference system to translate coordinates to.|
|layers|yes|**[layers](#markdown-header-featureviaurllayers)**[]||Layer configuration array for given features.|
|zoomTo||String/String[]||Id of **[layers](#markdown-header-featureviaurllayers)** or array thereof, to which the Masterportal initially zooms. If none are given, the usual initial center coordinate is used.|

**Example:**

```json
{
    "featureViaURL": {
        "epsg": 25832,
        "zoomTo": "urlPointFeatures",
        "layers": [
            {
                "id": "urlPointFeatures",
                "geometryType": "Point",
                "name": "URL Point Features",
                "styleId": "url_points"
            },
            {
                "id": "urlLineFeatures",
                "geometryType": "LineString",
                "name": "URL Line Features",
                "styleId": "url_lines"
            },
            {
                "id": "urlPolygonFeatures",
                "geometryType": "Polygon",
                "name": "URL Polygon Features",
                "styleId": "url_polygons"
            },
            {
                "id": "urlMultiPointFeatures",
                "geometryType": "MultiPoint",
                "name": "URL MultiPoint Features",
                "styleId": "url_mulitpoints"
            },
            {
                "id": "urlMultiLineStringFeatures",
                "geometryType": "MultiLineString",
                "name": "URL MultiLineString Features",
                "styleId": "url_multilinestring"
            },
            {
                "id": "urlMultiPolygonFeatures",
                "geometryType": "MultiPolygon",
                "name": "URL MultiPolygon Features",
                "styleId": "url_multipolygons"
            }
        ]
    }
}
```

***

### featureViaURL.layers

The parameters described apply for each entry of the **[layers](#markdown-header-featureviaurllayers)** array.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|id|yes|String||unique ID for the layer to be created|
|geometryType|yes|enum["LineString", "Point", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"]||Geometry type of the feature to be shown.|
|name|yes|String||Layer name displayed in the layer tree, the legend, and the GFI pop-up.|
|styleId|no|String||Style id to be used for the feature, referring to the **[style.json](style.json.md)**.|

**Example:**

```json
{
    "layers": [{
        "id": "urlPolygonFeatures",
        "geometryType": "Polygon",
        "name": "URL Polygon Features",
        "styleId": "url_polygons"
    }]
}
```

***

## layerInformation

Configuration for the layerInformation window.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|showUrlGlobal|no|Boolean||parameter to globally toggle the dispaly of the service url for all layers. Referring to the "urlIsVisible" Parameter (see **[config.json](config.json.md#markdown-header-themenconfiglayer)** )|


**Example:**

```json
{
    "layerInformation": {
        "showUrlGlobal": true
    },
}
```

***

>**[Masterportal translation documentation](languages.md)**

>**[Return to the Masterportal documentation](doc.md)**
