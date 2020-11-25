import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsDraw";

describe("src/modules/tools/draw/store/actions/settersDraw.js", () => {
    let commit, dispatch, state, target, getters;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    /**
     * @param {String} id id to use for drawType and options prefix
     * @param {Object} [drawTypeOptions={}] the object to use for the drawType options
     * @param {Object} [gettersOptions={}] additional key value pairs to add to the resulting getters
     * @returns {Object}  a mocked getters for this test
     */
    function createGetters (id, drawTypeOptions = {}, gettersOptions = {}) {
        return Object.assign({
            drawType: {
                id,
                geometry: ""
            },
            getStyleSettings: () => drawTypeOptions
        }, gettersOptions);
    }

    describe("setActive", () => {
        let active,
            request,
            trigger;

        beforeEach(() => {
            request = sinon.spy(() => ({}));
            trigger = sinon.spy();
            state = {
                withoutGUI: false,
                currentInteraction: "draw"
            };
            sinon.stub(Radio, "request").callsFake(request);
            sinon.stub(Radio, "trigger").callsFake(trigger);
        });

        it("should commit as intended if 'active' is false", () => {
            active = false;

            actions.setActive({state, commit, dispatch}, active);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setActive", false]);
            expect(dispatch.notCalled).to.be.true;
        });
        it("should commit and dispatch as intended if 'active' is true", () => {
            active = true;

            actions.setActive({state, commit, dispatch}, active);

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setActive", true]);
            expect(commit.secondCall.args[0]).to.equal("setLayer");
            expect(typeof commit.secondCall.args[1]).to.equal("object");
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true}]);
            expect(dispatch.secondCall.args).to.eql(["createSelectInteractionAndAddToMap", false]);
            expect(dispatch.thirdCall.args).to.eql(["createModifyInteractionAndAddToMap", false]);
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.eql(["Map", "createLayerIfNotExists", "import_draw_layer"]);
        });
        it("should commit and dispatch as intended if 'active' and 'withoutGUI' are true", () => {
            active = true;
            state.withoutGUI = true;

            actions.setActive({state, commit, dispatch}, active);

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setActive", true]);
            expect(commit.secondCall.args[0]).to.equal("setLayer");
            expect(typeof commit.secondCall.args[1]).to.equal("object");
            expect(dispatch.callCount).to.equal(4);
            expect(dispatch.firstCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true}]);
            expect(dispatch.secondCall.args).to.eql(["createSelectInteractionAndAddToMap", false]);
            expect(dispatch.thirdCall.args).to.eql(["createModifyInteractionAndAddToMap", false]);
            expect(dispatch.lastCall.args).to.eql(["toggleInteraction", "draw"]);
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.eql(["Map", "createLayerIfNotExists", "import_draw_layer"]);
        });
    });
    describe("setStyleSettings", () => {
        it("should commit on the mutation key recognized by the current drawType", () => {
            getters = createGetters("drawType");
            actions.setStyleSettings({getters, commit}, "styleSettings");

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setDrawTypeSettings", "styleSettings"]);
        });
    });
    describe("setCircleInnerDiameter", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {circleInnerDiameter: 0, unit: "m"});
            target = {value: "42.5"};

            actions.setCircleInnerDiameter({getters, commit}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {circleInnerDiameter: 42.5, unit: "m"}]);
        });
    });
    describe("setCircleMethod", () => {
        it("should commit as intended", () => {
            const method = Symbol();

            getters = createGetters("test", {circleMethod: null});
            target = {options: [{value: method}], selectedIndex: 0};

            actions.setCircleMethod({commit, getters}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {circleMethod: method}]);
        });
    });
    describe("setCircleOuterDiameter", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {circleOuterDiameter: 0, unit: "m"});
            target = {value: "42.5"};

            actions.setCircleOuterDiameter({getters, commit}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {circleOuterDiameter: 42.5, unit: "m"}]);
        });
    });
    describe("setColor", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {color: [255, 255, 255], opacity: 3});
            target = {options: [{value: "0,1,2"}], selectedIndex: 0};

            actions.setColor({getters, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {color: [0, 1, 2, 3], opacity: 3}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setColorContour", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {colorContour: [255, 255, 255], opacityContour: 3});
            target = {options: [{value: "0,1,2"}], selectedIndex: 0};

            actions.setColorContour({getters, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {colorContour: [0, 1, 2, 3], opacityContour: 3}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setDrawType", () => {
        const geometry = Symbol();

        it("should commit as intended", () => {
            const id = Symbol();

            target = {options: [{id: id, value: geometry}], selectedIndex: 0};
            actions.setDrawType({commit, dispatch}, {target});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setFreeHand", false]);
            expect(commit.secondCall.args).to.eql(["setDrawType", {id, geometry}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
        it("should commit 'true' to 'setFreeHand' if the id of the selectedElement equals 'drawCurve'", () => {
            target = {options: [{id: "drawCurve", value: geometry}], selectedIndex: 0};
            actions.setDrawType({commit, dispatch}, {target});

            expect(commit.calledWithExactly("setFreeHand", true)).to.be.true;
        });
    });
    describe("setFont", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {font: "Courier New"});
            target = {options: [{value: "Arial"}], selectedIndex: 0};

            actions.setFont({commit, dispatch, getters}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {font: "Arial"}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setFontSize", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {fontSize: 10});
            target = {options: [{value: 16}], selectedIndex: 0};

            actions.setFontSize({commit, dispatch, getters}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {fontSize: 16}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setOpacity", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {color: [0, 1, 2, 3], opacity: 3});
            target = {options: [{value: "3.5"}], selectedIndex: 0};

            actions.setOpacity({getters, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {color: [0, 1, 2, 3.5], opacity: 3.5}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setOpacityContour", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {colorContour: [0, 1, 2, 3], opacityContour: 3});
            target = {options: [{value: "3.5"}], selectedIndex: 0};

            actions.setOpacityContour({getters, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {colorContour: [0, 1, 2, 3.5], opacityContour: 3.5}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setPointSize", () => {
        it("should commit as intended", () => {
            target = {options: [{value: "6"}], selectedIndex: 0};

            actions.setPointSize({commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setPointSize", 6]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setStrokeWidth", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {strokeWidth: 1});
            target = {options: [{value: "6"}], selectedIndex: 0};

            actions.setStrokeWidth({commit, dispatch, getters}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {strokeWidth: 6}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setSymbol", () => {
        it("should commit as intended if id is used for the symbol", () => {
            const myIcon = Symbol(),
                otherIcon = Symbol();

            state = {iconList: [{id: otherIcon}, {id: myIcon}]};

            target = {options: [{value: myIcon}], selectedIndex: 0};

            actions.setSymbol({state, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setSymbol", {id: myIcon}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
        it("should commit as intended if caption is used for the symbol", () => {
            const myIcon = Symbol(),
                otherIcon = Symbol();

            state = {iconList: [{caption: otherIcon}, {caption: myIcon}]};

            target = {options: [{value: myIcon}], selectedIndex: 0};

            actions.setSymbol({state, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setSymbol", {caption: myIcon}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setText", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {text: "test"});
            target = {value: "My Text"};

            actions.setText({commit, dispatch, getters}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {text: "My Text"}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setUnit", () => {
        it("should commit as intended", () => {
            getters = createGetters("test", {unit: "m", circleInnerDiameter: 1, circleOuterDiameter: 2});
            target = {options: [{value: "km"}], selectedIndex: 0};

            actions.setUnit({getters, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setTestSettings", {unit: "km", circleInnerDiameter: 1, circleOuterDiameter: 2}]);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["setCircleInnerDiameter", {target: {value: 1}}]);
            expect(dispatch.secondCall.args).to.eql(["setCircleOuterDiameter", {target: {value: 2}}]);
        });
    });
});