# Vuetify im Masterportal

Erfahrung mit der Installation und ersten Nutzung von Vuetify im Masterportal.   
Kurze Übersicht:

**Vorteile**:
- automatisch erzeugte Accessibility
- Vorgefertige Komponenten
- einfache Installation
- "sieht besser aus"

**Nachteile**:
- Kompalibität zu bisherigen Code nicht so gut
    - Selects nicht einfach in v-select konvertierbar, da anderes Verhalten oder Aufbau
    - Tests müssen ebenfalls angepasst werden, da diese teilweise mit ``select`` und ``option`` arbeiten
- Boilerplate-Code durch Helperfunctions
- Konflikte der CSS-Klassen (Bsp.: "input-sm")


## Installation

Vuetify ließ sich einfach anhand der [Installationsanweisung](https://vuetifyjs.com/en/getting-started/installation/#webpack-install) der Website ins bestehende Projekt installieren. Damit die bereitgestellten Komponenten funktionieren, musste jedoch noch die Vue-App mit dem "v-app" Tag gewrappt werden.


## Erste Versuche

Eins der meist genutzen "Input"-Elemente im Masterportal ist das Select-Tag. Vuetify bringt sein eigenes Select-Tag [v-select](https://vuetifyjs.com/en/components/selects/) mit, welches ich versuchsweise im **ScaleSwitcher** implementiert habe.  
Dies erzeugt automatisch eigene Ids, ein ``aria-selected`` und eine ``role`` Attribut.   

Im eigentlichen HTML wird jedoch kein ``select`` oder ``option`` Tag verwendet sondern nur divs. Somit entfallen auch teilweise Html-Attribute, wie zum Beispiel der Index der momentan ausgewählten Option, welche über neue Helferfunktion in Vue wiederhergestellt werden müssen.  

Des Weiteren lässt sich die Textdarstellung nicht ohne weiteres bearbeiten. Hierzu müssen die darzustellenden Objekte ein Attribut ``text`` besitzten, in dem der Darstellungsstring enthalten ist (siehe Bsp).

Bsp.: 

Vue Code:
```
<select
    id="scale-switcher-select"
    v-model="scale"
    class="font-arial form-control input-sm pull-left"
    @change="setResolutionByIndex($event.target.selectedIndex)"
>
    <option
        v-for="(scaleValue, i) in scales"
        :key="i"
        :value="scaleValue"
    >
        1 : {{ scaleValue }}
    </option>
</select>
```
Generiertes HTML:
```
<select data-v-3a4d10cb="" data-v-2a3dd68d="" id="scale-switcher-select" class="font-arial form-control input-sm pull-left">
    <option data-v-3a4d10cb="" data-v-2a3dd68d="" value="250000">
        1 : 250000
    </option>
    <option data-v-3a4d10cb="" data-v-2a3dd68d="" value="100000">
        1 : 100000
    </option
    ><option data-v-3a4d10cb="" data-v-2a3dd68d="" value="60000">
        1 : 60000
    </option>
    ...
</select>
```

Vuetify Code:
```
<script>

computed: {
    formattedScales: function () {
            return this.scales.map(scale => {
                return {
                    text: "1:" + scale,
                    value: scale
                };
            });
    }, ...
}

methods: {
    setResolutionWrapper (value) {
        this.setResolutionByIndex(this.scales.indexOf(value));
    }, ...
}
...
</script>


<template>
    <v-select
        id="scale-switcher-select"
        v-model="scale"
        label="Maßstab"
        :items="scales"
        return-object
        @change="setResolutionWrapper($event)"
    />
</template>
```
Generiertes HTML:
```
<div role="listbox" tabindex="-1" class="v-list v-select-list v-sheet theme--light theme--light" data-v-3a4d10cb="true" id="list-50">
    <div tabindex="0" aria-selected="false" id="list-item-61-0" role="option" class="v-list-item v-list-item--link theme--light">
        1:250000
    </div>
    <div tabindex="0" aria-selected="false" id="list-item-61-1" role="option" class="v-list-item v-list-item--link theme--light">
        1:100000
    </div>
    <div tabindex="0" aria-selected="true" id="list-item-61-2" role="option" class="v-list-item primary--text v-list-item--active v-list-item--link theme--light v-list-item--highlighted">
        1:60000
    ...
    </div>
</div>
```





