<template>
  <p>
    <item-name
      :item="concept" />
  </p>
  <p>
    {{ concept.uri }}
  </p>
</template>

<script>
import jskos from "jskos-tools"
import ItemName from "./ItemName.vue"

export default {
  components: { ItemName },
  props: {
    concept: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      notation: jskos.notation,
    }
  },
}
</script>
