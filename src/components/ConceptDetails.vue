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
    <router-link
      :to="`/?notation=${concept.notation[0]}&mode=lookup`"
      title="look up member">
      🔍
    </router-link>
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
