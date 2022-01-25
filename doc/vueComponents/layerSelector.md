# The layerSelector module


## snippet for used modules

To use this module, the following code snippet hast to be added to the module which should execute the layerSelector:

```js
// [...]

if (this.$store.state.LayerSelector !== undefined) {
    this.$store.state.LayerSelector.execute = {source: sourceName, argument: <selection of a field; optional>};
}

// [...]
```

The attribute source must fit the sourceName used in the configured events.

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
            "source": "modulname",
            "filter": (value) => value === "graustufen",
            "deselectPreviousLayers": "allways",
            "layerIds": ["1001"]
        },
        {
            "source": "modulname",
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
|source|yes|String||The name of the event. It has to be equal to the source attribute the module sets.|
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
    "layers": [{
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