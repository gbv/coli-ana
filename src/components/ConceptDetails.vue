<template>
  <p>
    <item-name
      :item="concept" />
  </p>
  <p>
    {{ concept.uri }}
    <a
      :href="'https://coli-conc.gbv.de/cocoda/app/?fromScheme=http%3A%2F%2Fdewey.info%2Fscheme%2Fedition%2Fe23%2F&from='+concept.uri"
      title="Cocoda"
      target="cocoda">&nesear;</a>
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
