Die Kommunikationsschnittstelle (Remote-Interface) bietet Zugriff auf festgelegte Events und Funktionen in unterschiedlichen Modulen. Sie ist mit [Backbone.Radio](https://github.com/marionettejs/backbone.radio) umgesetzt. Backbone.Radio wird als Radio in den globalen Namespace importiert.

Die Kommunikationsschnittstelle kann erst verwendet werden, wenn alle notwendigen Module geladen sind. Hierfür wird per window.postMessage() ein MessageEvent bereitgestellt, auf das sich wie folgt registriert werden kann:

```
#!js
window.addEventListener("message", function (messageEvent) {
      if (messageEvent.data === "portalReady") {
         Radio.request("RemoteInterface", "getZoomLevel");
      }
}, false);

```

Eine vollständige Auflistung aller Events erfolgt nachfolgend. Die Syntax unterscheidet sich zwischen *Triggern* zum Verändern von Kartenzuständen und Auslösen von Operationen, *Requests* zum Abfragen von Kartenzuständen und *Events*, auf die sich registriert werden kann. Sie ist nachfolgend beschrieben.


**Syntax Trigger**
```
#!js
Radio.trigger("RemoteInterface", eventName [, parameter])
```

**Syntax Request**
```
#!js
Radio.request("RemoteInterface", eventName);
```

**Syntax Event**
```
Radio.on("RemoteInterface", eventName, function (eventObject) {
   console.log(eventObject);
});

Radio.once("RemoteInterface", eventName, function (eventObject) {
   console.log(eventObject);
});
```

---
**Inhaltsverzeichnis:**

[TOC]

---
# **Karte**

Über die hier genannten Aufrufe können bestimmte Kartenzustände gesetzt oder abgefragt werden und die Sichtbarkeit von Layern verändert werden.


## Zoomlevel setzen
*(setZoomLevel)*

Zoomt auf eine bestimmte Zoomstufe.


**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|number|Zoomlevel - wenn nicht anders konfiguriert 0 - 9|

**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "setZoomLevel", 2);
```

## Zoomlevel abfragen
*(getZoomLevel)*

Gibt die aktuelle Zoomstufe der Karte zurück.


**Returns** *number* (Wert zwischen 0-9)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getZoomLevel");
```

## Zentrumskoordinate setzen
*(setCenter)*


Setzt die übergebene Koordinate als Zentrum der Kartendarstellung. Die Koordinate muss im Wertebereich des aktuellen EPSG liegen.


**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|[Rechtswert, Hochwert]|Array mit Rechts- und Hochwert|

**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "setCenter", [565754, 5933960]);
```

## Zentrumskoordinate abfragen
*(getCenter)*

Gibt die aktuelle Zentrumskoordinate der Karte im definierten EPSG zurück.


**Returns** *[Rechtswert, Hochwert]* (Array mit Rechts- und Hochwert)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getCenter");
```
## Kartengröße aktualisieren (updateMapSize)

Berechnet die Kartengröße neu.

**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "updateMapSize");
```
## Extent abfragen

Mit diesem Aufruf kann der aktuell angezeigte Kartenausschnitt abgefragt werden.

**Returns** *[Rechtswert Min, Hochwert Min, Rechtswert Max, Hochwert Max]*

**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getExtent");
```

## Auf changedExtent registrieren
*(changedExtent)*

Mit diesem Aufruf kann sich auf das *changedExtent* Event registriert werden. Jedesmal wenn sich der Extent der sichtbaren Karte verändert, wird die Funktion ausgeführt. Dies passiert sowohl beim Verschieben der Karte als auch beim Hin- bzw. Hinauszoomen.


**Returns** *[Rechtswert Min, Hochwert Min, Rechtswert Max, Hochwert Max]* (Array mit Rechts- und Hochwerten)


**Beispiel-Aufruf**
```
#!js
Radio.on("RemoteInterface", "changedExtent", function (extent) {
   console.log(extent);
});
```
## Auf mobileBackButtonClicked registrieren (nur MML)
*(mobileBackButtonClicked)*

Mit diesem Aufruf kann sich auf das *mobileBackButtonClicked* Event registriert werden. Jedesmal wenn in der mobilen Ansicht der "back"-Button geklickt wird, wird die Funktion ausgeführt.

