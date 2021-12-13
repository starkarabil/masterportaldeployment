import Model from "@modules/searchbar/komoot/model.js";
import {expect} from "chai";

describe("modules/searchbar/komoot", function () {
    let model = {};

    /**
     * TODO(klamp): @hemmerling: die Funktion benötigt einen Wert aus dem Store
     * der Store ist zur Laufzeit der Tests aber nicht vorhanden
     * das entspr. Value muss gemockt werden
     */
    // const store = {
    //     getters: {"Map/projection": "EPSG:25832"}
    // };

    const config = {
        "searchBar": {
            "komoot": {
                "minChars": 3,
                "serviceId": "11",
                "limit": 20,
                "lang": "de",
                "searchCenter": "[559838.9341991391,5917146.049913655]",
                "bbox": "9.5,53.0,10.4,53.8"
            },
            "visibleWFS": {
                "minChars": 3
            },
            "zoomLevel": 9,
            "placeholder": "Suche nach Adresse/Krankenhaus/B-Plan"
        }
    };

    before(function () {
        model = new Model(config.searchBar.komoot);
    });

    describe("getDisplayString", function () {
        const results = [
            {
                "geometry": {
                    "coordinates": [
                        9.897962293502825,
                        53.4084328
                    ],
                    "type": "Point"
                },
                "type": "Feature",
                "properties": {
                    "osm_id": 609722627,
                    "extent": [
                        9.8978515,
                        53.4084944,
                        9.8980731,
                        53.4083712
                    ],
                    "country": "Deutschland",
                    "city": "Rosengarten",
                    "countrycode": "DE",
                    "postcode": "21224",
                    "county": "Harburg",
                    "type": "house",
                    "osm_type": "W",
                    "osm_key": "building",
                    "housenumber": "1",
                    "street": "Trift",
                    "district": "Leversen",
                    "osm_value": "house",
                    "state": "Niedersachsen"
                }
            },
            {
                "geometry": {
                    "coordinates": [
                        9.90408649187081,
                        53.4384077
                    ],
                    "type": "Point"
                },
                "type": "Feature",
                "properties": {
                    "osm_id": 134756075,
                    "extent": [
                        9.8998587,
                        53.4406679,
                        9.9057158,
                        53.4363206
                    ],
                    "country": "Deutschland",
                    "city": "Rosengarten",
                    "countrycode": "DE",
                    "postcode": "21224",
                    "county": "Harburg",
                    "type": "house",
                    "osm_type": "W",
                    "osm_key": "tourism",
                    "housenumber": "1",
                    "street": "Am Kiekeberg",
                    "district": "Ehestorf",
                    "osm_value": "theme_park",
                    "name": "Freilichtmuseum am Kiekeberg",
                    "state": "Niedersachsen"
                }
            }];

        it("should create DisplayName with missing result name", function () {
            expect(model.getDisplayString(results[0])).to.be.equal("Trift 1, 21224 Rosengarten - Leversen");
        });
        it("should create DisplayName with result name", function () {
            expect(model.getDisplayString(results[1])).to.be.equal("Freilichtmuseum am Kiekeberg, Am Kiekeberg 1, 21224 Rosengarten - Ehestorf");
        });
    });
    /**
     * TODO(klamp): @hemmerling: die Funktion benötigt einen Wert aus dem Store
     * der Store ist zur Laufzeit der Tests aber nicht vorhanden
     * das entspr. Value muss gemockt werden
     */
    // describe("getRequestParameter", function () {
    //     it("should create request parameter with configured parameters and searchstring", function () {
    //         expect(model.getRequestParameter("Hauptbahnhof")).to.be.equal("lang=de&lon=9.9&lat=53.4&bbox=9.5,53.0,10.4,53.8&q=Hauptbahnhof");
    //     });
    // });
});
