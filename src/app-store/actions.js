import {getByArraySyntax} from "../../src/utils/fetchFirstModuleConfig";

export default {
    /**
     * Function to check if the deprecated parameters could be specified for more than one location e.g. they (location of the parameter or tool) have multiple possible paths.
    * Furthermore the function checks whether the given paths for the parameters are defined or undefined.
    * @param {String} deprecatedPath - dotted string. The path in the config of the old and deprecated parameter.
    * @param {config} config - the config.json or config.js.
    * @returns {Object} - returns a new config (.json or .js) without the deprecated parameters. They were replaced by the actual ones.
    */
    checkWhereDeprecated (deprecatedPath, config) {
        let updatedConfig = config,
            parameters = {};

        Object.entries(deprecatedPath).forEach((entry) => {
            parameters = this.getDeprecatedParameters(entry, config);

            if (parameters !== undefined && parameters.output !== undefined) {
                updatedConfig = this.replaceDeprecatedCode(parameters, config);
            }
        });
        return updatedConfig;
    },

    /**
     * Function to determine:
     * Firstly: the path as dotted string.
     * Secondly: the output given by the config.json for the path with the deprecated parameter.
     * Thirdly: the deprecated key/parameter itself.
     * @param {Array} entry - Array with the single "steps" / elements of the deprecated path.
     * @param {Object} config - The config.json or config.js.
     * @returns {Object} - returns an object with the three mentioned above parameters.
    */
    getDeprecatedParameters (entry = [], config) {
        const newSplittedPath = entry[0].split(".");
        let oldSplittedPath = "",
            output = "",
            deprecatedKey = "",
            parameters;

        entry[1].forEach((oldPathes) => {
            oldSplittedPath = oldPathes.split(".");
            output = getByArraySyntax(config, oldPathes.split("."));
            if (output === undefined) {
                return;
            }
            deprecatedKey = oldSplittedPath[oldSplittedPath.length - 1];
            parameters = {
                "newSplittedPath": newSplittedPath,
                "oldSplittedPath": oldSplittedPath,
                "output": output,
                "deprecatedKey": deprecatedKey
            };
        });
        return parameters;
    },

    /**
     * Function to find and replace the old deprecated path.
     * Inserts the new and current key into the config instead of the deprecated parameter.
     * The deprecated parameter is deleted. The content is allocated to the new key.
     * @param {Array} parameters - contains the new current parameter to replace the deprecated parameter. Contains also an object which lists the path of the deprecated parameter, the output/content of the deprecated parameter and the deprecated parameter itself.
     * @param {Object} config - the config.json or config.js.
     * @returns {Object} - returns a updated config where the deprecated parameters are replaced by the new and current ones.
    */
    replaceDeprecatedCode (parameters, config) {
        const updatedConfig = {...config},
            output = parameters.output,
            deprecatedKey = parameters.deprecatedKey,
            splittedCurrentPath = parameters.newSplittedPath;
        let current = updatedConfig;

        splittedCurrentPath.forEach((element, index) => {
            if (index === splittedCurrentPath.length - 1 && output !== undefined) {
                current[element] = output;
                console.warn(parameters.deprecatedKey + " is deprecated. Instead, please use the following path/parameter: " + String(parameters.newSplittedPath).replace(/,/g, ".") + " in the config.json. For this session it is automatically replaced.");
            }
            else if (output === undefined) {
                return;
            }
            else {
                if (!current[element]) {
                    current[element] = {};
                }
                current = current[element];
            }
            delete current[deprecatedKey];
        });

        return updatedConfig;
    }
};