**Beispiel-Aufruf**
```
#!js
Radio.on("RemoteInterface", "mobileBackButtonClicked", function () {
   console.log("mobileBackButton wurde geklickt");
});
```
## BoundingBox WGS84 abfragen
*(getWGS84MapSizeBBOX)*

Gibt den aktuellen Extent (BoundingBox) der Karte im WGS84 zurück.


**Returns** *[Rechtswert Min, Hochwert Max, Rechtswert Max, Hochwert Min]* (Array mit Rechts- und Hochwerten)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getWGS84MapSizeBBOX");
```


## Alle Hintergrundkarten auslesen
*(getAllBaseLayers)*

Gibt die Namen der definierten BaseLayer als Array zurück.


**Returns** *[BaseLayername1, BaseLayername2, ...]* (Array mit BaseLayernamen)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getAllBaseLayers");
```

## Alle sichtbaren Hintergrundkarten auslesen
*(getVisibleBaseLayers)*

Gibt die Namen der sichtbaren BaseLayer als Array zurück.


**Returns** *[BaseLayername1, BaseLayername2, ...]* (Array mit BaseLayernamen)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getVisibleBaseLayers");
```

## Kartenebenen verbergen
*(hideLayers)*

Verbirgt die übergebenen Kartenebenen.


**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|[Layername1, Layername2, ...]|Array mit Layernamen|

**Beispiel-Aufruf**
```

#!js
Radio.trigger("RemoteInterface", "hideLayers", ["Layername1", "Layername2"]);
```


## Kartenebenen anzeigen
*(showLayers)*

Setzt die übergebenen Kartenebenen auf sichtbar.


**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|[Layername1, Layername2, ...]|Array mit Layernamen|
|value|Boolean|sichtbare Hintergrundlayer erst unsichtbar schalten|

**Beispiel-Aufruf**
```

#!js
Radio.trigger("RemoteInterface", "showLayers", ["Layername1", "Layername2"], true);
```
## Suchleiste ausblenden
*(hideSearchbar)*

Blendet die Suchleiste aus der Karte aus.


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "hideSearchbar");
```

## Suchleiste einblenden
*(showSearchbar)*

Blendet die Suchleiste in der Karte ein.


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showSearchbar");
```

---
# **DragMarker**

Über die hier genannten Aufrufe können spezielle Methoden und Funktionen im Zusammenhang mit einem DragMarker im Kontext Melde-Michel aufgerufen werden.

## Position setzen
*(setDragMarkerPosition)*

Setzt die Koordinaten des verschiebbaren Markers (DragMarker) auf die übergebenen Koordinaten. Die Koordinaten müssen sich im Wertebereich des aktuellen EPSG befinden.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|[Rechtswert, Hochwert]|Array mit Rechts- und Hochwert|

**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "setDragMarkerPosition", [565754, 5933960]);
```


## Position abfragen
*(getDragMarkerPosition)*

Gibt die Koordinaten des verschiebbaren Markers (DragMarker) zurück.


**Returns** *[Rechtswert, Hochwert]* (Array mit Rechts- und Hochwert)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getDragMarkerPosition");
```

## Auf newDragMarkerAddress registrieren
*(newDragMarkerAddress)*

Mit diesem Aufruf kann sich auf das *newDragMarkerAddress* Event registriert werden. Jedesmal, wenn Informationen über eine neue DragMarkerAddress vorliegen, wird die callback-Funktion ausgeführt. Das Event wird auch gefeuert, wenn keine Adresse ermittelt werden kann (z.B. bei Diensteproblemen), liefert dann aber ein ErrorObject zurück.


**Returns** (dragMarkerAddress)
```
#!js
{
   coordinate: [Number, Number],
   distance: Number,
   housenumber: String,
   housenumberaffix: String,
   postcode: String,
   streetname: String
}
```


**Beispiel-Aufruf für ein- und ausschalten des Handlers**
```
#!js
Radio.on("RemoteInterface", "newDragMarkerAddress", function (dragMarkerAddress) {
   console.log(dragMarkerAddress);
});
Radio.off("RemoteInterface", "newDragMarkerAddress");
```


**Beispiel-Aufruf für einmaligen Handler**
```
#!js
Radio.once("RemoteInterface", "newDragMarkerAddress", function (dragMarkerAddress) {
   console.log(dragMarkerAddress);
});
```


## Prüfung auf nächstgelegene Addresse initiieren
*(requestDragMarkerAddress)*

Initiiert die Prüfung auf eine zum DragMarker nächstgelegene Adresse. Feuert *newDragMarkerAddress*, wenn diese vorliegt. Diese manuelle Methode zur Ermittlung nächstgelegener Adressen kommt zum Einsatz, wenn nicht durchgehend auf *newDragMarkerAddress* reagiert werden soll.

**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "requestDragMarkerAddress");
```


