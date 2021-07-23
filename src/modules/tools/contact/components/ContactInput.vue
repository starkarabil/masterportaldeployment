<script>
import {minMessageLength} from "../store/constantsContact";

export default {
    name: "ContactInput",
    props: {
        changeFunction: {
            type: Function,
            required: true
        },
        htmlElement: {
            type: String,
            default: "v-input",
            validator: function (value) {
                // only these are explicitly supported
                return ["v-input", "v-textarea"].indexOf(value) !== -1;
            }
        },
        inputName: {
            type: String,
            required: true
        },
        inputType: {
            type: String,
            default: "text"
        },
        inputValue: {
            type: String,
            required: true
        },
        labelText: {
            type: String,
            required: true
        },
        rows: {
            type: Number,
            default: 5
        },
        validInput: {
            type: Boolean,
            required: true
        }
    },
    data: function () {
        return {minMessageLength};
    }
};
</script>

<template>
    <div>
        <div :class="htmlElement === 'v-input' ? 'input-group' : ''">
            <label
                :for="`tool-contact-${inputName}-input`"
            >{{ labelText }}</label>
            <component
                :is="htmlElement"
                :id="`tool-contact-${inputName}-input`"
                :value="inputValue"
                :type="htmlElement === 'v-input' ? inputType : ''"
                :aria-describedby="`tool-contact-${inputName}-help`"
                :placeholder="$t(`common:modules.tools.contact.placeholder.${inputName}`)"
                :rows="htmlElement === 'textarea' ? rows : ''"
                @keyup="changeFunction($event.currentTarget.value)"
            />
        </div>
        <span
            v-if="validInput"
            :class="[
                'glyphicon',
                'glyphicon-ok',
                'form-control-feedback',
                htmlElement === 'textarea' ? 'lift-tick' : ''
            ]"
            aria-hidden="true"
        />
        <span
            v-else
            :id="`tool-contact-${inputName}-help`"
            class="help-block"
        >
            {{ $t(
                `common:modules.tools.contact.error.${inputName + (inputName === "message" ? "Input" : "")}`,
                {length: minMessageLength}
            ) }}
        </span>
    </div>
</template>

<style lang="less" scoped>
.input-group-addon:first-child.force-border {
    border-right: 1px solid #ccc;
}

.has-error .input-group-addon:first-child.force-border {
    border-right: 1px solid #a94442;
}

.has-success .input-group-addon:first-child.force-border {
    border-right: 1px solid #3c763d;
}

.lift-tick {
    margin-top: -4px;
}

.form-control {
    resize: none;
}

.control-label {
    min-width: 65px;
}
</style>
