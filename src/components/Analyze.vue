<template>
  <div
    v-if="!results">
    <loading-spinner />
  </div>
  <template v-else-if="results.length">
    <p v-if="!results[0].memberList.length">
      No decomposition found for
      <item-name
        :item="results[0]" />
    </p>
    <div
      v-for="result in results"
      v-else
      :key="result.uri">
      <div
        class="decomposition">
        <div class="table">
          <div class="row head">
            <div class="hierarchy-info" />
            <div
              class="notation-part"
              v-html="notationWithHighlight(result, hovered)" />
            <div class="label">
              {{ jskos.prefLabel(result, { fallbackToUri: false }) }}
            </div>
            <div>
              <concept-links
                :concept="result"
                :jskos="true" />
            </div>
          </div>
          <div
            v-for="(member, i) in result.memberList.filter(m => m != null)"
            :key="member.notation[1]"
            :class="{
              row: true,
              'font-weight-bold': member.ATOMIC,
            }"
            @mouseover="hovered = { member, result }"
            @mouseleave="hovered = {}">
            <div class="hierarchy-info">
              <tippy
                v-if="isMemberParentOf(result.memberList[i - 1], member)"
                content="This DDC class is a child of the previous class. Click to truncate.">
                <router-link :to="`/?notation=${truncatedNotation(notation, member)}`">
                  ↳
                </router-link>
              </tippy>
            </div>
            <div class="notation-part">
              {{ member.notation[1] }}
            </div>
            <div class="label">
              <tippy interactive>
                <item-name
                  :item="member"
                  :show-notation="false" />
                (<span v-html="notationPlugin(jskos.notation(member), { item: member })" />)
                <template #content>
                  {{ member.uri }}
                </template>
              </tippy>
              <tippy
                v-if="!member._loaded || !member._loaded[language]"
                :content="`Info about this DDC class in ${languages.find(l => l.id === language).label} could not be loaded.`"
                class="loadedIndicator">
                ·
              </tippy>
            </div>
            <div>
              <concept-links
                :concept="member" />
            </div>
          </div>
        </div>
        <div
          v-if="isComplete(result)"
          class="pica-info font-size-small">
          <pica-info
            :concept="result" />
        </div>
        <p v-else>
          ⚠️  This DDC number could not be fully analyzed. Either
          it was not built following current DDC number building
          rules or analysis is incomplete.
        </p>
        <p v-if="results.backend === 'database'">
          This result was retrieved from the database cache. It might be outdated. (See <a
            href="https://coli-conc.gbv.de/coli-ana/#faq"
            target="blank">FAQ</a>)
        </p>
      </div>
      <catalog-titles
        :notation="result.notation[0]" />
    </div>
  </template>
</template>

<script>
import { watch, ref, computed } from "vue"
// import "cross-fetch/polyfill"
import config from "../../config"
import { baseNumberIndex, baseNumberFromIndex } from "../../lib/baseNumber.js"

import { store, languages } from "../store.js"

import ConceptLinks from "./ConceptLinks.vue"
import CatalogTitles from "./CatalogTitles.vue"
import PicaInfo from "./PicaInfo.vue"
import LoadingSpinner from "./LoadingSpinner.vue"

import jskos from "jskos-tools"
import notationPlugin from "../utils/notationPlugin.js"

const isComplete = result => !result.memberList.includes(null)

const isMemberParentOf = (member1, member2) => {
  if (!member1 || !member2 || !member2.broader || !member2.broader.length) {
    return false
  }
  return jskos.compare(member1, member2.broader[0])
}