## DragMarker sichtbar schalten
*(showDragMarker)*

Zeigt den DragMarker an.

**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showDragMarker");
```


## DragMarker unsichtbar schalten
*(hideDragMarker)*

Versteckt den Pin.

**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "hideDragMarker");
```


---
# **Vektorfeatures**

Über die hier genannten Aufrufe können spezielle Methoden und Funktionen für Vektorfeatures aufgerufen werden. Die Vektorfeatures werden zwar der Karte, nicht aber dem Layerbaum hinzugefügt.

## Features aus JSON hinzufügen
*(addFeatures)*

Fügt GeoJSON-Features der Karte als Vektorlayer hinzu.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|FeatureCollection|FeatureCollection aller Vektorfeatures|
|name|String|Vektorlayername|
|mouseHoverField|Object|Definiert welche Felder übergebenen Vektoren für das Popover verwendet werden sollen. Dabei wird zwischen Header (Überschrift) und Text (Inhalt) unterschieden. Siehe Beispiel.

**Beispiel-Aufruf**
```
#!js
/*
FeatureCollection:
*/
var features = {
        "name": "Anliegen_test",
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "EPSG:25832"
            }
        },
        "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [565879, 5934313]
                },
                "properties": {
                    "OBJECTID": 6009,
                    "name": "Feature 1",
                    "str": "Straße",
                    "hsnr": "1",
                    "kat_text": "Kategorie"
                }
            }, {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [565879, 5934413]
                },
                "properties": {
                    "OBJECTID": 6010,
                    "name": "Feature 2",
                    "str": "Straße",
                    "hsnr": "1",
                    "kat_text": "Kategorie"
                }
            }]
    };
/*
In diesem Objekt wird konfiguriert, welche Felder der Vektoren für das Popover verwendet werden.
Dabei wird zwischen der Überschrift und dem Text unterschieden.
Diese Einstellung gilt nur für die Übergebene Layer.
*/
var mouseHoverField = {
        mouseHoverField: {
            "header": ["str", "hsnr"],
            "text": ["kat_text"]
        }
    };

Radio.trigger("RemoteInterface", "addFeatures", features, "Anliegen_test", mouseHoverField );


```


## Alle Features verbergen
*(hideAllFeatures)*

Verbirgt alle hinzugefügten Vektorfeatures des genannten Layers.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|String|Layername mit den Vektorfeatures|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "hideAllFeatures", "Anliegen");
```


## Alle Features anzeigen
*(showAllFeatures)*

Zeigt alle hinzugefügten Vektorfeatures des genannten Layers an.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|String|Layername mit den Vektorfeatures|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showAllFeatures", "Anliegen");
```


## Features nach Selektion verbergen
*(hideFeatures)*

Verbirgt definierte Vektorfeatures des genannten Layers.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|name|String|Layername mit den Vektorfeatures|
|featureIds|[id]|Array mit FeautureIDs|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "hideFeatures", "Anliegen", ["1", "2"]);
```


## Features nach Selektion anzeigen
*(showFeatures)*

Zeigt definierte Vektorfeatures des genannten Layers.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|name|String|Layername mit den Vektorfeatures|
|featureIds|[id]|Array mit FeautureIDs|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showFeatures", "Anliegen", ["1", "2"]);
```

## Features im Kartenausschnitt zurückgeben
*(getLayerFeaturesInExtent)*

Gibt die Features des Layers zurück, die sich im Kartenausschnitt befinden.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|name|String|Layername mit den Vektorfeatures|


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getLayerFeaturesInExtent", "Anliegen");
```
