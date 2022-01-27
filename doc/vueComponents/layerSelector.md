# The layerSelector module

## Configuration of the module

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|events|yes|Object[]||Events to be executed from other modules to select or add layers in the layertree.|
|default|no|Object||Object to overwirte the missing parts in the events objects.|

**Example:**

```json
{
    "events": [
        {
            "event": "eventName",
            "filter": (value) => value === "graustufen",
            "deselectPreviousLayers": "allways",
            "layerIds": ["1001"]
        },
        {
            "event": "eventName",
            "filter": (value) => value === "farbe",
            "deselectPreviousLayers": "allways",
            "layerIds": ["1000"],
            "extent": [550697, 5927004, 579383, 5941340],
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
        "extent": [],
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

**Information for developer**

For more events add an entry into the eventMap attribute in **[stateLayerSelector.js](src\modules\layerSelector\store\stateLayerSelector.js)**

***