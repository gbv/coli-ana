<template>
  <span>
    <a
      v-if="jskos"
      :href="`analyze?notation=${notation}`"
      title="get analysis in JSKOS format">
      <i-mdi-code-braces />
    </a>
    <a
      :href="k10plusLink"
      target="k10plus"
      :title="`search in K10plus catalog`">
      <i-mdi-file-find />
    </a>
    <tippy
      interactive
      :follow-cursor="false"
      placement="top-end">
      <a
        href=""
        @click.prevent="">
        <i-mdi-dots-horizontal />
      </a>
      <template #content>
        <div class="conceptLinks-popover">
          {{ concept.uri }}<br>
          <router-link
            :to="`?notation=${notation}`"
            :title="`show analysis for notation ${notation}`">
            Analyze <i-mdi-file-tree />
          </router-link>
          <span
            v-if="webdeweyLinks.english">
            <br>
            <a
              :href="webdeweyLinks.english"
              target="_blank">
              WebDewey (en)
            </a>
          </span>
          <span
            v-if="webdeweyLinks.german">
            <br>
            <a
              :href="webdeweyLinks.german"
              target="_blank">
              WebDewey (de) <i-mdi-text-box-search-outline />
            </a>
          </span>
          <br>
          <a
            :href="cocodaLink"
            title="Cocoda"
            target="cocoda">
            Cocoda <i-mdi-bird />
          </a>
        </div>
      </template>
    </tippy>

  </span>
</template>

<script>
import config from "../../config"
import jskos from "jskos-tools"

export default {
  props: {
    concept: {
      type: Object,
      required: true,
    },
    jskos: {
      type: Boolean,
      default: false,
    },
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
    },
    webdeweyLinks() {
      const result = {
        german: null,
        english: null,
      }
      let recordIdPrefix = "ddc"
      let notation = jskos.notation(this.concept)
      // Adjust notation
      // 1. Determine postfix
      let postfix
      const postfixMatch = /(.+):(.+)/.exec(notation)
      if (postfixMatch) {
        notation = postfixMatch[1]
        postfix = "%3b1%3b" + postfixMatch[2]
        recordIdPrefix = "int"
      } else {
        postfix = ""
      }
      // 2. Fix ranges with .
      const rangeMatch = /(.+)\.(.+)-.+\.(.+)/.exec(notation)
      if (rangeMatch) {
        notation = `${rangeMatch[1]}.${rangeMatch[2]}-.${rangeMatch[3]}`
      }
      notation += postfix
      // 3. Build URLs
      // result.english = `http://dewey.org/webdewey/index_11.html?recordId=${recordIdPrefix}%3a${notation}`
      result.german = `https://services.dnb.de/dnb-cas/login?service=${encodeURIComponent(`https://deweyde.pansoft.de/webdewey/index_11.html?recordId=${recordIdPrefix}%3a${notation}`)}`
      return result
    },
  },
}
</script>

<style scoped>
.conceptLinks-popover {
  text-align: right;
}
</style>
