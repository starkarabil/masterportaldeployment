<script>
import Field from "./Field.vue";
import {mapGetters} from "vuex";
import getters from "../store/gettersWfsSearch";

export default {
    name: "Literal",
    components: {
        Field
    },
    props: {
        literal: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Tools/WfsSearch", Object.keys(getters)),
        suggestions () {
            return this.currentInstance?.suggestions;
        }
    }
};
</script>

<template>
    <Field
        v-if="literal.field"
        v-bind="literal.field"
        :key="`tool-wfsSearch-clause-literal-field-${literal.field.id}-${literal.field.fieldName}`"
        :dropdown-input-uses-id="literal.field.usesId"
        :field-id="literal.field.id"
        :suggestions-config="suggestions"
    />
    <!-- NOTE: This div can be styled for visual highlighting -->
    <div v-else-if="literal.clause">
        <template
            v-for="(lit, i) of literal.clause.literals"
            :key="'tool-wfsSearch-clause-literal' + i"
        >
            <Literal
                :literal="lit"
            />
        </template>
    </div>
</template>

<style scoped>

</style>
