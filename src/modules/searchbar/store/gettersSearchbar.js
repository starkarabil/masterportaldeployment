import state from "./stateSearchbar";
import {generateSimpleGetters} from "../../../global-store/utils/generators";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
