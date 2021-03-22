import {expect} from "chai";
import sinon from "sinon";
import {getFeatureDescription, describeFeatureType} from "../../../wfs/describeFeatureType.js";

describe("src/api/wfs/describeFeatureType.js", () => {
    const json = {
        schema: {
            element: [{
                attributes: {
                    name: "hallo"
                },
                complexType: {
                    complexContent: {
                        extension: {
                            sequence: {
                                element: [{
                                    getAttributes: () => {
                                        return {
                                            name: "first",
                                            type: "string"
                                        };
                                    }
                                },
                                {
                                    getAttributes: () => {
                                        return {
                                            name: "second",
                                            type: "string"
                                        };
                                    }
                                }]
                            }
                        }
                    }
                }
            }]
        }
    };

    beforeEach(function () {
        sinon.spy(console, "error");
    });

    afterEach(function () {
        console.error.restore();
    });

    describe("getFeatureDescription", () => {
        it("should return undefined if the first parameter is a number and call a console error", () => {
            expect(getFeatureDescription(123)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is an empty object and call a console error", () => {
            expect(getFeatureDescription({})).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is an array and call a console error", () => {
            expect(getFeatureDescription([])).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is a boolean and call a console error", () => {
            expect(getFeatureDescription(true)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is a string and call a console error", () => {
            expect(getFeatureDescription("Hallo")).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is undefined and call a console error", () => {
            expect(getFeatureDescription(undefined)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the first parameter is null and call a console error", () => {
            expect(getFeatureDescription(null)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is a number and call a console error", () => {
            expect(getFeatureDescription(json, 123)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is a boolean and call a console error", () => {
            expect(getFeatureDescription(json, true)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is an array and call a console error", () => {
            expect(getFeatureDescription(json, [])).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is an object and call a console error", () => {
            expect(getFeatureDescription(json, {})).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is undefined and call a console error", () => {
            expect(getFeatureDescription(json, undefined)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return undefined if the second parameter is null and call a console error", () => {
            expect(getFeatureDescription(json, null)).to.be.undefined;
            expect(console.error.calledOnce).to.be.true;
        });

        it("should return an array with two objects if featureType was found", () => {
            expect(getFeatureDescription(json, "hallo")).to.be.an("array");
            expect(getFeatureDescription(json, "hallo")[0]).to.be.an("object");
            expect(getFeatureDescription(json, "hallo")[1]).to.be.an("object");
        });

        it("should return an object with the keys name and type", () => {
            expect(getFeatureDescription(json, "hallo")[0]).to.have.all.keys("name", "type");
        });

        it("should return undefined if featureType was not found", () => {
            expect(getFeatureDescription(json, "test")).to.be.undefined;
        });
    });

    describe("describeFeatureType", () => {
        it("should return undefined if request failed", async () => {
            const response = await describeFeatureType("test", "test");

            expect(response).to.be.undefined;
        });
    });
});
