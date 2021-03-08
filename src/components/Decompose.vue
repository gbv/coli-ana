<template>
  <div
    v-if="!results"
    class="section">
    Loading
  </div>
  <template v-else>
    <p v-show="resultsWithoutDecomposition">
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
    <div
      v-for="result in resultsWithDecomposition"
      :key="result.uri">
      <h4>
        <span
          class="notation-part"
          v-html="notationWithHighlight(result, hovered)" />
        <item-name
          :item="result"
          :show-notation="false" />
      </h4>
      <div
        class="decomposition">
        <div class="table">
          <div class="row">
            <div
              class="notation-part"
              v-html="notationWithHighlight(result, hovered)" />
          </div>
          <div
            v-for="member in result.memberList"
            :key="member.notation[1]"
            class="row"
            @mouseover="hovered = member"
            @mouseleave="hovered = null">
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
        </div>
        <p>
          <a :href="`decompose?notation=${result.notation[0]}`">JSKOS</a> ・
          <a :href="`decompose?notation=${result.notation[0]}&format=picajson`">PICA/JSON</a> ・
          <a :href="`decompose?notation=${result.notation[0]}&format=pp`">PICA Plain</a> ・
          <a :href="`${cocoda}?fromScheme=${ddc.uri}&from=${ddc.uriFromNotation(result.notation[0])}`">
            open in Cocoda
          </a>
        </p>
      </div>
    </div>
  </template>
</template>

<script>
import { watch, ref, computed } from "vue"
import { useRoute } from "vue-router"
// import "cross-fetch/polyfill"
import config from "../../config"

import { store } from "../store.js"

import ConceptDetails from "./ConceptDetails.vue"
import ItemName from "./ItemName.vue"

const inBrowser = typeof window !== "undefined"

/**
 * Currently, data is not fetched during SSR. To accomplish this, we need to use a data store like Vuex.
 * For example, see https://ssr.vuejs.org/guide/data.html.
 *
 * TODO
 */

export default {
  components: { ConceptDetails, ItemName },
  async setup() {
    const route = useRoute()
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

    const hovered = ref(null)

    // method to fetch decomposition info
    const fetchDecomposition = async (notation) => {
      if (!notation) {
        results.value = []
        return
      }
      results.value = null
      let url = `decompose?notation=${notation}`
      if (!inBrowser) {
        url = `http://localhost:${config.port}/${url}`
      } else {
        url = `${import.meta.env.BASE_URL}${url}`
      }
      try {
        const response = await fetch(url)
        const data = await response.json()
        results.value = data
      } catch (error) {
        results.value = []
        inBrowser && console.warn("Error loading data:", error)
      }
    }

    // fetch decomposition on first load (only browser, see note above)
    if (inBrowser) {
    // fetch the decomposition when params change
      watch(
        () => route.params.notation,
        async (notation) => {
          await fetchDecomposition(notation)
        },
      )
      fetchDecomposition(route.params.notation)
      // fetch concept info when results changed
      watch(
        () => results.value,
        async (results) => {
          if (!results) {
            return
          }
          for (let result of results) {
            const [concept, ...memberList] = await store.loadConcepts([].concat(result, result.memberList))
            // Integrate loaded concepts in results
            store.integrate(result, concept)
            for (let i = 0; i < memberList.length; i += 1) {
              store.integrate(result.memberList[i], memberList[i])
            }
          }
        },
      )
    }

    return {
      ...config,
      results,
      resultsWithDecomposition,
      resultsWithoutDecomposition,
      hovered,
      /**
       * Highlights part of a result's notation if that part is currently hovered.
       */
      notationWithHighlight: (result, hovered) => {
        const notation = result.notation[0]
        const part = hovered && hovered.notation && hovered.notation[1]
        if (!part) {
          return notation
        }
        const matches = part.match(/([-.]*)([\d.]*)([-.]*)/)
        if (matches.length < 4) {
          return notation
        }
        return `${notation.slice(0, matches[1].length)}<span style="background-color: #000; color: #F6F4F4;">${notation.slice(matches[1].length, matches[1].length + matches[2].length)}</span>${notation.slice(matches[1].length + matches[2].length)}`
      },
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
  font-family: monospace;
  font-size: 14px;
  margin-top: 2px;
}
.table > .row > .label {
  flex: 1;
  padding-left: 10px;
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
