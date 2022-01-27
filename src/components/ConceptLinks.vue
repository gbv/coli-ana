<template>
  <span>
    <a
      v-if="jskos"
      :href="`analyze?notation=${notation}`"
      title="get analysis in JSKOS format">
      <i-mdi-code-braces />
    </a>
    <router-link
      :to="`?notation=${notation}`"
      :title="`show analysis for notation ${notation}`">
      <i-mdi-file-tree />
    </router-link>
    <a
      :href="k10plusLink"
      target="k10plus"
      :title="`search in K10plus catalog`">
      <i-mdi-file-find />
    </a>
    <a
      :href="cocodaLink"
      title="Cocoda"
      target="cocoda">
      <i-mdi-bird />
    </a>
  </span>
</template>

<script>
import config from "../../config"
import { computed } from "vue"

export default {
  props: {
    concept: {
      type: Object,
      required: true,
    },
    jskos: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    notation() {
      return this.concept.notation[0]
    },
    cocodaLink() {
      const uri = this.concept.uri
      return `${config.cocoda}?fromScheme=${encodeURIComponent(config.ddc.uri)}&from=${encodeURIComponent(uri)}`
    },
    k10plusLink() {
      const notation = this.notation.replace(/^(T[^-]+).+:(.+)$/,"$1--$2") // e.g. T1--0901-T1--0905:074) => 074
      return `https://opac.k10plus.de/DB=2.299/CMD?ACT=SRCHA&IKT=3011&TRM=${notation}`
    }
  }
}
</script>
