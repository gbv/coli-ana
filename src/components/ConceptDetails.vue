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
    <a
      :href="`https://opac.k10plus.de/DB=2.299/CMD?ACT=SRCHA&IKT=3011&TRM=${concept.notation[0]}`"
      target="k10plus"
      title="search in K10plus catalog">
      📚
    </a>
  </p>
</template>

<script>
import jskos from "jskos-tools"
import config from "../../config"
import { computed } from "vue"

export default {
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
