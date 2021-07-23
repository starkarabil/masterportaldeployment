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
            default: "v-text-field",
            validator: function (value) {
                // only these are explicitly supported
                return ["v-text-field", "v-textarea"].indexOf(value) !== -1;
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
        <component
            :is="htmlElement"
            :id="`tool-contact-${inputName}-input`"
            :label="labelText"
            :value="inputValue"
            :rules="[validInput]"
            :messages="$t(
                `common:modules.tools.contact.error.${inputName + (inputName === 'message' ? 'Input' : '')}`,
                {length: minMessageLength}
            )"
            :append-icon="validInput ? 'mdi-check' : ''"
            :aria-describedby="`tool-contact-${inputName}-help`"
            :placeholder="$t(`common:modules.tools.contact.placeholder.${inputName}`)"
            :rows="htmlElement === 'v-textarea' ? rows : ''"
            class="control-label"
            @keyup="changeFunction($event.currentTarget.value)"
        />
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
