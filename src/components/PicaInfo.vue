<template>
  <div v-if="concept && concept.notation">
    <div>
      <code>
        <a
          :href="`analyze?notation=${notation}&format=pp`"
          :title="`open API URL for PICA+ data for analyzed notation ${notation}`">
          PICA+
        </a>
        <span v-html="picaplus" />
      </code>
      &#xA0;
      <a
        :href="`analyze?notation=${notation}&format=picajson`"
        title="get this PICA data in PICA/JSON format">
        <i-mdi-code-braces />
      </a>
      <a
        :href="`https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard`"
        title="more about PICA catalog format for this field">
        <i-mdi-help />
      </a>
    </div>
    <div>
      <code>
        <a
          :href="`analyze?notation=${notation}&format=pica3`"
          :title="`open API URL for Pica3 data for analyzed notation ${notation}`">
          Pica3
        </a>
        <span>{{ pica3 }}</span>
      </code>
    </div>
  </div>
</template>

<script>
import { serializePica, picaFromDDC, pica3FromDDC } from "../../lib/pica.js"

export default {
  props: {
    concept: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    notation() { return this.concept.notation[0] },
    pica3() { return pica3FromDDC(this.concept) },
    picaplus() {
      return serializePica(picaFromDDC(this.concept)).replace(/[$](.)/g,"<b>$$$1</b>")
    },
  },
}
</script>
