import {createI18n} from "vue-i18n";
import de from "../locales_vue/de/common.json";
import en from "../locales_vue/en/common.json";

const exportContainer = {
    instance: null
};

export default exportContainer;

/**
 * Initialization. Wrapped in a function to avoid calling it initially
 * in a mochapack run.
 * @returns {object} VueI18Next instance
 */
export function initiateVueI18Next () {
    exportContainer.instance = createI18n({
        locale: i18next.language,
        fallbackLocale: i18next.options.fallbackLng[0],
        messages: {
            de,
            en
        }
    });

    return exportContainer.instance;
}