export default {
  components: { ConceptLinks, CatalogTitles, LoadingSpinner, PicaInfo },
  props: {
    notation: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const results = ref(null)

    const hovered = ref({})

    const language = computed(() => store.languages[0])

    // method to fetch decomposition info
    const fetchDecomposition = async () => {
      const { notation } = props
      if (!notation) {
        results.value = []
        return
      }
      results.value = null
      let url = `analyze?notation=${notation}`
      url = `${import.meta.env.BASE_URL}${url}`
      try {
        const response = await fetch(url)
        const data = await response.json()
        results.value = data
        const backend = response.headers.get("coli-ana-backend")
        results.value.backend = backend
      } catch (error) {
        results.value = []
        console.warn("Error loading data:", error)
      }
    }

    // fetch the decomposition when props change
    watch(
      () => props,
      async () => {
        await fetchDecomposition()
      },
      {
        deep: true,
      },
    )
    // fetch concept info when results changed
    watch(
      () => [results.value, language.value],
      async ([results]) => {
        if (!results) {
          return
        }
        for (let result of results) {
          const [concept] = await store.loadConcepts([].concat(result, result.memberList.filter(Boolean)))
          // Integrate loaded concept in result
          if (jskos.compare(result, concept)) {
            store.integrate(result, concept)
          }

          // Calculate atomic elements.
          const memberList = result.memberList || []

          var i = baseNumberIndex(memberList)
          const baseNumber = baseNumberFromIndex(memberList, i)

          memberList.forEach(member => {
            if (member.notation[0] === baseNumber) {
              member.ATOMIC = true
            }
          })

          for (i++; i<memberList.length; i++) {
            if (isMemberParentOf(memberList[i-1], memberList[i]) && !isMemberParentOf(memberList[i], memberList[i+1])) {
              memberList[i].ATOMIC = true
            }
          }

          if (isComplete(result) && memberList.length) {
            memberList[memberList.length-1].ATOMIC = true
          }

          // Integrate memberList with concepts from store
          // TODO: We need a better solution for this...
          memberList.forEach(member => {
            const conceptFromStore = member && store.getConcept(member)
            if (conceptFromStore) {
              store.integrate(member, conceptFromStore)
            }
          })
        }
      },
    )
    fetchDecomposition()

    return {
      ...config,
      fetchDecomposition,
      results,
      hovered,
      /**
       * Highlights part of a result's notation if that part is currently hovered.
       */
      notationWithHighlight: (result, hovered) => {
        const notation = result.notation[0]
        const part = hovered.member && hovered.member.notation && hovered.member.notation[1]
        if (result !== hovered.result || !part) {
          return notation
        }
        const matches = part.match(/([-.]*)([\d.]*)([-.]*)/)
        if (matches.length < 4) {
          return notation
        }
        return `${notation.slice(0, matches[1].length)}<span style="background-color: #000; color: #F6F4F4;">${notation.slice(matches[1].length, matches[1].length + matches[2].length)}</span>${notation.slice(matches[1].length + matches[2].length)}`
      },
      isMemberParentOf,
      isComplete,
      jskos,
      notationPlugin,
      languages,
      language,
      truncatedNotation(notation, member) {
        const length = member.notation[1].replace(/-+$/,'').length
        return notation.substr(0, length).replace(/[.]$/,'')
      }
    }
  },
}
</script>

<style scoped>
.table > .row {
  display: flex;
  margin-bottom: 3px;
}
.table > .head {
  border-bottom: 1px solid #2121217F;
}
.table > .row.head > .notation-part {
  font-weight: bold;
}
.table > .row:hover {
  background-color: #E9E1E1;
}
.table > .row > .notation-part {
  font-weight: 500;
}
.table > .row.font-weight-bold > .notation-part {
  font-weight: 600;
}
.table > .row > .notation-part, .table > .row > .hierarchy-info {
  font-family: monospace;
  font-size: 14px;
  margin-top: 2px;
}
.table > .row > .hierarchy-info {
  width: 15px;
  user-select: none;
  color: #2121217F;
}
.table > .row > .label {
  flex: 1;
  padding-left: 10px;
}
.row-highlight {
  color: #5780C1;
}
.loadedIndicator {
  color: red;
  font-weight: bold;
  user-select: none;
}
.pica-info {
  padding-top: 1em;
  padding-left: 1em;
}
</style>
