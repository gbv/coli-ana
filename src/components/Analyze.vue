<template>
  <div
    v-if="!results">
    <loading-spinner />
  </div>
  <template v-else>
    <p v-if="mode === 'lookup' && results.length">
      <pagination
        :page="page"
        :per-page="perPage"
        :results="results" />
    </p>
    <p v-show="resultsWithoutDecomposition.length">
      No decomposition found for:
      <ul>
        <li
          v-for="result in resultsWithoutDecomposition"
          :key="result.uri">
          <item-name
            :item="result" />
        </li>
      </ul>
    </p>
    <p v-if="!results.length && mode === 'lookup'">
      Not found as part of any analysis:
      <ul>
        <li
          v-for="(member, index) in notation.split('|')"
          :key="index">
          {{ member }}
        </li>
      </ul>
    </p>
    <!-- TODO: Use pagination instead of manually limiting to 10 results. -->
    <div
      v-for="result in resultsWithDecomposition.slice(0, 10)"
      :key="result.uri">
      <h4>
        <span
          class="notation-part"
          v-html="notationWithHighlight(result, hovered)" />
        <item-name
          :item="result"
          :show-notation="false" />
        <router-link
          :to="`/?notation=${result.notation[0]}`"
          :title="`show analysis for notation ${result.notation[0]}`">
          ⚛️
        </router-link>
      </h4>
      <div
        class="decomposition">
        <div class="table">
          <div class="row">
            <div class="hierarchy-info" />
            <div
              class="notation-part"
              v-html="notationWithHighlight(result, hovered)" />
          </div>
          <div
            v-for="(member, index) in result.memberList.filter(m => m != null)"
            :key="member.notation[1]"
            :class="{
              row: true,
              'font-weight-bold': result.memberList[index - 1] && isMemberParentOf(result.memberList[index - 1], member) && !isMemberParentOf(member, result.memberList[index + 1]),
              'row-highlight': mode === 'lookup' && notation.split('|').includes(member.notation[0]),
            }"
            @mouseover="hovered = { member, result }"
            @mouseleave="hovered = {}">
            <div class="hierarchy-info">
              <tippy
                v-if="isMemberParentOf(result.memberList[index - 1], member)"
                content="This DDC class is a child of the previous class.">
                ↳
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
                <template #content>
                  <concept-details
                    :concept="member" />
                </template>
              </tippy>
              <tippy
                v-if="!member._loaded"
                content="Info about this DDC class could not be loaded."
                class="loadedIndicator">
                ·
              </tippy>
            </div>
          </div>
          <div
            v-if="result.memberList[result.memberList.length - 1] === null"
            class="row">
            <div class="hierarchy-info" />
            <div class="notation-part">
              Note: This analysis is still incomplete.
            </div>
          </div>
        </div>
        <p>
          PICA: <code>{{ picaFromConcept(result) }}</code>
        </p>
        <p>
          <a :href="`analyze?notation=${result.notation[0]}`">JSKOS</a> ・
          <a :href="`analyze?notation=${result.notation[0]}&format=picajson`">PICA/JSON</a> ・
          <a :href="`analyze?notation=${result.notation[0]}&format=pp`">PICA Plain</a> ・
          <a :href="`${cocoda}?fromScheme=${ddc.uri}&from=${ddc.uriFromNotation(result.notation[0])}`">
            &nesear; open in Cocoda
          </a>
        </p>
      </div>
    </div>
    <p v-if="mode === 'lookup' && results.length">
      <br>
      <pagination
        :page="page"
        :per-page="perPage"
        :results="results" />
    </p>
  </template>
</template>

<script>
import { watch, ref, computed } from "vue"
// import "cross-fetch/polyfill"
import config from "../../config"
import { serializePica, picaFromDDC } from "../../lib/pica.js"

import { store } from "../store.js"

import ConceptDetails from "./ConceptDetails.vue"
import Pagination from "./Pagination.vue"
import ItemName from "./ItemName.vue"
import LoadingSpinner from "./LoadingSpinner.vue"

import jskos from "jskos-tools"

const inBrowser = typeof window !== "undefined"

/**
 * Currently, data is not fetched during SSR. To accomplish this, we need to use a data store like Vuex.
 * For example, see https://ssr.vuejs.org/guide/data.html.
 *
 * TODO
 */

export default {
  components: { ConceptDetails, ItemName, Pagination, LoadingSpinner },
  props: {
    notation: {
      type: String,
      default: "",
    },
    mode: {
      type: String,
      default: "analyze",
    },
    page: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const results = ref(null)
    const resultsWithDecomposition = computed(() => {
      if (!results.value) {
        return []
      }
      return results.value.filter(r => r.memberList.length)
    })
    const resultsWithoutDecomposition = computed(() => {
      if (!results.value) {
        return []
      }
      return results.value.filter(r => !r.memberList.length)
    })

    const hovered = ref({})

    const perPage = 10

    // method to fetch decomposition info
    const fetchDecomposition = async () => {
      const { notation, mode } = props
      if (!notation) {
        results.value = []
        return
      }
      results.value = null
      let url = `analyze?${mode === "lookup" ? "member" : "notation"}=${notation}`
      if (mode === "lookup") {
        // Pagination
        url += `&limit=${perPage}&offset=${(props.page - 1) * perPage}`
      }
      if (!inBrowser) {
        url = `http://localhost:${config.port}/${url}`
      } else {
        url = `${import.meta.env.BASE_URL}${url}`
      }
      try {
        const response = await fetch(url)
        const data = await response.json()
        results.value = data
        const totalCount = response.headers.get("X-Total-Count")
        if (totalCount) {
          results.value.totalCount = totalCount
        }
      } catch (error) {
        results.value = []
        inBrowser && console.warn("Error loading data:", error)
      }
    }

    // fetch decomposition on first load (only browser, see note above)
    if (inBrowser) {
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
        () => results.value,
        async (results) => {
          if (!results) {
            return
          }
          for (let result of results) {
            const [concept, ...memberList] = await store.loadConcepts([].concat(result, result.memberList.filter(m => m != null)))
            // Integrate loaded concepts in results
            store.integrate(result, concept)
            for (let i = 0; i < memberList.length; i += 1) {
              store.integrate(result.memberList[i], memberList[i])
            }
          }
        },
      )
      fetchDecomposition()
    }

    return {
      ...config,
      fetchDecomposition,
      results,
      resultsWithDecomposition,
      resultsWithoutDecomposition,
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
      isMemberParentOf: (member1, member2) => {
        if (!member1 || !member2 || !member2.broader || !member2.broader.length) {
          return false
        }
        return jskos.compare(member1, member2.broader[0])
      },
      picaFromConcept: (concept) => {
        return serializePica(picaFromDDC(concept))
      },
      perPage,
    }
  },
}
</script>

<style scoped>
.table > .row {
  display: flex;
  margin-bottom: 3px;
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
h4 {
  margin-top: 30px;
}
</style>
