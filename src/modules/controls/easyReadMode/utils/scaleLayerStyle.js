/**
 * scale given attributes of a layer style by a factor
 * @param {String} layerId - The ID of the layer to restyle
 * @param {Number} scaleFactor - the factor to scale the style
 * @param {String[]} attributes - the attributes to alter
 * @todo Update Radio calls to store getters
 * @returns {void}
 */
export default function scaleLayerStyle (layerId, scaleFactor, attributes = ["polygonStrokeWidth", "circleRadius", "clusterCircleRadius"]) {
    const model = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

    if (model && model.get("typ") === "WFS" || model.get("typ") === "GeoJSON") {
        const styleId = model.get("styleId"),
            styleModel = Radio.request("StyleList", "returnModelById", styleId) || Radio.request("StyleList", "getDefaultStyle");

        if (styleModel) {
            styleModel.get("rules").forEach(rule => {
                for (const attr of attributes) {
                    if (typeof rule.style[attr] === "number") {
                        rule.style[attr] *= scaleFactor;
                    }
                }
            });
        }

        // execute the styling function
        model.styling();
    }
}
