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
        <p
          v-else
          class="decomposition">
          <span
            v-for="member in result.memberList"
            :key="member.notation[1]">
            <code>{{ member.notation[1] }}</code> <span class="label">{{ member.prefLabel.de }}</span>
            <br>
          </span>
        </p>
      </div>
    </div>
  </main>
</template>

<script>
import { watch, ref } from "vue"
import { useRoute } from "vue-router"
import "cross-fetch/polyfill"
import config from "../../config"

export default {
  async setup() {
    const route = useRoute()
    const results = ref(null)

    // method to fetch decomposition info
    const fetchDecomposition = async (notation) => {
      const inBrowser = typeof window !== "undefined"
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
        console.warn("Error loading data:", error)
      }
    }

    // fetch the decomposition when params change
    watch(
      () => route.params.notation,
      async (notation) => {
        await fetchDecomposition(notation)
      },
    )

    // fetch decomposition on first load
    fetchDecomposition(route.params.notation)

    return {
      results,
    }
  },
}
</script>

<style scoped>

</style>
