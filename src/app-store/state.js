import isMobile from "../utils/isMobile";
import getDpi from "../utils/getDpi";
import isDevMode from "../utils/isDevMode";
import masterPortalVersionNumber from "../utils/masterPortalVersionNumber";

const state = {
    _store: null,
    configJson: null,
    configJs: null,
    mobile: isMobile(), // resize update in ./index.js
    dpi: getDpi(),
    masterPortalVersionNumber,
    isDevMode,
    i18NextInitialized: false,
    idCounter: 1,
    urlParams: {},
    easyReadMode: false // layer styles toggle according to config.json
};

export default state;
