import state from "./stateSearchbar";
import {generateSimpleGetters} from "../../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;