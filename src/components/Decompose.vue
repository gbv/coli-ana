<template>
  <main>
    <p v-if="!results">
      Loading
    </p>
    <div v-else>
      <div
        v-for="result in results"
        :key="result.uri">
        <h2>{{ result.notation[0] }}</h2>
        <p v-if="result.memberList.length === 0">
          No decomposition found.
        </p>
        <div
          v-else
          class="decomposition">
          <p>
            <a :href="`decompose?notation=${result.notation[0]}`">JSKOS</a> ・
            <a :href="`decompose?notation=${result.notation[0]}&format=picajson`">PICA/JSON</a> ・
            <a :href="`decompose?notation=${result.notation[0]}&format=pp`">PICA Plain</a> ・
            <a :href="`${cocoda}?fromScheme=${ddc.uri}&from=${ddc.uriFromNotation(result.notation[0])}`">
              open in Cocoda
            </a>
          </p>
          <p>
            <span
              v-for="member in result.memberList"
              :key="member.notation[1]">
              <code>{{ member.notation[1] }}</code> <span class="label">{{ member.prefLabel.de }}</span>
              <br>
            </span>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { watch, ref } from "vue"
import { useRoute } from "vue-router"
// import "cross-fetch/polyfill"
import config from "../../config"

const inBrowser = typeof window !== "undefined"

/**
 * Currently, data is not fetched during SSR. To accomplish this, we need to use a data store like Vuex.
 * For example, see https://ssr.vuejs.org/guide/data.html.
 *
 * TODO
 */

export default {
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
    }

    return {
      ...config,
      results,
    }
  },
}
</script>

<style scoped>

</style>
