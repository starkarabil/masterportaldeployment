/**
 * User type definition
 * @typedef {Object} filterGeneral
 * @property {Boolean}  active - if true, component is rendered
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {Array}  layers - the layer configuration for filter
 */

export default {
    active: false,
    icon: "bi-funnel-fill",
    id: "filterGeneral",
    name: "common:menu.tools.filter",
    renderToWindow: false,
    resizableWindow: true,
    deactivateGFI: false,
    configs: true,
    layerSelectorVisible: true,
    multiLayerSelector: true,
    layers: []
};
