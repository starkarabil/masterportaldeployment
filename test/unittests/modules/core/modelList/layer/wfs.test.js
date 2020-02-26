import WFSModel from "@modules/core/modelList/layer/wfs.js";
import Util from "@testUtil";
import {expect} from "chai";
import GeometryCollection from "ol/geom/GeometryCollection";
import Polygon from "ol/geom/Polygon";

describe("core/modelList/layer/wfs", function () {
    let wfsLayer,
        features,
        utilModel;

    before(function () {
        utilModel = new Util();
        features = utilModel.createTestFeatures("resources/testFeatures.xml");
        wfsLayer = new WFSModel();
    });

    describe("checkVersion", function () {
        it("should return false for invalid version", function () {
            expect(wfsLayer.checkVersion("layerName", "layerId", "2.0.0", ["1.1.0"])).to.be.false;
        });
        it("should return false for empty version", function () {
            expect(wfsLayer.checkVersion("layerName", "layerId", "", ["1.1.0"])).to.be.false;
        });
        it("should return true for valid version and two allwoedVersions", function () {
            expect(wfsLayer.checkVersion("layerName", "layerId", "2.0.0", ["1.1.0", "2.0.0"])).to.be.true;
        });
        it("should return true for valid version and one allwoedVersions", function () {
            expect(wfsLayer.checkVersion("layerName", "layerId", "1.1.0", ["1.1.0"])).to.be.true;
        });
    });

    describe("getFeaturesIntersectsGeometry", function () {
        const polygon = new Polygon([[[563559.358, 5935833.936], [563559.358, 5936497.106], [564297.138, 5936497.106], [564297.138, 5935833.936], [563559.358, 5935833.936]]]),
            geometryCollection = new GeometryCollection([polygon]),
            polygon2 = new Polygon([[[573559.358, 5935833.936], [573559.358, 5936497.106], [574297.138, 5936497.106], [574297.138, 5935833.936], [573559.358, 5935833.936]]]),
            geometryCollection2 = new GeometryCollection([polygon2]);

        it("should return an array", function () {
            expect(wfsLayer.getFeaturesIntersectsGeometry(geometryCollection, features)).to.be.an("array");
        });

        it("should return an array with a length of 2", function () {
            expect(wfsLayer.getFeaturesIntersectsGeometry(geometryCollection, features)).to.have.lengthOf(2);
        });

        it("should return an array with a length of 41", function () {
            expect(wfsLayer.getFeaturesIntersectsGeometry(undefined, features)).to.have.lengthOf(41);
        });

        it("should return an array with a length of 0", function () {
            expect(wfsLayer.getFeaturesIntersectsGeometry(geometryCollection2, features)).to.have.lengthOf(0);
        });
    });
});
