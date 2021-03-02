<template>
  <b v-if="showNotation">{{ notation(item) }}</b>
  {{ prefLabel(item) }}
</template>

<script>
import jskos from "jskos-tools"

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    showNotation: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    return {
      notation: jskos.notation,
      // TODO: Do not hardcode German labels.
      prefLabel: item => jskos.prefLabel(item, { language: "de", fallbackToUri: false }),
    }
  },
}
</script>
