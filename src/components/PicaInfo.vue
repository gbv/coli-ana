<template>
  <div v-if="concept && concept.notation">
    <div>
      <code>
        <a :href="`analyze?notation=${notation}&format=pp`">PICA+ </a>
        <span v-html="picaplus" />
      </code>
      &#xA0;
      <a :href="`analyze?notation=${notation}&format=picajson`">PICA/JSON</a>
      &#xA0;
      <a :href="`analyze?notation=${notation}`">JSKOS</a>
      &#xA0;
      <a :href="`https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard`">?</a>
    </div>
    <div>
      <code>
        <a :href="`analyze?notation=${notation}&format=pica3`">Pica3 </a>
        <span>{{pica3}}</span>
      </code>
    </div>
  </div>
</template>

<script>
import { serializePica, picaFromDDC, pica3FromDDC } from "../../lib/pica.js"

export default {
  props: {
    concept: {
      type: Object
    }
  },
  computed: {
    notation() { return this.concept.notation[0] },
    pica3() { return pica3FromDDC(this.concept) },
    picaplus() {
      return serializePica(picaFromDDC(this.concept)).replace(/[$](.)/g,'<b>$$$1</b>')
    }
  },
}
</script>
