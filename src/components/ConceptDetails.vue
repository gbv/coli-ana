<template>
  <p>
    <item-name
      :item="concept" />
  </p>
  <p>
    {{ concept.uri }}
    <a
      :href="cocodaLink"
      title="Cocoda"
      target="cocoda">
      &nesear;
    </a>
  </p>
</template>

<script>
import jskos from "jskos-tools"
import ItemName from "./ItemName.vue"
import config from "../../config"
import { computed } from "vue"

export default {
  components: { ItemName },
  props: {
    concept: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return {
      notation: jskos.notation,
      cocodaLink: computed(() => `${config.cocoda}?fromScheme=${encodeURIComponent(config.ddc.uri)}&from=${encodeURIComponent(props.concept.uri)}`),
    }
  },
}
</script>
