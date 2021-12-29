/**
 * User type definition
 * @typedef {Object} AddWMSState
 * @property {Boolean} active if true, AddWMS will rendered
 * @property {String} id id of the AddWMS component
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "addWMS",
    name: "menu.tools.addWms",
    glyphicon: "glyphicon-plus",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true
};

export default state;
