<template>
  <span>
    <router-link
      :to="`/?notation=${concept.notation[0]}`"
      :title="`show analysis for notation ${concept.notation[0]}`">
      ⚛️
    </router-link>
    <a
      :href="`https://opac.k10plus.de/DB=2.299/CMD?ACT=SRCHA&IKT=3011&TRM=${concept.notation[0]}`"
      target="k10plus"
      title="search in K10plus catalog">
      📚
    </a>
    <a
      :href="cocodaLink"
      title="Cocoda"
      target="cocoda">
      &nesear;
    </a>
  </span>
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