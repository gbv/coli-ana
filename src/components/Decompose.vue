<template>
  <div
    v-if="!results"
    class="section">
    Loading
  </div>
  <template v-else>
    <div
      v-for="result in results"
      :key="result.uri"
      class="section">
      <h2><item-name :item="result" /></h2>
      <p v-if="result.memberList.length === 0">
        No decomposition found.
      </p>
      <div
        v-else
        class="decomposition">
        <div class="table">
          <div class="row">
            <div class="notation-part">
              {{ result.notation[0] }}
            </div>
          </div>
          <div
            v-for="member in result.memberList"
            :key="member.notation[1]"
            class="row">
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
import { watch, ref } from "vue"
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
    }
  },
}
</script>

<style scoped>
.table > .row {
  display: flex;
  margin-bottom: 3px;
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
</style>
